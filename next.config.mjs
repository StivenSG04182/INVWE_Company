/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['img.clerk.com', 'images.unsplash.com', 'utfs.io'],
    },
    reactStrictMode: false,
    output: 'standalone',
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Configuración para módulos de Node.js en el navegador
        config.resolve.fallback = {
          ...config.resolve.fallback,
          net: false,
          tls: false,
          fs: false,
          dns: false,
          child_process: false,
          http2: false,
          "timers/promises": false
        };
      }
      return config;
    },
  }

export default nextConfig;
