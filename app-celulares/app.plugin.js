const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withMonitoringTool(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];
    if (mainApplication) {
      if (!mainApplication['meta-data']) {
        mainApplication['meta-data'] = [];
      }
      const alreadyDeclared = mainApplication['meta-data'].some(
        (item) => item.$?.['android:name'] === 'isMonitoringTool'
      );
      if (!alreadyDeclared) {
        mainApplication['meta-data'].push({
          $: { 'android:name': 'isMonitoringTool', 'android:value': 'true' },
        });
      }
    }
    return config;
  });
};
