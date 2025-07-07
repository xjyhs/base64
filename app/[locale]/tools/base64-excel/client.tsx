'use client';

import { useRef, useMemo } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileSpreadsheet, ChevronDown, Sparkles, Target, Zap, Users, Eye, Download, Copy, Upload, Trash2, FileText, BarChart3, Database, Code, Shuffle } from 'lucide-react';
import Base64ExcelConverter from '@/components/tools/Base64ExcelConverter';

export default function Base64ExcelPageClient() {
  const t = useTranslations('tools.base64-excel');
  const messages = useMessages();
  const toolSectionRef = useRef<HTMLElement>(null);

  const scrollToTool = () => {
    if (toolSectionRef.current) {
      const elementTop = toolSectionRef.current.offsetTop;
      const offset = 0;
      
      window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
    }
  };

  // 获取特性数据
  const features = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-excel']?.page?.features?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取用例数据
  const useCases = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-excel']?.page?.useCases?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取步骤数据
  const steps = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-excel']?.page?.steps?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取FAQ数据
  const faqs = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-excel']?.page?.faq?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'bidirectional':
        return <Shuffle className="h-6 w-6" />;
      case 'preview':
        return <Eye className="h-6 w-6" />;
      case 'multiSheet':
        return <FileSpreadsheet className="h-6 w-6" />;
      case 'validation':
        return <Zap className="h-6 w-6" />;
      case 'statistics':
        return <BarChart3 className="h-6 w-6" />;
      case 'download':
        return <Download className="h-6 w-6" />;
      default:
        return <FileSpreadsheet className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部区域 */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl">
                <FileSpreadsheet className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            {t('page.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            {t('page.hero.description')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {t('page.hero.badge1')}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Eye className="mr-2 h-4 w-4" />
              {t('page.hero.badge2')}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Zap className="mr-2 h-4 w-4" />
              {t('page.hero.badge3')}
            </Badge>
          </div>
        </div>
      </div>

      {/* 工具区域 */}
      <section ref={toolSectionRef} className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-transparent" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm font-medium text-gray-600">{t('page.tool.title')}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <Base64ExcelConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 特性介绍 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={feature.key} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                      {getFeatureIcon(feature.key)}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 使用场景 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.useCases.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.useCases.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={useCase.key} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
                      <Target className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 使用步骤 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.steps.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.steps.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={step.key} className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 常见问题 */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.faq.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.faq.subtitle')}
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Collapsible key={faq.key}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-left">
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6 bg-white dark:bg-gray-800 rounded-b-lg shadow-md">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 