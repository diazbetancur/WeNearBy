module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@app': './app',
            '@components': './components',
            '@assets': './assets',
            '@constants': './constants',
            '@hooks': './hooks',
            '@services': './services',
            '@contexts': './contexts'
          }
        }
      ]
    ]
  };
};
