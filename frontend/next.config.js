// Subfolder deploy: set NEXT_PUBLIC_BASE_PATH=/drtouhidtapan in .env.production.
// Leave empty for local dev so the app stays at the domain root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Produces .next/standalone — a self-contained Node server for cPanel/Passenger.
  output: 'standalone',
  basePath,
  assetPrefix: basePath || undefined,
  // Lint in CI / `npm run lint`, not as part of the production build, so a
  // style warning can never block a deploy.
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Serve images as-is (no server-side optimizer). This removes the
    // Next Image Optimizer attack surface (DoS / unbounded cache advisories)
    // and is the reliable choice on shared hosting, which often can't run
    // the optimizer. Trade-off: no automatic avif/webp resizing.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
