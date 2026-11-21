import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains'},
        {key: 'X-Content-Type-Options', value: 'nosniff'},
        {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
        {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()'},
        {key: 'X-Frame-Options', value: 'DENY'},
        {
          key: 'Content-Security-Policy-Report-Only',
          value: "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://accounts.google.com; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.public.blob.vercel-storage.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://openidconnect.googleapis.com"
        }
      ]
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);