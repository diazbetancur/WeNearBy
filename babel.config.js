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
            '@contexts': './contexts',
            // Modular architecture aliases
            '@customer': './src/modules/customer',
            '@business': './src/modules/business',
            '@shared': './src/shared'
          }
        }
      ]
    ]
  };
};
