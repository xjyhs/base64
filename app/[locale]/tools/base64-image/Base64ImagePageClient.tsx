'use client';

import { useRef, useMemo } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import Base64ImageConverter from '@/components/tools/Base64ImageConverter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  Code, 
  Database, 
  Mail, 
  FileImage,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function Base64ImagePageClient() {
  const toolSectionRef = useRef<HTMLElement>(null);
  const t = useTranslations('tools.base64-image.page');
  const messages = useMessages();

  const scrollToTool = () => {
    if (toolSectionRef.current) {
      const elementTop = toolSectionRef.current.offsetTop;
      const offset = 0; // 增加偏移量到150px，确保滚动到Hero Section下面
      
      window.scrollTo({
        top: elementTop - offset,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      icon: Zap,
      title: t('features.fast.title'),
      description: t('features.fast.description')
    },
    {
      icon: Shield,
      title: t('features.secure.title'),
      description: t('features.secure.description')
    },
    {
      icon: Smartphone,
      title: t('features.compatible.title'),
      description: t('features.compatible.description')
    },
    {
      icon: Globe,
      title: t('features.noInstall.title'),
      description: t('features.noInstall.description')
    }
  ];

  const useCases = [
    {
      icon: Code,
      title: t('useCases.webDev.title'),
      description: t('useCases.webDev.description'),
      examples: t('useCases.webDev.examples')
    },
    {
      icon: Database,
      title: t('useCases.dataStorage.title'),
      description: t('useCases.dataStorage.description'),
      examples: t('useCases.dataStorage.examples')
    },
    {
      icon: Mail,
      title: t('useCases.email.title'),
      description: t('useCases.email.description'),
      examples: t('useCases.email.examples')
    },
    {
      icon: FileImage,
      title: t('useCases.api.title'),
      description: t('useCases.api.description'),
      examples: t('useCases.api.examples')
    }
  ];

  // 使用useMemo缓存steps数组，避免重复计算
  const steps = useMemo(() => {
    try {
      // 从messages对象中获取steps数组
      const toolMessages = (messages as any)?.tools?.['base64-image']?.page?.steps?.list;
      return Array.isArray(toolMessages) ? toolMessages : [];
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 使用useMemo缓存faqs数组，避免重复计算
  const faqs = useMemo(() => {
    try {
      // 从messages对象中获取faqs数组
      const toolMessages = (messages as any)?.tools?.['base64-image']?.page?.faq?.list;
      return Array.isArray(toolMessages) ? toolMessages : [];
    } catch (e) {
      return [];
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="text-center py-16 px-8 pt-24">
        <Badge className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-blue-200">
          {t('hero.badge')}
        </Badge>
        <h1 className="text-4xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
          {t('hero.description')}
        </p>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          {t('hero.subtitle')}
        </p>
      </section>

      {/* Core Tool Section */}
      <section ref={toolSectionRef} className="py-16 bg-white relative">
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
                    <span className="text-sm font-medium text-gray-600">{t('tool.title')}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <Base64ImageConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('useCases.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('useCases.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <useCase.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{useCase.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(Array.isArray(useCase.examples) ? useCase.examples : []).map((example, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('steps.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('steps.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faq.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Button
              onClick={scrollToTool}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium"
            >
              {t('cta.button')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 