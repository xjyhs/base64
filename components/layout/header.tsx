"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import LocaleToggle from "@/components/locale/toggle";
import { FileImage } from "lucide-react";
import ToolsMenu from "@/components/layout/ToolsMenu";

export default function Header() {
  const t = useTranslations('metadata');
  const pathname = usePathname();

  // 从路径中提取工具ID
  const getCurrentToolId = () => {
    const match = pathname.match(/\/tools\/([^\/]+)/);
    return match ? match[1] : undefined;
  };

  const currentToolId = getCurrentToolId();

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* 左侧：网站图标和名称 */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileImage className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">
            {t('title')}
          </span>
        </Link>

        {/* 中间：工具菜单 */}
        <div className="flex-1 flex justify-center">
          <ToolsMenu currentToolId={currentToolId} />
        </div>

        {/* 右侧：语言切换 */}
        <div className="flex items-center">
          <LocaleToggle />
        </div>
      </div>
    </header>
  );
} 