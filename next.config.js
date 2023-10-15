// next.config.js
module.exports = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://aa.tradao.xyz",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "*",
          },
          { key: "Access-Control-Allow-Headers", value: "*" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};
