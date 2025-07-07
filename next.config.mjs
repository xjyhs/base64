import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  // 支持多域名部署
  async rewrites() {
    return [
      // base64-image.com 域名重写
      {
        source: '/',
        destination: '/zh/tools/base64-image',
        has: [
          {
            type: 'host',
            value: 'base64-image.com',
          },
        ],
      },
      {
        source: '/en',
        destination: '/en/tools/base64-image',
        has: [
          {
            type: 'host',
            value: 'base64-image.com',
          },
        ],
      },
      // base64-pdf.com 域名重写
      {
        source: '/',
        destination: '/zh/tools/base64-pdf',
        has: [
          {
            type: 'host',
            value: 'base64-pdf.com',
          },
        ],
      },
      {
        source: '/en',
        destination: '/en/tools/base64-pdf',
        has: [
          {
            type: 'host',
            value: 'base64-pdf.com',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
