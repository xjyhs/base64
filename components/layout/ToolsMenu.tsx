'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Image, 
  FileText, 
  Type, 
  Globe, 
  Code, 
  Link as LinkIcon,
  Braces,
  Wrench,
  Hash,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAllTools, getCategories, getToolsByCategory, type ToolConfig } from '@/lib/config/tools';

// 图标映射
const iconMap = {
  Image,
  FileText,
  Type,
  Globe,
  Code,
  Link: LinkIcon,
  Braces,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Wrench,
  Hash,
  FileSpreadsheet,
  FileCode
};

interface ToolsMenuProps {
  currentToolId?: string;
  className?: string;
}

export default function ToolsMenu({ currentToolId, className = '' }: ToolsMenuProps) {
  const locale = useLocale();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const tools = getAllTools();
  const categories = getCategories();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Menu;
  };

  // 构建工具URL
  const getToolUrl = (tool: ToolConfig) => {
    return locale === 'en' ? tool.path : `/${locale}${tool.path}`;
  };

  // 简化工具名称以节省空间
  const getCompactToolName = (tool: ToolConfig) => {
    const name = tool.name[locale as 'zh' | 'en'];
    if (locale === 'zh') {
      return name
        .replace('Base64 ', '')
        .replace(' 转换器', '')
        .replace('转换器', '');
    } else {
      return name
        .replace('Base64 ', '')
        .replace(' Converter', '')
        .replace('Converter', '');
    }
  };

  // 获取分类显示名称
  const getCategoryDisplayName = (category: any) => {
    if (locale === 'zh') {
      return 'Base64转换';
    } else {
      return 'Base64 Tools';
    }
  };

  // 处理桌面端悬停事件
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsDesktopOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDesktopOpen(false);
    }, 150); // 150ms 延时，避免鼠标移动到下拉内容时意外关闭
  };

  // 桌面端紧凑下拉菜单
  const DesktopMenu = () => {
    // 使用第一个分类作为主按钮显示
    const mainCategory = categories[0];
    const categoryTools = getToolsByCategory(mainCategory.id);
    const CategoryIcon = getIconComponent(mainCategory.icon);

    return (
      <DropdownMenu open={isDesktopOpen} onOpenChange={setIsDesktopOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-1.5 px-2 py-1.5 h-8 text-sm"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <CategoryIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{getCategoryDisplayName(mainCategory)}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          className="w-72 p-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="grid grid-cols-3 gap-1">
            {categoryTools.map((tool) => {
              const IconComponent = getIconComponent(tool.icon);
              const isActive = currentToolId === tool.id;
              
              return (
                <Link
                  key={tool.id}
                  href={getToolUrl(tool)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 text-xs rounded-md transition-colors hover:bg-gray-50 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => setIsDesktopOpen(false)}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-center leading-tight">{getCompactToolName(tool)}</span>
                </Link>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // 移动端紧凑侧边菜单
  const MobileMenu = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden p-1.5">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4" />
            {getCategoryDisplayName(categories[0])}
          </SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            
            return categoryTools.map((tool) => {
              const IconComponent = getIconComponent(tool.icon);
              const isActive = currentToolId === tool.id;
              
              return (
                <Link
                  key={tool.id}
                  href={getToolUrl(tool)}
                  onClick={() => setIsOpen(false)}
                  className={`flex flex-col items-center gap-2 px-3 py-3 text-xs rounded-lg transition-colors border ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium border-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate text-center leading-tight">{getCompactToolName(tool)}</span>
                </Link>
              );
            });
          })}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className={className}>
      {/* 桌面端菜单 */}
      <div className="hidden md:block">
        <DesktopMenu />
      </div>
      
      {/* 移动端菜单 */}
      <MobileMenu />
    </div>
  );
} 