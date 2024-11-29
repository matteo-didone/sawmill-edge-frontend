const path = require('path');

module.exports = {
  transpileDependencies: ['mqtt'], // Supporto per il pacchetto MQTT
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // Alias per semplificare i percorsi
        'stream': 'stream-browserify',
        'buffer': 'buffer',
      },
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        util: require.resolve('util'),
      },
      extensions: ['.js', '.vue', '.json'], // Estensioni supportate
    },
  },
};
