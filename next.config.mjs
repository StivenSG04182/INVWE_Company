/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['img.clerk.com', 'images.unsplash.com', 'utfs.io'],
    },
    reactStrictMode: false,
    output: 'standalone',
  }

export default nextConfig;
