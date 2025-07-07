import { ToolConfig, getToolById } from '@/lib/config/tools';

/**
 * 根据当前路径获取工具ID
 */
export function getToolIdFromPath(pathname: string): string | null {
  // 匹配 /zh/tools/tool-name 或 /en/tools/tool-name 格式
  const match = pathname.match(/^\/(?:zh|en)\/tools\/([^\/]+)/);
  return match ? match[1] : null;
}

/**
 * 获取工具的完整URL
 */
export function getToolUrl(toolId: string, locale: string = 'zh'): string {
  const tool = getToolById(toolId);
  if (!tool) return '/';
  
  return `/${locale}${tool.path}`;
}

/**
 * 检查工具是否存在
 */
export function isValidTool(toolId: string): boolean {
  return getToolById(toolId) !== undefined;
}

/**
 * 获取工具的SEO元数据
 */
export function getToolMetadata(toolId: string, locale: 'zh' | 'en' = 'zh') {
  const tool = getToolById(toolId);
  if (!tool) return null;
  
  return {
    title: tool.name[locale],
    description: tool.name[locale],
    keywords: tool.name[locale],
  };
}

/**
 * 生成工具的面包屑导航
 */
export function generateToolBreadcrumbs(toolId: string, locale: 'zh' | 'en' = 'zh') {
  const tool = getToolById(toolId);
  if (!tool) return [];
  
  return [
    {
      label: locale === 'zh' ? '首页' : 'Home',
      href: `/${locale}`
    },
    {
      label: locale === 'zh' ? '工具' : 'Tools',
      href: `/${locale}/tools`
    },
    {
      label: tool.name[locale],
      href: `/${locale}${tool.path}`
    }
  ];
} 