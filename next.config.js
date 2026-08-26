const { version } = require('./package.json');
const { withSentryConfig } = require('@sentry/nextjs');

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    WEB_VERSION: version,
  },
  pageExtensions: ['page.tsx', 'page.ts', 'api.tsx', 'api.ts'],
  compiler: {
    emotion: true,
    reactRemoveProperties: isProd && {
      properties: ['^data-testid'],
    },
    removeConsole: isProd && {
      exclude: ['error', 'warn'],
    },
  },
  transpilePackages: ['react-hotjar'],
};

const sentryWebpackPluginOptions = {
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
