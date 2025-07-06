'use client';

import { useTranslations, useMessages } from 'next-intl';
import { useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Upload, 
  Download, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Star,
  Users,
  Clock,
  Lightbulb,
  Target,
  Workflow
} from 'lucide-react';
import Base64PdfConverter from '@/components/tools/Base64PdfConverter';

export default function Base64PdfPageClient() {
  const toolSectionRef = useRef<HTMLElement>(null);
  const t = useTranslations('tools.base64-pdf');
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

  const features = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-pdf']?.page?.features?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const useCases = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-pdf']?.page?.useCases?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const steps = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-pdf']?.page?.steps?.items;
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
      const toolMessages = (messages as any)?.tools?.['base64-pdf']?.page?.faq?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const advantages = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-pdf']?.page?.advantages?.items;
      if (!toolMessages) return [];
      
      return Object.entries(toolMessages).map(([key, value]: [string, any]) => ({
        key,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  const applications = useMemo(() => {
    try {
      const toolMessages = (messages as any)?.tools?.['base64-pdf']?.page?.applications?.items;
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
      <div className="container mx-auto px-4 py-8">
        {/* 头部区域 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('title')}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Badge variant="secondary" className="text-sm">
              <Shield className="w-4 h-4 mr-1" />
              {t('badges.secure')}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-4 h-4 mr-1" />
              {t('badges.fast')}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Globe className="w-4 h-4 mr-1" />
              {t('badges.online')}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Users className="w-4 h-4 mr-1" />
              {t('badges.free')}
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
                <Base64PdfConverter onTabChange={scrollToTool} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 主要特性 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Star className="w-8 h-8 text-yellow-500" />
              {t('page.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('page.features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={feature.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 使用步骤 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Workflow className="w-8 h-8 text-blue-500" />
              {t('page.steps.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('page.steps.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <Card key={step.key} className="relative hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 应用优势 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Target className="w-8 h-8 text-green-500" />
              {t('page.advantages.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('page.advantages.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((advantage, index) => (
              <Card key={advantage.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    {advantage.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 应用场景 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Users className="w-8 h-8 text-purple-500" />
              {t('page.applications.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('page.applications.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app, index) => (
              <Card key={app.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-blue-500" />
                    {app.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{app.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 使用案例 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Clock className="w-8 h-8 text-orange-500" />
              {t('page.useCases.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('page.useCases.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={useCase.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Info className="w-8 h-8 text-blue-500" />
              {t('page.faq.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('page.faq.subtitle')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={faq.key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 技术说明 */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="w-6 h-6 text-blue-500" />
                {t('page.technical.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {t('page.technical.description')}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('page.technical.security.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('page.technical.security.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('page.technical.performance.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('page.technical.performance.description')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部提示 */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
                <h3 className="text-xl font-bold">{t('page.footer.title')}</h3>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('page.footer.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 