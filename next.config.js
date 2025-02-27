/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbo: {
            rules: {
                // Configuración específica para Turbopack
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