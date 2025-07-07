export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Base64ImagePageClient from './client';

export async function generateMetadata({
    params: { locale },
  }: {
    params: { locale: string };
  }): Promise<Metadata> {
    const t = await getTranslations({locale, namespace: 'tools.base64-image'});
  
    return {
      title: t('meta.title'),
      description: t('meta.description'),
      keywords: t('meta.keywords'),
    };
  }

export default function Base64ImagePage() {
  return <Base64ImagePageClient />;
} 