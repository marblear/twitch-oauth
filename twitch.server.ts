import { Accounts } from 'meteor/accounts-base';
import { fetch, Headers } from 'meteor/fetch';
import { Meteor } from 'meteor/meteor';
import TwitchOAuth from './TwitchOAuth';
import { OAuth, TwitchOAuthQuery, TwitchOAuthTokenResponse, TwitchServiceConfiguration } from './types';

const tokenEndpoint = 'https://id.twitch.tv/oauth2/token';

TwitchOAuth.whitelistedFields = ['email'];

export const getTwitchOAuthTokenResponse = async (query: TwitchOAuthQuery) => {
  const config = (await ServiceConfiguration.configurations.findOneAsync({ service: 'twitch' })) as unknown as TwitchServiceConfiguration;
  if (!config) throw new Meteor.Error(403, 'Twitch accounts service not configured');
  const { clientId, secret, redirectUri } = config;
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    body: new URLSearchParams({
      'client_id': clientId,
      'client_secret': secret,
      'code': query.code,
      'grant_type': 'authorization_code',
      'redirect_uri': redirectUri
    })
  });
  const json = await response.json();
  console.log({ json });
  return { tokenResponse: json as TwitchOAuthTokenResponse, config };
};

export const getTokenResponse = async (query: TwitchOAuthQuery) => {
  const { tokenResponse, config } = await getTwitchOAuthTokenResponse(query);

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresIn: tokenResponse.expires_in
  };
};

const getIdentity = (accessToken: string) => {
  return {
    id: '4711',
    name: 'gruenerwaldgeist',
    display_name: 'gruenerwaldgeist',
    email: 'tom.brueckner@gmx.net'
  };
};

OAuth.registerService('twitch', 2, null, async query => {
  console.log('OAuth.registerService query');
  console.log(query);

  const response = await getTokenResponse(query);
  const accessToken = response.accessToken;
  const identity = getIdentity(accessToken);

  const serviceData = {
    id: identity.id,
    name: identity.name,
    displayName: identity.display_name,
    email: identity.email,
    accessToken,
    refreshToken: response.refreshToken,
    expiresAt: (+new Date) + (1000 * response.expiresIn)
  };

  const result = {
    serviceData,
    options: { profile: { name: identity.display_name } }
  };
  console.log(result);
  return result;
});

console.log('registerLoginHandler');

Accounts.registerLoginHandler(async query => {
  console.log('registerLoginHandler');
  console.log({ query });
  return undefined;
});
