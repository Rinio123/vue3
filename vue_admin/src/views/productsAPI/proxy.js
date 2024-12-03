export default {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost/services_http/services_http/public',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };