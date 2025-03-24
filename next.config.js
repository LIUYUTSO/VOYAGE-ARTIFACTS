/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 添加资源处理配置
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif)$/i,
      type: 'asset/resource'
    });
    return config;
  },
  // 添加服务器端配置
  serverRuntimeConfig: {
    // 将在服务器端使用
    PROJECT_ROOT: __dirname,
  },
  // 添加静态资源配置
  images: {
    unoptimized: true,
  },
  // 添加资源前缀
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
}

module.exports = nextConfig 