/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/stupid-ideas-hub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/stupid-ideas-hub/' : '',
};

module.exports = nextConfig;
