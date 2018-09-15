import { createApp } from '../main';
import UVue from '@uvue/core';
import routeResolve from '../lib/routeResolve';

// Enable HMR
if (module.hot) {
  module.hot.accept();
}

/**
 * Vue start
 */
(async () => {
  // Create context object
  const context = {};

  // Call app main
  createApp(context);

  // Call created hook
  await UVue.callAsyncHook('created', context);

  // Get some vars from context
  const { app, router } = context;

  // Router resolve route
  router.beforeResolve((to, _, next) => {
    routeResolve(context, { to, next });
  });

  // On router ready
  router.onReady(async () => {
    // SPA mode or route
    if (!process.ssr || window.__SPA_ROUTE__) {
      await routeResolve(context);
    }

    // beforeReady hook
    await UVue.callAsyncHook('beforeReady', context);

    // Mount app
    app.$mount('#app');

    // Wait for next tick after mount
    app.$nextTick(() => {
      // Call ready hook
      UVue.callHook('ready', context);
    });
  });
})();
