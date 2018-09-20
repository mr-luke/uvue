const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const ModernModePlugin = require('./uvue/ModernModePlugin');

module.exports = (api, chainConfig) => {
  // Change main entry
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/client'));

  // Modern build
  if (process.env.VUE_CLI_MODERN_MODE) {
    if (!process.env.VUE_CLI_MODERN_BUILD) {
      // Inject plugin to extract build stats and write to disk
      chainConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [
        {
          targetDir: api.service.projectOptions.outputDir,
          isModernBuild: false,
        },
      ]);
    } else {
      chainConfig.plugin('modern-mode-modern').use(ModernModePlugin, [
        {
          targetDir: api.service.projectOptions.outputDir,
          isModernBuild: true,
        },
      ]);
    }
  }

  const isLegacyBuild = !process.env.VUE_CLI_MODERN_MODE || !process.env.VUE_CLI_MODERN_BUILD;

  // Add Vue SSR plugin
  chainConfig.plugin('vue-ssr-plugin').use(VueSSRClientPlugin, [
    {
      filename: isLegacyBuild ? '.uvue/client-manifest-legacy.json' : '.uvue/client-manifest.json',
    },
  ]);

  return api.resolveWebpackConfig(chainConfig);
};
