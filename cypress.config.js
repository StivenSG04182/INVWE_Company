const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        setupNodeEvents(on, config) {
        },
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
    viewportWidth: 1280,
    viewportHeight: 720,
});