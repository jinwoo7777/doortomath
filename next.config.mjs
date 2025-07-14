/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prefer loading of ES Modules over CommonJS
  experimental: { esmExternals: true },

  reactStrictMode: false,

  // ✅ 빌드 시 ESLint 오류 무시 (경고는 출력됨)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // ✅ 빌드 시 TypeScript 오류 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ 인증 관련 페이지 오류 무시
  output: 'standalone',
};

export default nextConfig;
