const { env } = require("./src/server/env");
const { withPlaiceholder } = require("@plaiceholder/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["lh3.googleusercontent.com", "www.themealdb.com"],
  },
};

module.exports = withPlaiceholder(nextConfig);
