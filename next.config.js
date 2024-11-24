/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config, { isServer }) => {
    // Add any custom webpack config here
    return config
  },
}

module.exports = nextConfig
