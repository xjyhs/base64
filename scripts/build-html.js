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

// 从配置文件读取语言信息
const languageConfigPath = path.resolve(__dirname, '..', 'src', 'config', 'languages.json');
let SUPPORTED_LANGUAGES;
let DEFAULT_LANGUAGE;

try {
  const languageConfig = await fs.readJson(languageConfigPath);
  SUPPORTED_LANGUAGES = languageConfig.supportedLanguages.map(lang => lang.code);
  DEFAULT_LANGUAGE = languageConfig.defaultLanguage;
  console.log(`📝 Loaded language configuration: default=${DEFAULT_LANGUAGE}, supported=[${SUPPORTED_LANGUAGES.join(', ')}]`);
} catch (error) {
  console.warn('⚠️  Unable to load language configuration, using fallback');
  SUPPORTED_LANGUAGES = ['en', 'zh'];
  DEFAULT_LANGUAGE = 'en';
}

class HTMLBuilder {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
    this.htmlDir = path.join(this.rootDir, 'html-output');
    this.translations = {};
    this.pageTranslations = {}; // 存储每个页面的翻译
  }

  /**
   * 自动扫描并加载所有翻译文件
   */
  async loadTranslations() {
    console.log('🌍 Loading translations...');
    
    // 扫描翻译目录，自动发现所有页面
    const i18nPagesDir = path.join(this.rootDir, 'src', 'i18n', 'pages');
    
    if (await fs.pathExists(i18nPagesDir)) {
      const pageNames = await fs.readdir(i18nPagesDir);
      
      for (const pageName of pageNames) {
        const pageDir = path.join(i18nPagesDir, pageName);
        const stat = await fs.stat(pageDir);
        
        if (stat.isDirectory()) {
          console.log(`  📄 Found page: ${pageName}`);
          this.pageTranslations[pageName] = {};
          
          // 为每个页面加载所有语言的翻译
          for (const lang of SUPPORTED_LANGUAGES) {
            const translationPath = path.join(pageDir, `${lang}.json`);
            
            if (await fs.pathExists(translationPath)) {
              this.pageTranslations[pageName][lang] = await fs.readJson(translationPath);
              console.log(`    ✅ Loaded ${lang} translation for ${pageName}`);
            } else {
              console.warn(`    ⚠️  Translation file not found: ${pageName}/${lang}.json`);
            }
          }
        }
      }
    } else {
      console.warn('⚠️  i18n pages directory not found');
    }
    
    console.log('✅ All translations loaded');
  }

  /**
   * 根据页面路径获取对应的翻译
   */
  getPageTranslations(htmlFilePath) {
    // 从HTML文件路径推断页面名称
    const relativePath = path.relative(this.distDir, htmlFilePath);
    const pathParts = relativePath.split(path.sep);
    
    // 假设页面结构是 /page-name/index.html
    const pageName = pathParts[0];
    
    return this.pageTranslations[pageName] || {};
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
      
      // 处理绝对路径，从页面目录查找CSS文件
      let fullCSSPath;
      if (cssPath.startsWith('/')) {
        // 绝对路径：从页面根目录查找
        const pageDir = path.dirname(htmlFile);
        fullCSSPath = path.join(pageDir, cssPath.substring(1)); // 去掉开头的 /
      } else {
        // 相对路径：从HTML文件目录查找
        fullCSSPath = path.resolve(htmlDir, cssPath);
      }
      
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
      
      // 处理绝对路径，从页面目录查找JS文件
      let fullJSPath;
      if (jsPath.startsWith('/')) {
        // 绝对路径：从页面根目录查找
        const pageDir = path.dirname(htmlFile);
        fullJSPath = path.join(pageDir, jsPath.substring(1)); // 去掉开头的 /
      } else {
        // 相对路径：从HTML文件目录查找
        fullJSPath = path.resolve(htmlDir, jsPath);
      }
      
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
  processAndTranslate(content, lang, destHtmlPath, pageOutputDir, htmlFilePath) {
    let translatedContent = content;
    const isDefaultLang = lang === DEFAULT_LANGUAGE;
    
    // 获取当前页面的翻译
    const pageTranslations = this.getPageTranslations(htmlFilePath);
    
    // 1. Translate text content using recursion - only if not default language
    if (!isDefaultLang && pageTranslations[lang] && pageTranslations['en']) {
      const enStrings = pageTranslations['en'];
      const langStrings = pageTranslations[lang];
      
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

    // 2. Inject translations for client-side components
    if (pageTranslations[lang]) {
      const script = `<script>window.translations = ${JSON.stringify(pageTranslations[lang])};</script>`;
      translatedContent = translatedContent.replace('</head>', `${script}</head>`);
    }

    // 3. Adjust main lang attribute
    const langCode = lang === 'zh' ? 'zh-CN' : 'en';
    translatedContent = translatedContent.replace(/<html lang="[^"]*"/, `<html lang="${langCode}"`);

    return translatedContent;
  }

  /**
   * 预处理Astro源文件，为不同语言版本设置正确的参数
   */
  async preprocessAstroSources(lang) {
    const srcPagesDir = path.join(this.rootDir, 'src', 'pages');
    const astroFiles = await this.findAstroFiles(srcPagesDir);
    
    for (const astroFile of astroFiles) {
      await this.updateAstroLanguageParams(astroFile, lang);
    }
  }

  /**
   * 查找所有Astro文件
   */
  async findAstroFiles(dir) {
    const files = [];
    
    async function scan(currentDir) {
      const items = await fs.readdir(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await scan(fullPath);
        } else if (path.extname(item) === '.astro') {
          files.push(fullPath);
        }
      }
    }
    
    await scan(dir);
    return files;
  }

  /**
   * 更新Astro文件中的语言参数
   */
  async updateAstroLanguageParams(astroFile, targetLang) {
    let content = await fs.readFile(astroFile, 'utf8');
    
    // 查找并更新语言检测逻辑
    const langDetectionRegex = /const currentLang = Astro\.url\.pathname\.includes\('\/zh\/'\) \? 'zh' : 'en';/g;
    const newLangDetection = `const currentLang = '${targetLang}';`;
    
    if (langDetectionRegex.test(content)) {
      content = content.replace(langDetectionRegex, newLangDetection);
      await fs.writeFile(astroFile, content, 'utf8');
      console.log(`  📝 Updated language parameter in ${path.relative(this.rootDir, astroFile)} to ${targetLang}`);
    }
  }

  /**
   * 恢复Astro源文件的原始状态
   */
  async restoreAstroSources() {
    // 使用git恢复原始文件
    try {
      this.execCommand('git checkout -- src/pages/', { stdio: 'pipe' });
      console.log('✅ Astro源文件已恢复');
    } catch (error) {
      console.warn('⚠️  无法使用git恢复源文件，请手动检查src/pages/目录');
    }
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
      
      // 2. 为每种语言构建独立版本
      for (const lang of SUPPORTED_LANGUAGES) {
        console.log(`\n🌍 构建 ${lang} 语言版本...`);
        
        // 2.1 预处理Astro源文件，设置当前语言
        await this.preprocessAstroSources(lang);
        
        // 2.2 构建Astro项目
        console.log(`🏗️  构建Astro项目 (${lang})...`);
        this.execCommand('pnpm build');
        
        // 2.3 处理构建结果
        const htmlFiles = await this.findHTMLFiles(this.distDir);
        const allDistFiles = await fs.readdir(this.distDir);
        const rootFiles = allDistFiles.filter(f => !fs.statSync(path.join(this.distDir, f)).isDirectory());
        const pageDirs = [...new Set(htmlFiles.map(f => path.dirname(path.relative(this.distDir, f))))];

        // 2.4 复制资源和处理HTML
        for (const htmlFile of htmlFiles) {
          const relativeHtmlPath = path.relative(this.distDir, htmlFile);
          const pageDir = path.dirname(relativeHtmlPath);
          
          const isDefaultLang = lang === DEFAULT_LANGUAGE;
          const langSubDir = isDefaultLang ? '' : lang;
          const destDir = path.join(this.htmlDir, pageDir, langSubDir);
          await fs.ensureDir(destDir);
          const destPath = path.join(destDir, path.basename(htmlFile));

          console.log(`  📄 处理 ${relativeHtmlPath} -> ${path.relative(this.rootDir, destPath)}`);

          // 复制_astro资源
          const assetDir = path.join(this.distDir, '_astro');
          if (await fs.pathExists(assetDir)) {
            await fs.copy(assetDir, path.join(destDir, '_astro'));
          }
          
          // 复制其他根文件 (favicon, etc.)
          for (const rootFile of rootFiles) {
            if (!rootFile.endsWith('.html')) {
              await fs.copy(path.join(this.distDir, rootFile), path.join(destDir, rootFile));
            }
          }

          // 处理HTML内容
          let content = await fs.readFile(htmlFile, 'utf8');
          content = this.processAndTranslate(content, lang, destPath, path.join(this.htmlDir, pageDir), htmlFile);
          
          content = await this.inlineCSS(content, destPath);
          content = await this.inlineSmallJS(content, destPath);
          content = this.optimizeHTML(content);
          
          await fs.writeFile(destPath, content, 'utf8');
        }
      }
      
      // 3. 恢复Astro源文件
      await this.restoreAstroSources();
      
      console.log('\n🎉 HTML静态版本构建完成！');
      console.log(`📁 输出目录: ${this.htmlDir}`);
      
    } catch (error) {
      console.error('\n❌ 构建失败:', error.message);
      
      // 确保在失败时也恢复源文件
      try {
        await this.restoreAstroSources();
      } catch (restoreError) {
        console.error('❌ 恢复源文件失败:', restoreError.message);
      }
      
      process.exit(1);
    }
  }
}

// 运行构建
const builder = new HTMLBuilder();
builder.build(); 