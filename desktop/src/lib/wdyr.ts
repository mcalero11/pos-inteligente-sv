import { options } from 'preact';

// Only enable in development and when debug tools are active
if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');

  // Configure WDYR for Preact in Tauri environment
  whyDidYouRender.default(options, {
    // Track all pure components for comprehensive analysis
    trackAllPureComponents: false, // Disabled to prevent conflicts

    // Track hooks changes
    trackHooks: false, // Disabled to prevent conflicts

    // Log owner component reasons for re-renders
    logOwnerReasons: false, // Disabled to prevent conflicts

    // Only log avoidable re-renders in production-like analysis
    logOnDifferentValues: true,

    // Hot reload buffer for Tauri/Vite environment
    hotReloadBufferMs: 500,

    // Collapse groups for cleaner console output
    collapseGroups: false,

    // Include patterns for important components
    include: [
      /.*Context.*/,
      /.*Provider.*/,
      /.*App.*/,
      /.*POS.*/,
      /.*Header.*/,
      /.*Footer.*/,
      /.*Cart.*/,
      /.*Dialog.*/,
      /.*Window.*/
    ],

    // Exclude problematic or uninteresting components
    exclude: [
      /^Connect/,
      /^Router/,
      /^withRouter/,
      /^Memo/,
      /^ForwardRef/
    ],

    // Custom colors for Tauri environment
    titleColor: '#0066cc',
    diffNameColor: '#ff6600',
    diffPathColor: '#cc0000',
    textBackgroundColor: 'white',

    // Track custom hooks from our app
    trackExtraHooks: [],

    // Custom notifier optimized for Tauri console
    notifier: ({ Component, displayName, hookName, prevProps, prevState, prevHookResult, nextProps, nextState, nextHookResult, reason }) => {
      const componentName = displayName || Component?.name || 'Unknown Component';
      const timestamp = new Date().toLocaleTimeString();

      if (hookName) {
        globalThis.console.group(`🪝 [${timestamp}] ${componentName} > ${hookName} hook changed`);
        globalThis.console.log('📍 Reason:', reason);

        if (prevHookResult !== nextHookResult) {
          globalThis.console.log('🔄 Hook result changed:', {
            previous: prevHookResult,
            current: nextHookResult
          });
        }
      } else {
        globalThis.console.group(`🔄 [${timestamp}] ${componentName} re-rendered`);
        globalThis.console.log('📍 Reason:', reason);

        if (prevProps && nextProps && prevProps !== nextProps) {
          globalThis.console.log('⚡ Props changed:', {
            previous: prevProps,
            current: nextProps
          });
        }

        if (prevState && nextState && prevState !== nextState) {
          globalThis.console.log('🏪 State changed:', {
            previous: prevState,
            current: nextState
          });
        }
      }

      // Additional debug info
      globalThis.console.log('🔧 Component info:', { Component, displayName });

      globalThis.console.groupEnd();
    }
  });

  globalThis.console.log('🔍 Why Did You Render configured for Tauri environment');
}

export { };
