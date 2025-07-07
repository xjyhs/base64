import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// 自动扫描tools目录下的所有工具
function getToolsList(): string[] {
  // 在 Cloudflare 环境下使用静态列表，避免文件系统访问
  if (process.env.CF_PAGES || typeof window !== 'undefined') {
    return [
      'base64-text', 
      'base64-image', 
      'base64-pdf', 
      'base64-json', 
      'base64-xml', 
      'base64-excel', 
      'base64-hex'
    ];
  }
  
  // 开发环境可以使用文件系统扫描
  try {
    const { readdirSync } = require("fs");
    const { join } = require("path");
    const toolsPath = join(process.cwd(), "i18n", "messages", "tools");
    const toolDirs = readdirSync(toolsPath, { withFileTypes: true })
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => dirent.name);
    return toolDirs;
  } catch (e) {
    console.warn("无法扫描tools目录:", e);
    // 降级到静态列表
    return [
      'base64-text', 
      'base64-image', 
      'base64-pdf', 
      'base64-json', 
      'base64-xml', 
      'base64-excel', 
      'base64-hex'
    ];
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  if (["zh-CN"].includes(locale)) {
    locale = "zh";
  }

  if (!routing.locales.includes(locale as any)) {
    locale = "en";
  }

  try {
    // 加载公共翻译
    const publicMessages = (await import(`./messages/public/${locale.toLowerCase()}.json`)).default;
    
    // 自动扫描并加载工具翻译
    const toolsMessages: Record<string, any> = {};
    const toolsList = getToolsList();
    
    // 扫描并加载所有工具的翻译文件
    for (const tool of toolsList) {
      try {
        const toolMessages = (await import(`./messages/tools/${tool}/${locale.toLowerCase()}.json`)).default;
        toolsMessages[tool] = toolMessages;
      } catch (e) {
        console.warn(`无法加载 tools/${tool}/${locale.toLowerCase()}.json 翻译文件`);
      }
    }
    
    // 合并所有翻译
    const mergedMessages = {
      ...publicMessages,
      tools: toolsMessages
    };
    
    return {
      locale: locale,
      messages: mergedMessages,
    };
  } catch (e) {
    console.error(`加载翻译文件失败: ${e}`);
    // 降级到public目录下的翻译文件
    try {
      const fallbackMessages = (await import(`./messages/public/${locale.toLowerCase()}.json`)).default;
      return {
        locale: locale,
        messages: fallbackMessages,
      };
    } catch (fallbackError) {
      // 最后降级到英文public翻译
      try {
        const enMessages = (await import(`./messages/public/en.json`)).default;
        return {
          locale: "en",
          messages: enMessages,
        };
      } catch (finalError) {
        console.error("所有翻译文件加载失败:", finalError);
        return {
          locale: "en",
          messages: {},
        };
      }
    }
  }
});
