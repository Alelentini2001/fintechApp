module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      // [
      //   "inline-dotenv",
      //   {
      //     path: ".env", // Specify the path to your .env file if not in the root
      //   },
      // ],
    ],
  };
};
