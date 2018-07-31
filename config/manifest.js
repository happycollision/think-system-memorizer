/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  return {
    name: 'Think System Memorizer',
    short_name: 'TS Memorizer',
    description: 'Card style memorization for your lines',
    lang: 'en-US',
    start_url: '/think-system-memorizer/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/iconset/icon_16x16.png',
        sizes: '16x16', 
      },
      {
        src: '/iconset/icon_32x32.png',
        sizes: '32x32', 
      },
      {
        src: '/iconset/icon_128x128.png',
        sizes: '128x128', 
      },
      {
        src: '/iconset/icon_256x256.png',
        sizes: '256x256', 
      },
      {
        src: '/iconset/icon_512x512.png',
        sizes: '512x512', 
      },
    ],
    ms: {
      tileColor: '#fff'
    }
  };
}
