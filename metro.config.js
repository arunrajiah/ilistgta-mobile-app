const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Stub out native-only packages on web so the web bundle doesn't crash
const nativeOnlyModules = ['react-native-maps'];

// Packages to stub on web (mapped to their stub file)
const webStubs = {
  'fontfaceobserver': require.resolve('./web-stubs/fontfaceobserver.js'),
};

const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (nativeOnlyModules.some(m => moduleName === m || moduleName.startsWith(m + '/'))) {
      // Return an empty stub so the web bundler doesn't choke on native-only code
      return { type: 'sourceFile', filePath: require.resolve('./web-stubs/react-native-maps.js') };
    }
    if (webStubs[moduleName]) {
      return { type: 'sourceFile', filePath: webStubs[moduleName] };
    }
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
