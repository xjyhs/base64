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
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/logo.png" }
      ],
      shortcut: "/favicon.ico"
    },
    openGraph: {
      images: [
        {
          url: "/logo.png",
          alt: t("metadata.title") || ""
        }
      ]
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
                <Toaster />
              </ThemeProvider>
            </AppContextProvider>
          {/* </NextAuthSessionProvider> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
