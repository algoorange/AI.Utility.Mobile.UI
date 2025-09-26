module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@providers': './src/providers',
            '@theme': './src/theme',
            '@data': './src/data',
            '@utils': './src/utils'
          }
        }
      ]
    ]
  };
};

