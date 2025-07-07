'use client';

import { useRef, useMemo } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileCode, Code, Maximize, CheckCircle, Shield, BarChart3, ArrowUpDown, ChevronDown } from 'lucide-react';
import Base64XmlConverter from '@/components/tools/Base64XmlConverter';

export default function Base64XmlPageClient() {
  const t = useTranslations('tools.base64-xml');
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
      const toolMessages = (messages as any)?.tools?.['base64-xml']?.page?.features?.items;
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
      const toolMessages = (messages as any)?.tools?.['base64-xml']?.page?.useCases?.items;
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
      const toolMessages = (messages as any)?.tools?.['base64-xml']?.page?.steps?.items;
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
      const toolMessages = (messages as any)?.tools?.['base64-xml']?.page?.faq?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取特性图标
  const getFeatureIcon = (key: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      format: <Maximize className="h-6 w-6" />,
      validate: <CheckCircle className="h-6 w-6" />,
      compress: <BarChart3 className="h-6 w-6" />,
      secure: <Shield className="h-6 w-6" />,
      bidirectional: <ArrowUpDown className="h-6 w-6" />,
      stats: <BarChart3 className="h-6 w-6" />
    };
    return iconMap[key] || <Code className="h-6 w-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            {t('page.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('page.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('page.hero.description')}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {t('page.hero.subtitle')}
          </p>
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
                <Base64XmlConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 其他内容区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* 功能特点 */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">{t('page.features.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-12">{t('page.features.subtitle')}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.key} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white w-fit">
                      {getFeatureIcon(feature.key)}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 使用场景 */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">{t('page.useCases.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-12">{t('page.useCases.subtitle')}</p>
            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase) => (
                <Card key={useCase.key} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileCode className="h-5 w-5 text-blue-600" />
                      {useCase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
                    {useCase.examples && (
                      <div className="flex flex-wrap gap-2">
                        {useCase.examples.map((example: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 使用步骤 */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">{t('page.steps.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-12">{t('page.steps.subtitle')}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <Card key={step.key} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 text-center text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 常见问题 */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-4">{t('page.faq.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-12">{t('page.faq.subtitle')}</p>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq) => (
                <Collapsible key={faq.key}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{faq.question}</span>
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-6 pb-6 bg-white border-l border-r border-b border-gray-100 rounded-b-xl">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 