'use client';

import { useRef, useMemo } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  CheckCircle, 
  Shield, 
  Zap, 
  Settings,
  Database,
  Lock,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Base64TextConverter from '@/components/tools/Base64TextConverter';

export default function Base64TextPageClient() {
  const t = useTranslations('tools.base64-text');
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

  // 获取功能特点数据
  const features = useMemo(() => {
    try {
      const featuresData = (messages as any)?.tools?.['base64-text']?.page?.features?.items;
      if (!featuresData) return [];
      
      return Object.entries(featuresData).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取应用场景数据
  const useCases = useMemo(() => {
    try {
      const useCasesData = (messages as any)?.tools?.['base64-text']?.page?.useCases?.items;
      if (!useCasesData) return [];
      
      return Object.entries(useCasesData).map(([key, value]: [string, any]) => ({
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
      const stepsData = (messages as any)?.tools?.['base64-text']?.page?.steps?.items;
      if (!stepsData) return [];
      
      return Object.entries(stepsData).map(([key, value]: [string, any]) => ({
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
      const faqData = (messages as any)?.tools?.['base64-text']?.page?.faq?.items;
      if (!faqData) return [];
      
      return Object.entries(faqData).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const featureIcons = {
    format: Sparkles,
    validate: CheckCircle,
    compress: Zap,
    secure: Shield
  };

  const useCaseIcons = {
    config: Settings,
    api: ArrowRight,
    storage: Database,
    security: Lock
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部区域 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium">
            <FileText className="mr-2 h-4 w-4" />
            {t('page.hero.badge')}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            {t('page.hero.title')}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('page.hero.description')}
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
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
                <Base64TextConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 功能特点 */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const IconComponent = featureIcons[feature.key as keyof typeof featureIcons] || FileText;
              return (
                <Card key={feature.key} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 应用场景 */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.useCases.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.useCases.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase) => {
              const IconComponent = useCaseIcons[useCase.key as keyof typeof useCaseIcons] || ArrowRight;
              return (
                <Card key={useCase.key} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {useCase.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {useCase.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 使用步骤 */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.steps.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.steps.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.key} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.faq.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('page.faq.subtitle')}
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 