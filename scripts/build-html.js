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

class HTMLBuilder {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.distDir = path.join(this.rootDir, 'dist');
    this.htmlDir = path.join(this.rootDir, 'html-output');
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
          }
        } catch (error) {
          console.warn(`  ⚠️  无法内联JS: ${jsPath}`, error.message);
        }
      }
    }
    
    return content;
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
   * 生成索引页面
   */
  async generateIndexPage() {
    console.log('📄 生成索引页面...');
    
    const htmlFiles = await this.findHTMLFiles(this.htmlDir);
    const pages = htmlFiles
      .filter(file => !file.includes('404.html'))
      .map(file => ({
        name: path.relative(this.htmlDir, file),
        path: path.relative(this.htmlDir, file),
        fullPath: file
      }));

    const indexContent = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Base64工具 - 静态HTML版本</title>
  <meta name="description" content="专业的Base64编码解码工具，支持图片、PDF等多种格式">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: ['selector', '[data-theme="dark"]']
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-white text-gray-900 font-sans antialiased [data-theme='dark']:bg-gray-900 [data-theme='dark']:text-white">
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 [data-theme='dark']:bg-gray-900/80 [data-theme='dark']:border-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-2 text-xl font-semibold text-gray-900 [data-theme='dark']:text-white">
            <span class="text-2xl">🔗</span>
            <span>Base64工具</span>
          </div>
          <button 
            id="theme-toggle" 
            class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105 [data-theme='dark']:bg-gray-800 [data-theme='dark']:hover:bg-gray-700 [data-theme='dark']:text-gray-400 [data-theme='dark']:hover:text-white"
            aria-label="切换主题"
          >
            <span class="theme-icon text-lg">🌙</span>
          </button>
        </div>
      </div>
    </header>
    
    <main class="flex-1 bg-white [data-theme='dark']:bg-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold text-gray-900 mb-4 [data-theme='dark']:text-white">
            专业 Base64 工具集合
          </h1>
          <p class="text-xl text-gray-600 [data-theme='dark']:text-gray-400">
            本地处理，保护隐私安全
          </p>
        </div>
        
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <a href="/base64-image/index.html" class="group block p-8 bg-white rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 [data-theme='dark']:bg-gray-800 [data-theme='dark']:border-gray-700">
            <div class="text-4xl mb-4">🖼️</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 [data-theme='dark']:text-white [data-theme='dark']:group-hover:text-blue-400">
              图片 Base64 转换器
            </h3>
            <p class="text-gray-600 [data-theme='dark']:text-gray-400">
              支持图片与Base64编码互相转换，支持多种图片格式
            </p>
          </a>
        </div>
      </div>
    </main>
    
    <footer class="border-t border-gray-200 bg-gray-50 [data-theme='dark']:border-gray-800 [data-theme='dark']:bg-gray-800">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-sm text-gray-600 [data-theme='dark']:text-gray-400">
            © 2024 Base64工具. 本地处理，保护隐私安全.
          </p>
        </div>
      </div>
    </footer>
  </div>

  <script>
    // 主题系统
    function initTheme() {
      const themeToggle = document.getElementById('theme-toggle');
      const themeIcon = themeToggle?.querySelector('.theme-icon');
      
      // 获取系统偏好或保存的主题
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      
      document.documentElement.setAttribute('data-theme', initialTheme);
      updateThemeIcon(initialTheme);
      
      // 主题切换
      themeToggle?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // 图标旋转动画
        if (themeIcon) {
          themeIcon.style.transform = 'rotateY(180deg) scale(0.8)';
          setTimeout(() => {
            themeIcon.style.transform = 'rotateY(0deg) scale(1)';
          }, 150);
        }
      });
      
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', newTheme);
          updateThemeIcon(newTheme);
        }
      });
      
      function updateThemeIcon(theme) {
        if (themeIcon) {
          themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
          themeIcon.setAttribute('aria-label', theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式');
        }
      }
    }
    
    // 初始化主题系统
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTheme);
    } else {
      initTheme();
    }
  </script>
</body>
</html>`;

    await fs.writeFile(path.join(this.htmlDir, 'index.html'), indexContent, 'utf8');
    console.log('✅ 索引页面生成完成');
  }

  /**
   * 生成部署信息
   */
  async generateDeployInfo() {
    console.log('📋 生成部署信息...');
    
    const deployInfo = {
      buildTime: new Date().toISOString(),
      version: '1.0.0',
      description: '这是一个Base64工具的静态HTML版本',
      files: [],
    };
    
    function collectFiles(dir, basePath = '') {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const relativePath = path.join(basePath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          collectFiles(filePath, relativePath);
        } else {
          deployInfo.files.push({
            path: relativePath.replace(/\\/g, '/'),
            size: stat.size,
            modified: stat.mtime.toISOString(),
          });
        }
      });
    }
    
    collectFiles(this.htmlDir);
    
    await fs.writeFile(
      path.join(this.htmlDir, 'deploy-info.json'),
      JSON.stringify(deployInfo, null, 2)
    );
    console.log('✅ 部署信息生成完成');
  }

  /**
   * 主构建流程
   */
  async build() {
    console.log('🚀 开始构建HTML静态版本...\n');
    
    try {
      // 1. 清理输出目录
      await this.cleanOutputDir();
      
      // 2. 构建Astro项目
      this.buildAstroProject();
      
      // 3. 复制静态资源
      await this.copyStaticAssets();
      
      // 4. 内联资源优化
      await this.inlineAssets();
      
      // 5. 生成索引页面
      await this.generateIndexPage();
      
      // 6. 生成部署信息
      await this.generateDeployInfo();
      
      console.log('\n🎉 HTML静态版本构建完成！');
      console.log(`📁 输出目录: ${this.htmlDir}`);
      console.log('🌐 可以直接部署到任何静态服务器');
      
    } catch (error) {
      console.error('\n❌ 构建失败:', error.message);
      process.exit(1);
    }
  }
}

// 运行构建
const builder = new HTMLBuilder();
builder.build(); 