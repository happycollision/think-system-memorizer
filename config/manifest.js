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
    ],
    ms: {
      tileColor: '#fff'
    }
  };
}
