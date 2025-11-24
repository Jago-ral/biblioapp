const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",

  //  Très important pour Vercel + App Router + API routes
  buildBase: "/",
  dynamicStartUrl: true,
  dynamicRoutes: true,
  fallbacks: {
    document: "/offline.html",
  },

  workboxOptions: {
    disableDevLogs: true,
  },

  // Désactive auto-export (la cause du crash)
  extendDefaultPlugins: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: undefined, // Empêche tout mode 'export'
  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },
};

module.exports = withPWA(nextConfig);
