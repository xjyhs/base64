export const runtime = 'edge';

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovebase64.com'
  
  // 定义支持的语言，英文为默认语言
  const defaultLocale = 'en'
  const otherLocales = ['zh'] // 只包含实际支持的语言
  
  // 定义工具页面
  const tools = [
    'base64-text',
    'base64-image', 
    'base64-pdf',
    'base64-json',
    'base64-xml',
    'base64-excel',
    'base64-hex'
  ]
  
  // 生成基础页面（默认语言，无前缀）
  const basePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    }
  ]
  
  // 生成其他语言首页（带前缀）
  const localePages = otherLocales.map(locale => ({
    url: `${baseUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))
  
  // 生成默认语言工具页面（无前缀）
  const defaultToolPages = tools.map(tool => ({
    url: `${baseUrl}/tools/${tool}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  // 生成其他语言工具页面（带前缀）
  const otherToolPages = otherLocales.flatMap(locale =>
    tools.map(tool => ({
      url: `${baseUrl}/${locale}/tools/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  )
  
  return [
    ...basePages,
    ...localePages,
    ...defaultToolPages,
    ...otherToolPages
  ]
} 