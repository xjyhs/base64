#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// 创建require函数用于加载package.json
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPPORTED_LANGUAGES = ['en', 'zh']; // Add supported languages here

class HTMLBuilder {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
    this.htmlDir = path.join(this.rootDir, 'html-output');
    this.translations = {};
  }

  /**
   * Load all translation files
   */
  async loadTranslations() {
    console.log('🌍 Loading translations...');
    for (const lang of SUPPORTED_LANGUAGES) {
      // Load page-specific translations for base64-image
      const pageTranslationPath = path.join(this.rootDir, 'src', 'i18n', 'pages', 'base64-image', `${lang}.json`);
      if (await fs.pathExists(pageTranslationPath)) {
        this.translations[lang] = await fs.readJson(pageTranslationPath);
        console.log(`  ✅ Loaded page translation for ${lang}`);
      } else {
        console.warn(`  ⚠️  Page translation file not found for language: ${lang}`);
      }
    }
    console.log('✅ Translations loaded');
  }

  /**
   * 执行命令并返回结果
   */
  execCommand(command, options = {}) {
    try {
      console.log(`执行命令: ${command}`);
      const result = execSync(command, {
        cwd: this.rootDir,
        encoding: 'utf8',
        stdio: 'inherit',
        ...options
      });
      return result;
    } catch (error) {
      console.error(`命令执行失败: ${command}`);
      console.error(error.message);
      process.exit(1);
    }
  }

  /**
   * 清理输出目录
   */
  async cleanOutputDir() {
    console.log('🧹 清理输出目录...');
    
    if (await fs.pathExists(this.htmlDir)) {
      await fs.remove(this.htmlDir);
    }
    
    await fs.ensureDir(this.htmlDir);
    console.log(`✅ 输出目录已准备: ${this.htmlDir}`);
  }

  /**
   * 构建Astro项目
   */
  buildAstroProject() {
    console.log('🏗️  构建Astro项目...');
    this.execCommand('pnpm build');
    console.log('✅ Astro项目构建完成');
  }

  /**
   * 复制静态资源
   */
  async copyStaticAssets() {
    console.log('📁 复制静态资源...');
    
    const distPath = this.distDir;
    if (!(await fs.pathExists(distPath))) {
      throw new Error(`构建目录不存在: ${distPath}`);
    }

    // 复制所有文件到HTML输出目录
    await fs.copy(distPath, this.htmlDir);
    console.log('✅ 静态资源复制完成');
  }

  /**
   * 内联CSS和JS（可选优化）
   */
  async inlineAssets() {
    console.log('🔗 内联CSS和JS资源...');
    
    const htmlFiles = await this.findHTMLFiles(this.htmlDir);
    
    for (const htmlFile of htmlFiles) {
      await this.processHTMLFile(htmlFile);
    }
    
    console.log('✅ 资源内联完成');
  }

  /**
   * 查找所有HTML文件
   */
  async findHTMLFiles(dir) {
    const files = [];
    
    async function scan(currentDir) {
      const items = await fs.readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await scan(fullPath);
        } else if (path.extname(item) === '.html') {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }

  /**
   * 处理单个HTML文件
   */
  async processHTMLFile(htmlFile) {
    console.log(`处理HTML文件: ${path.relative(this.htmlDir, htmlFile)}`);
    
    let content = await fs.readFile(htmlFile, 'utf8');
    
    // 内联CSS文件
    content = await this.inlineCSS(content, htmlFile);
    
    // 内联小的JS文件（可选）
    content = await this.inlineSmallJS(content, htmlFile);
    
    // 优化HTML
    content = this.optimizeHTML(content);
    
    await fs.writeFile(htmlFile, content, 'utf8');
  }

  /**
   * 内联CSS文件
   */
  async inlineCSS(content, htmlFile) {
    const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
    const htmlDir = path.dirname(htmlFile);
    
    let match;
    while ((match = cssRegex.exec(content)) !== null) {
      const cssPath = match[1];
      
      // 跳过外部链接
      if (cssPath.startsWith('http') || cssPath.startsWith('//')) {
        continue;
      }
      
      const fullCSSPath = path.resolve(htmlDir, cssPath);
      
      if (await fs.pathExists(fullCSSPath)) {
        try {
          const cssContent = await fs.readFile(fullCSSPath, 'utf8');
          const inlineCSS = `<style>${cssContent}</style>`;
          content = content.replace(match[0], inlineCSS);
          console.log(`  ✅ 内联CSS: ${cssPath}`);
        } catch (error) {
          console.warn(`  ⚠️  无法内联CSS: ${cssPath}`, error.message);
        }
      }
    }
    
    return content;
  }

  /**
   * 内联小的JS文件
   */
  async inlineSmallJS(content, htmlFile) {
    const jsRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/g;
    const htmlDir = path.dirname(htmlFile);
    const maxSize = 50 * 1024; // 50KB以下的JS文件才内联
    
    let match;
    while ((match = jsRegex.exec(content)) !== null) {
      const jsPath = match[1];
      
      // 跳过外部链接
      if (jsPath.startsWith('http') || jsPath.startsWith('//')) {
        continue;
      }
      
      const fullJSPath = path.resolve(htmlDir, jsPath);
      
      if (await fs.pathExists(fullJSPath)) {
        try {
          const stat = await fs.stat(fullJSPath);
          if (stat.size <= maxSize) {
            const jsContent = await fs.readFile(fullJSPath, 'utf8');
            const inlineJS = `<script>${jsContent}</script>`;
            content = content.replace(match[0], inlineJS);
            console.log(`  ✅ 内联JS: ${jsPath}`);
          } else {
            // 保持大文件的外部引用，确保路径正确
            console.log(`  ⚠️  保持外部引用 (文件过大): ${jsPath} (${this.formatFileSize(stat.size)})`);
          }
        } catch (error) {
          console.warn(`  ⚠️  无法处理JS: ${jsPath}`, error.message);
        }
      }
    }
    
    return content;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 优化HTML
   */
  optimizeHTML(content) {
    // 移除不必要的空白
    content = content.replace(/>\s+</g, '><');
    
    // 添加HTML5文档类型（如果缺失）
    if (!content.includes('<!DOCTYPE')) {
      content = '<!DOCTYPE html>\n' + content;
    }
    
    return content;
  }

  /**
   * Translate HTML content, adjust paths, and inject scripts
   */
  processAndTranslate(content, lang, destHtmlPath, pageOutputDir) {
    let translatedContent = content;
    const isDefaultLang = lang === SUPPORTED_LANGUAGES[0];

    // 1. Translate text content using recursion - only if not default language
    if (!isDefaultLang && this.translations[lang] && this.translations['en']) {
      const enStrings = this.translations['en'];
      const langStrings = this.translations[lang];
      
      const recursiveReplace = (source, target) => {
        for (const key in source) {
          if (Array.isArray(source[key]) && Array.isArray(target[key])) {
            // Handle arrays (like FAQ items or guide steps)
            for (let i = 0; i < Math.min(source[key].length, target[key].length); i++) {
              if (typeof source[key][i] === 'object' && typeof target[key][i] === 'object') {
                recursiveReplace(source[key][i], target[key][i]);
              }
            }
          } else if (typeof source[key] === 'object' && source[key] !== null && target[key]) {
            recursiveReplace(source[key], target[key]);
          } else if (typeof source[key] === 'string' && typeof target[key] === 'string') {
            if (source[key] && target[key] && source[key].trim() !== '' && target[key].trim() !== '') {
              // Handle HTML encoded source first (since HTML may contain encoded characters)
              const encodedSource = source[key]
                .replace(/&/g, '&amp;')   // &符号要先处理，避免冲突
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              
              const encodedTarget = target[key]
                .replace(/&/g, '&amp;')   // &符号要先处理，避免冲突
                .replace(/'/g, '&#39;')
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              
              // Escape special regex characters for both versions
              const escapedEncodedSource = encodedSource.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              const escapedSource = source[key].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              
              // Replace HTML encoded version first, then original
              const encodedRegex = new RegExp(escapedEncodedSource, 'g');
              translatedContent = translatedContent.replace(encodedRegex, encodedTarget);
              
              const regex = new RegExp(escapedSource, 'g');
              translatedContent = translatedContent.replace(regex, target[key]);
            }
          }
        }
      };
      
      recursiveReplace(enStrings, langStrings);
    }
    
    // 2. Adjust asset paths to be relative to the new scoped structure
    const htmlFileDir = path.dirname(destHtmlPath);
    const relativePathToPageRoot = path.relative(htmlFileDir, pageOutputDir);
    const assetBasePath = relativePathToPageRoot ? relativePathToPageRoot.replace(/\\/g, '/') : '.';
    
    // Make all root links relative to the page root, e.g., href="/_astro/..." becomes href="../_astro/..."
    translatedContent = translatedContent.replace(/(href|src)="\//g, (match, p1) => `${p1}="${assetBasePath}/`);

    // Also adjust astro-island component and renderer URLs
    translatedContent = translatedContent.replace(/(component-url|renderer-url)="\//g, (match, p1) => `${p1}="${assetBasePath}/`);

    // 3. Inject translations for client-side components
    if (this.translations[lang]) {
      const script = `<script>window.translations = ${JSON.stringify(this.translations[lang])};</script>`;
      translatedContent = translatedContent.replace('</head>', `${script}</head>`);
    }

    // 4. Inject language switcher with relative paths
    const currentLangName = lang === 'en' ? 'English' : '中文';
    const otherLangs = SUPPORTED_LANGUAGES.filter(l => l !== lang).map(l => {
        const isLDefault = l === SUPPORTED_LANGUAGES[0];
        let targetPath = '';

        if (isDefaultLang && !isLDefault) { // From EN page to ZH page
          targetPath = `./${l}/index.html`; 
        } else if (!isDefaultLang && isLDefault) { // From ZH page to EN page
          targetPath = `../index.html`;
        }
        
        if (targetPath) {
          const langName = l === 'en' ? 'English' : '中文';
          return `<a href="${targetPath}" lang="${l}" hreflang="${l}" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">${langName}</a>`;
        }
        return '';
    }).join('');

    const langSwitcher = `
      <div class="relative">
        <button id="lang-switcher-btn" class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
          <span>${currentLangName}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div id="lang-switcher-menu" class="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 hidden">
          ${otherLangs}
        </div>
      </div>
      <script>
        (function() {
          const btn = document.getElementById('lang-switcher-btn');
          const menu = document.getElementById('lang-switcher-menu');
          
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('hidden');
          });
          
          document.addEventListener('click', function() {
            menu.classList.add('hidden');
          });
          
          menu.addEventListener('click', function(e) {
            e.stopPropagation();
          });
        })();
      </script>
    `;
    
    translatedContent = translatedContent.replace('<div id="lang-switcher-placeholder"></div>', langSwitcher);

    // 5. Adjust main lang attribute
    const langCode = lang === 'zh' ? 'zh-CN' : 'en';
    translatedContent = translatedContent.replace(/<html lang="[^"]*"/, `<html lang="${langCode}"`);

    return translatedContent;
  }

  /**
   * 主构建流程
   */
  async build() {
    console.log('🚀 开始构建HTML静态版本...\n');
    
    try {
      // 0. Load translations
      await this.loadTranslations();

      // 1. 清理输出目录
      await this.cleanOutputDir();
      
      // 2. 构建Astro项目
      this.buildAstroProject();
      
      const allDistFiles = await fs.readdir(this.distDir);
      const rootFiles = allDistFiles.filter(f => !fs.statSync(path.join(this.distDir, f)).isDirectory());
      const htmlFiles = await this.findHTMLFiles(this.distDir);
      const pageDirs = [...new Set(htmlFiles.map(f => path.dirname(path.relative(this.distDir, f))))];

      // 3. Create page structures and copy scoped assets
      console.log('📦 Scoping assets per page...');
      for (const pageDir of pageDirs) {
        const outputPageDir = path.join(this.htmlDir, pageDir);
        await fs.ensureDir(outputPageDir);
        
        // Copy _astro
        const assetDir = path.join(this.distDir, '_astro');
        if (await fs.pathExists(assetDir)) {
            await fs.copy(assetDir, path.join(outputPageDir, '_astro'));
        }
        
        // Copy other root files (favicon, etc.)
        for (const rootFile of rootFiles) {
          if (!rootFile.endsWith('.html')) { // Don't copy root html files here
            await fs.copy(path.join(this.distDir, rootFile), path.join(outputPageDir, rootFile));
          }
        }
      }
      console.log('✅ Assets scoped.');

      // 4. Process and translate HTML for each page and language
      for (const htmlFile of htmlFiles) {
        const relativeHtmlPath = path.relative(this.distDir, htmlFile);
        const pageDir = path.dirname(relativeHtmlPath);

        for (const lang of SUPPORTED_LANGUAGES) {
          const isDefaultLang = lang === SUPPORTED_LANGUAGES[0];
          const langSubDir = isDefaultLang ? '' : lang;
          const destDir = path.join(this.htmlDir, pageDir, langSubDir);
          await fs.ensureDir(destDir);
          const destPath = path.join(destDir, path.basename(htmlFile));

          console.log(`[${lang}] Processing ${relativeHtmlPath} -> ${path.relative(this.rootDir, destPath)}`);

          let content = await fs.readFile(htmlFile, 'utf8');
          content = this.processAndTranslate(content, lang, destPath, path.join(this.htmlDir, pageDir));
          
          content = await this.inlineCSS(content, destPath);
          content = await this.inlineSmallJS(content, destPath);
          content = this.optimizeHTML(content);
          
          await fs.writeFile(destPath, content, 'utf8');
        }
      }
      
      console.log('\n🎉 HTML静态版本构建完成！');
      console.log(`📁 输出目录: ${this.htmlDir}`);
      
    } catch (error) {
      console.error('\n❌ 构建失败:', error.message);
      process.exit(1);
    }
  }
}

// 运行构建
const builder = new HTMLBuilder();
builder.build(); 