/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['img.clerk.com', 'images.unsplash.com', 'utfs.io', 'images.pexels.com'], // Agrega el dominio de Pexels aquí
    },
    reactStrictMode: false,
    output: 'standalone',
    async redirects(){
      return [
        {
          source: '/',
          destination: '/site',
          permanent: true,
        },
      ]
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
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
