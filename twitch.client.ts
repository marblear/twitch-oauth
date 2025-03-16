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

  // var url = "https://id.twitch.tv/oauth2/authorize?client_id=" + _settings.clientId +
  //   "&redirect_uri=" + redirectUri + "&response_type=token&scope=chat:read%20chat:edit";

  const { clientId, redirectUri } = config;

  const scope = config.scopes ? config.scopes.join('%20') : '';

  const loginOptions = {
    loginService: 'twitch',
    loginStyle: OAuth._loginStyle('twitch', config, options),
    loginUrl: `${endpoint}?client_id=${clientId}&response_type=token&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    credentialRequestCompleteCallback: callback,
    credentialToken,
    popupOptions: { width: 800, height: 600 }
  };
  // console.log({ config, loginOptions, callback });
  OAuth.launchLogin(loginOptions);
};

