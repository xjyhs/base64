import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // 处理域名特定的路由
  if (hostname === 'base64-image.com' || hostname === 'www.base64-image.com') {
    // 如果访问根路径，重定向到工具页面
    if (request.nextUrl.pathname === '/') {
      const locale = request.cookies.get('NEXT_LOCALE')?.value || 'zh';
      return NextResponse.redirect(new URL(`/${locale}/tools/base64-image`, request.url));
    }
    
    // 如果访问其他页面，重定向到对应工具页面
    if (!request.nextUrl.pathname.includes('/tools/base64-image')) {
      const locale = request.nextUrl.pathname.split('/')[1] || 'zh';
      return NextResponse.redirect(new URL(`/${locale}/tools/base64-image`, request.url));
    }
  }
  
  if (hostname === 'base64-pdf.com' || hostname === 'www.base64-pdf.com') {
    // 如果访问根路径，重定向到工具页面
    if (request.nextUrl.pathname === '/') {
      const locale = request.cookies.get('NEXT_LOCALE')?.value || 'zh';
      return NextResponse.redirect(new URL(`/${locale}/tools/base64-pdf`, request.url));
    }
    
    // 如果访问其他页面，重定向到对应工具页面
    if (!request.nextUrl.pathname.includes('/tools/base64-pdf')) {
      const locale = request.nextUrl.pathname.split('/')[1] || 'zh';
      return NextResponse.redirect(new URL(`/${locale}/tools/base64-pdf`, request.url));
    }
  }
  
  // 应用国际化中间件
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
