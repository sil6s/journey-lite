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
    ];
  },
};

module.exports = nextConfig;
