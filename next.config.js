const { env } = require("./src/server/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

if (process.env.VERCEL_URL) process.env.NEXTAUTH_URL = process.env.VERCEL_URL;

module.exports = nextConfig;
