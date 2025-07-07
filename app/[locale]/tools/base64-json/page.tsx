export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Base64JsonPageClient from './client';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'tools.base64-json.meta' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}

export default function Base64JsonPage() {
  return <Base64JsonPageClient />;
} 