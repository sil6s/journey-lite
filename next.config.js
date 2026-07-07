/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "terbeqsmulzhfntskjjj.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/services/injectable-weight-loss-medications",
        destination: "/medications#injectable-medications",
        permanent: true,
      },
      {
        source: "/injectable-weight-loss-medications",
        destination: "/medications#injectable-medications",
        permanent: true,
      },
      {
        source: "/services/oral-weight-loss-medications",
        destination: "/medications#oral-medications",
        permanent: true,
      },
      {
        source: "/oral-weight-loss-medications",
        destination: "/medications#oral-medications",
        permanent: true,
      },
      {
        source: "/services/prescription-weight-loss-medications",
        destination: "/medications",
        permanent: true,
      },
      {
        source: "/prescription-weight-loss-medications",
        destination: "/medications",
        permanent: true,
      },
      {
        source: "/services/post-op-weight-regain-support",
        destination: "/medications#post-op-support",
        permanent: true,
      },
      {
        source: "/post-op-weight-regain-support",
        destination: "/medications#post-op-support",
        permanent: true,
      },
      {
        source: "/courses",
        destination: "https://learn.journeylite.com",
        permanent: false,
      },
      {
        source: "/courses/:path*",
        destination: "https://learn.journeylite.com/:path*",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "https://learn.journeylite.com/dashboard",
        permanent: false,
      },
      {
        source: "/dashboard/:path*",
        destination: "https://learn.journeylite.com/dashboard/:path*",
        permanent: false,
      },
      {
        source: "/login",
        destination: "https://learn.journeylite.com/login",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "https://learn.journeylite.com/signup",
        permanent: false,
      },
      {
        source: "/forgot-password",
        destination: "https://learn.journeylite.com/forgot-password",
        permanent: false,
      },
      {
        source: "/reset-password",
        destination: "https://learn.journeylite.com/reset-password",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
