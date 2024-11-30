const path = require('path');

module.exports = {
  transpileDependencies: ['mqtt'], // Supporto per il pacchetto MQTT

  // Aggiungi la configurazione del dev server
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/api/v1'
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log('Proxying request to:', proxyReq.path);
        }
      }
    }    
  },

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