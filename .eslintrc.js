module.exports = {
    extends: [
        'next/core-web-vitals',
        'plugin:testing-library/react',
        'plugin:jest/recommended',
        'plugin:cypress/recommended',
    ],
    plugins: [
        'testing-library',
        'jest',
        'cypress',
    ],
    overrides: [
        {
            files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
            extends: ['plugin:testing-library/react'],
        },
        {
            files: ['cypress/**/*.[jt]s?(x)'],
            extends: ['plugin:cypress/recommended'],
        },
    ],
};