const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withMonitoringTool(config) {
  return withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;

    if (!manifest.application || !manifest.application[0]) {
      return config;
    }

    const app = manifest.application[0];

    // Allow plain HTTP traffic (servers run on local network without HTTPS)
    if (!app['$']) app['$'] = {};
    app['$']['android:usesCleartextTraffic'] = 'true';

    if (!app['meta-data']) {
      app['meta-data'] = [];
    }

    // Remove any existing entry to avoid duplicates
    app['meta-data'] = app['meta-data'].filter(
      (item) => item['$']?.['android:name'] !== 'isMonitoringTool'
    );

    // Add required isMonitoringTool declaration for Google Play monitoring policy
    app['meta-data'].push({
      '$': {
        'android:name': 'isMonitoringTool',
        'android:value': 'true',
      },
    });

    return config;
  });
};
