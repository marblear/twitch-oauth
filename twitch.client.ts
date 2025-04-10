import { Random } from 'meteor/random';
import TwitchOAuth from './TwitchOAuth';
import { OAuth, TwitchServiceConfiguration } from './types';

const endpoint = 'https://id.twitch.tv/oauth2/authorize';

TwitchOAuth.requestCredential = async (options, callback) => {
  const config = (await ServiceConfiguration.configurations.findOneAsync({ service: 'twitch' })) as unknown as TwitchServiceConfiguration;
  if (!config) {
    callback(new ServiceConfiguration.ConfigError());
    return;
  }

  const credentialToken = Random.secret();

  const { clientId, redirectUri } = config;

  const scopes: string[] = config.scopes || [];
  scopes.push('openid');
  const scope = scopes.join('+');

  const state = window.btoa(JSON.stringify({
    loginStyle: OAuth._loginStyle('twitch', config, options),
    credentialToken,
    redirectUrl: options?.redirectUrl ?? config.redirectUri
  }));

  const claims = {
    email: null,
    email_verified: null,
    picture: null,
    preferred_username: null,
    updated_at: null
  };
  const encodedClaims = encodeURIComponent(JSON.stringify({
    id_token: claims,
    userinfo: claims
  }));

  const loginOptions = {
    loginService: 'twitch',
    loginStyle: OAuth._loginStyle('twitch', config, options),
    loginUrl: `${endpoint}?client_id=${clientId}&response_type=code&scope=${scope}&state=${state}&claims=${encodedClaims}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    credentialRequestCompleteCallback: callback,
    credentialToken,
    popupOptions: { width: 800, height: 600 }
  };
  OAuth.launchLogin(loginOptions);
};

