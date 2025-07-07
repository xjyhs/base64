export const runtime = 'edge';

import "@/app/globals.css";

import { getMessages, getTranslations } from "next-intl/server";

import { AppContextProvider } from "@/contexts/app";
import { Inter as FontSans } from "next/font/google";
import { Metadata } from "next";
// import { NextAuthSessionProvider } from "@/auth/session";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "@/providers/theme";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: {
      template: `%s`,
      default: t("metadata.title") || "",
    },
    description: t("metadata.description") || "",
    keywords: t("metadata.keywords") || "",
    authors: [{ name: "Base64 Tools Team" }],
    creator: "Base64 Tools",
    publisher: "Base64 Tools",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { url: "/icon-512.png", type: "image/png", sizes: "512x512" }
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
      ]
    },
    manifest: "/manifest.json",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://lovebase64.com',
      title: t("metadata.title") || "",
      description: t("metadata.description") || "",
      siteName: t("metadata.title") || "",
      images: [
        {
          url: "/icon-512.png",
          width: 512,
          height: 512,
          alt: t("metadata.title") || "",
          type: "image/png"
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t("metadata.title") || "",
      description: t("metadata.description") || "",
      images: ["/icon-512.png"],
    },
    alternates: {
      canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://lovebase64.com',
      languages: {
        'zh-CN': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lovebase64.com'}/zh`,
        'en-US': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lovebase64.com'}/en`,
      }
    },
    verification: {
      other: {
        'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
      }
    }
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased overflow-x-hidden",
          fontSans.variable
        )}
      >
        <NextIntlClientProvider messages={messages}>
          {/* <NextAuthSessionProvider> */}
            <AppContextProvider>
              <ThemeProvider attribute="class" disableTransitionOnChange>
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Toaster position="top-center" />
              </ThemeProvider>
            </AppContextProvider>
          {/* </NextAuthSessionProvider> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
