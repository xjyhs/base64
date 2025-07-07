'use client';

import { useTranslations, useMessages } from 'next-intl';
import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Zap, 
  FileType, 
  Gift, 
  Smartphone, 
  Code,
  Star,
  ArrowRight,
  CheckCircle,
  FileText,
  Image,
  FileSpreadsheet,
  Braces,
  Code2,
  FileBarChart,
  Hash
} from 'lucide-react';

// 定义类型接口
interface Tool {
  key: string;
  title: string;
  description: string;
  features: string[];
  icon: any;
  path: string;
}

interface Feature {
  key: string;
  title: string;
  description: string;
  icon: any;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

export default function HomePage() {
  const t = useTranslations('HomePage');
  const messages = useMessages();

  // 获取hero特性列表
  const heroFeatures = useMemo((): string[] => {
    try {
      const featuresData = (messages as any)?.HomePage?.hero?.features;
      if (!featuresData) return [];
      
      return Array.isArray(featuresData) ? featuresData : [];
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取工具列表
  const tools = useMemo((): Tool[] => {
    try {
      const toolsData = (messages as any)?.HomePage?.tools?.items;
      if (!toolsData) return [];
      
      const toolIcons = {
        'base64-text': FileText,
        'base64-image': Image,
        'base64-pdf': FileBarChart,
        'base64-json': Braces,
        'base64-xml': Code2,
        'base64-excel': FileSpreadsheet,
        'base64-hex': Hash
      };
      
      return Object.entries(toolsData).map(([key, value]: [string, any]) => ({
        key,
        icon: toolIcons[key as keyof typeof toolIcons] || FileText,
        path: `/tools/${key}`,
        ...value
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取功能特点
  const features = useMemo((): Feature[] => {
    try {
      const featuresData = (messages as any)?.HomePage?.features?.items;
      if (!featuresData) return [];
      
      const featureIcons = {
        security: Shield,
        speed: Zap,
        formats: FileType,
        free: Gift,
        responsive: Smartphone,
        opensource: Code
      };
      
      return Object.entries(featuresData).map(([key, value]: [string, any]) => ({
        key,
        icon: featureIcons[key as keyof typeof featureIcons] || Shield,
        title: value.title,
        description: value.description
      }));
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取使用步骤
  const steps = useMemo((): Step[] => {
    try {
      const stepsData = (messages as any)?.HomePage?.howToUse?.steps;
      if (!stepsData) return [];
      
      return stepsData;
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取用户评价
  const testimonials = useMemo((): Testimonial[] => {
    try {
      const testimonialsData = (messages as any)?.HomePage?.testimonials?.items;
      if (!testimonialsData) return [];
      
      return testimonialsData;
    } catch (e) {
      return [];
    }
  }, [messages]);

  // 获取FAQ
  const faqs = useMemo((): FAQ[] => {
    try {
      const faqData = (messages as any)?.HomePage?.faq?.items;
      if (!faqData) return [];
      
      return faqData;
    } catch (e) {
      return [];
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 text-sm font-medium">
            {t('hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('hero.description')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {heroFeatures.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-full px-4 py-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{feature.trim()}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 rounded-xl">
              {t('hero.learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('tools.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('tools.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool: Tool) => {
              const IconComponent = tool.icon;
              return (
                <Card key={tool.key} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </div>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      {tool.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Link href={tool.path}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg group-hover:bg-blue-700 transition-colors">
                        {t('tools.viewTool')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: Feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.key} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('howToUse.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('howToUse.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step: Step, index: number) => (
              <div key={index} className="text-center relative">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
                  )}
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('testimonials.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial: Testimonial, index: number) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {testimonial.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('faq.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('faq.subtitle')}
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq: FAQ, index: number) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('cta.subtitle')}
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-xl">
            {t('cta.button')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm mt-4 opacity-75">
            {t('cta.note')}
          </p>
        </div>
      </section>
    </div>
  );
}
