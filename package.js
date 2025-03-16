Package.describe({
  name: 'marblear:twitch-oauth',
  version: '0.0.1',
  summary: 'Sign in with Twitch OAuth flow',
  git: 'https://github.com/marblear/twitch-oauth'
});

Package.onUse(function(api) {
  api.versionsFrom(['3.0.1']);
  api.use('typescript');
  api.use('base64');
  api.use('accounts-oauth');
  api.use('accounts-base', ['client', 'server']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('fetch', ['server']);
  api.use(['service-configuration'], ['client', 'server']);
  api.use(['random'], 'client');

  api.addFiles('twitch.server.ts', 'server');
  api.addFiles('twitch.client.ts', 'client');
  api.addFiles('TwitchOAuth.ts');

  api.export('TwitchOAuth');
});

// Npm.depends({
//   'jsonwebtoken': '8.5.1',
//   'jwks-rsa': '1.6.0',
//   'semver-lite': '0.0.6'
// });
