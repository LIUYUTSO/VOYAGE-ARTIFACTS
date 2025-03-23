/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 在生产构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 添加服务器端配置
  serverRuntimeConfig: {
    // 将在服务器端使用
    PROJECT_ROOT: __dirname,
  },
}

module.exports = nextConfig 