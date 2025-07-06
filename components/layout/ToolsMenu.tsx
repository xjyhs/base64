'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Image, 
  FileText, 
  Type, 
  Globe, 
  Code, 
  Link as LinkIcon,
  Braces,
  Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  Wrench
};

interface ToolsMenuProps {
  currentToolId?: string;
  className?: string;
}

export default function ToolsMenu({ currentToolId, className = '' }: ToolsMenuProps) {
  const locale = useLocale();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const tools = getAllTools();
  const categories = getCategories();

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Menu;
  };

  const renderToolItem = (tool: ToolConfig) => {
    const IconComponent = getIconComponent(tool.icon);
    const isActive = currentToolId === tool.id;
    
    // 构建工具URL - 英文不添加前缀
    const toolUrl = locale === 'en' ? tool.path : `/${locale}${tool.path}`;
    
    return (
      <Link
        key={tool.id}
        href={toolUrl}
        className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-sm ${
          isActive 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'text-gray-700'
        }`}
      >
        <div className={`p-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-100' 
            : 'bg-gray-100 group-hover:bg-gray-200'
        }`}>
          <IconComponent className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-center leading-tight">
          {tool.name[locale as 'zh' | 'en']}
        </span>
      </Link>
    );
  };

  // 桌面端悬停菜单
  const DesktopMenu = () => (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
        <Wrench className="h-4 w-4" />
        <span>{t('toolbox')}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {/* 悬停菜单 - 居中显示 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {categories.map((category) => {
          const categoryTools = getToolsByCategory(category.id);
          const CategoryIcon = getIconComponent(category.icon);
          
          return (
            <div key={category.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 px-0 py-2 text-sm font-semibold text-gray-900 mb-2">
                <CategoryIcon className="h-4 w-4" />
                {category.name[locale as 'zh' | 'en']}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryTools.map(tool => renderToolItem(tool))}
              </div>
              {categories.length > 1 && <hr className="my-3 border-gray-200" />}
            </div>
          );
        })}
      </div>
    </div>
  );

  // 移动端侧边菜单
  const MobileMenu = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {t('toolbox')}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            const CategoryIcon = getIconComponent(category.icon);
            
            return (
              <div key={category.id}>
                <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-900">
                  <CategoryIcon className="h-4 w-4" />
                  {category.name[locale as 'zh' | 'en']}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categoryTools.map(tool => (
                    <div key={tool.id} onClick={() => setIsOpen(false)}>
                      {renderToolItem(tool)}
                    </div>
                  ))}
                </div>
              </div>
            );
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