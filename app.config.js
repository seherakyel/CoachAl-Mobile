module.exports = ({ config }) => ({
  ...config,
  scheme: "coachai",
  extra: {
    ...(config.extra || {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "",
  },
});
