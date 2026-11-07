/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  outputFileTracingIncludes: {
    '/api/leads': ['./lib/generated/prisma/**/*'],
  },
};

export default nextConfig;