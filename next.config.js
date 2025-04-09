/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbo: {
            rules: {
                options: {
                    resolve: {
                        fallback: {
                            punycode: false
                        }
                    }
                }
            }
        }
    },
    images: {
        domains: ['startup-template-sage.vercel.app', 'avatar.vercel.sh', 'via.placeholder.com']
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                punycode: false
            }
        }
        return config
    }
}

module.exports = nextConfig