'use client';

import { useRef, useMemo } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Hash, Code, ArrowUpDown, Shield, Download, BarChart3, Copy } from 'lucide-react';
import Base64HexConverter from '@/components/tools/Base64HexConverter';

export default function Base64HexPageClient() {
  const t = useTranslations('tools.base64-hex');
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

  // 获取功能特色数据
  const features = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-hex']?.page?.features?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取使用场景数据
  const useCases = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-hex']?.page?.useCases?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取使用步骤数据
  const steps = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-hex']?.page?.steps?.items;
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
      const toolMessages = (messages as any)?.tools?.['base64-hex']?.page?.faq?.items;
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
      case 'bidirectional': return <ArrowUpDown className="h-6 w-6" />;
      case 'format': return <Code className="h-6 w-6" />;
      case 'validation': return <Shield className="h-6 w-6" />;
      case 'download': return <Download className="h-6 w-6" />;
      case 'stats': return <BarChart3 className="h-6 w-6" />;
      case 'copy': return <Copy className="h-6 w-6" />;
      default: return <Hash className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            {t('page.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('page.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('page.hero.description')}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {t('page.hero.subtitle')}
          </p>
        </div>
      </div>

      {/* 工具区域 - 独立全宽区域 */}
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
                <Base64HexConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 其他内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {/* 功能特色 */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.key} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 dark:text-blue-400">
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

        <Separator className="my-16" />

        {/* 使用场景 */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.useCases.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.useCases.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <Card key={useCase.key} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-16" />

        {/* 使用步骤 */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.steps.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.steps.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.key} className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-16" />

        {/* FAQ */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.faq.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.faq.subtitle')}
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.key}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 