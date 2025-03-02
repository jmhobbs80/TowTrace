module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: { experimentalImportSupport: false, inlineRequires: true },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: ['svg', 'png', 'jpg', 'jpeg', 'ttf', 'woff', 'woff2'],
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'svg'],
  },
};