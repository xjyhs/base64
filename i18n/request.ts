import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { readdirSync } from "fs";
import { join } from "path";

// 自动扫描tools目录下的所有工具
function getToolsList(): string[] {
  try {
    const toolsPath = join(process.cwd(), "i18n", "messages", "tools");
    const toolDirs = readdirSync(toolsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    return toolDirs;
  } catch (e) {
    console.warn("无法扫描tools目录:", e);
    return [];
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
