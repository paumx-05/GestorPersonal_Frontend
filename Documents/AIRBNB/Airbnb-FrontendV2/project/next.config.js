/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comentado temporalmente para permitir API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
