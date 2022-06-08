const createExpoWebpackConfigAsync = require('@expo/webpack-config')

module.exports = async function (env, argv) {
  const rule = {
    test: /postMock.html$/,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
      },
    },
  };

  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [],
      },
      resolve: {
        alias: {
          'react-native': 'react-native-web',
          'react-native-webview': 'react-native-web-webview',
        }
      }
    },
    argv
  )

  return config
}