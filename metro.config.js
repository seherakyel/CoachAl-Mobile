const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === "@firebase/auth") {
        return {
          filePath: path.resolve(__dirname, "node_modules/@firebase/auth/dist/rn/index.js"),
          type: "sourceFile",
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
