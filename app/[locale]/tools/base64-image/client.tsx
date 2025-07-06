'use client';

import { useRef, useMemo } from 'react';
import { useTranslations, useMessages } from 'next-intl';
import { 
  Image, 
  Upload, 
  Download, 
  Shield, 
  Zap, 
  Globe, 
  Smartphone, 
  Code, 
  Database,
  Mail,
  Settings,
  FileText,
  Monitor,
  Server,
  Cloud,
  Layers,
  BarChart3,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Base64ImageConverter from '@/components/tools/Base64ImageConverter';

export default function Base64ImagePageClient() {
  const t = useTranslations('tools.base64-image');
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

  const features = useMemo(() => [
    {
      icon: Shield,
      title: t('page.features.items.security.title'),
      description: t('page.features.items.security.description')
    },
    {
      icon: Zap,
      title: t('page.features.items.speed.title'),
      description: t('page.features.items.speed.description')
    },
    {
      icon: Image,
      title: t('page.features.items.format.title'),
      description: t('page.features.items.format.description')
    },
    {
      icon: Monitor,
      title: t('page.features.items.preview.title'),
      description: t('page.features.items.preview.description')
    },
    {
      icon: Layers,
      title: t('page.features.items.batch.title'),
      description: t('page.features.items.batch.description')
    },
    {
      icon: Globe,
      title: t('page.features.items.crossPlatform.title'),
      description: t('page.features.items.crossPlatform.description')
    }
  ], [t]);

  const useCases = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-image']?.page?.useCases?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        icon: key === 'webEmbedding' ? Code : 
              key === 'mobileOffline' ? Smartphone : 
              key === 'apiIntegration' ? Server : 
              key === 'emailMarketing' ? Mail : 
              key === 'reportSystem' ? BarChart3 : 
              MessageSquare,
        title: value.title,
        description: value.description
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const steps = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-image']?.page?.steps?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const faqs = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-image']?.page?.faq?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                <Shield className="w-3 h-3 mr-1" />
                {t('badges.secure')}
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Zap className="w-3 h-3 mr-1" />
                {t('badges.fast')}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                <Globe className="w-3 h-3 mr-1" />
                {t('badges.online')}
              </Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('badges.free')}
              </Badge>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-8 pb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            {t('title')}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Tool Section */}
      <section ref={toolSectionRef} className="py-12 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
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
                <Base64ImageConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        {/* Features Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white ml-4">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.useCases.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.useCases.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
                      <useCase.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white ml-4">
                      {useCase.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t('page.steps.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {t('page.steps.subtitle')}
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        {step.number}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('page.faq.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('page.faq.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 p-2 rounded-lg mr-4 mt-1">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed ml-12">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              {t('page.footer.title')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t('page.footer.description')}
            </p>
            <Button 
              onClick={scrollToTool}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t('page.footer.title')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
} 