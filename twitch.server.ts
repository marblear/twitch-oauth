import { fetch, Headers } from 'meteor/fetch';
import { Meteor } from 'meteor/meteor';
import TwitchOAuth from './TwitchOAuth';
import { OAuth, TwitchOAuthQuery, TwitchOAuthTokenResponse, TwitchServiceConfiguration } from './types';

const tokenEndpoint = 'https://id.twitch.tv/oauth2/token';

TwitchOAuth.whitelistedFields = ['email'];

export const getAccessToken = async (query: TwitchOAuthQuery) => {
  const config = (await ServiceConfiguration.configurations.findOneAsync({ service: 'twitch' })) as unknown as TwitchServiceConfiguration;
  if (!config) return new Meteor.Error(403, 'Twitch accounts service not configured');
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
  return json as TwitchOAuthTokenResponse;
};

export const getTokenResponse = async (query: TwitchOAuthQuery) => {
  const config = (await ServiceConfiguration.configurations.findOneAsync({ service: 'twitch' })) as unknown as TwitchServiceConfiguration;
  const { clientId, secret, redirectUri } = config;

  return {
    accessToken: 'none',
    refreshToken: 'none',
    expiresIn: 0
  };
};

const getIdentity = (accessToken: string) => {
  return {
    id: 'none',
    name: 'none',
    display_name: 'none',
    email: 'none'
  };
};

OAuth.registerService('twitch', 2, null, query => {
  console.log(query);

  const response = getTokenResponse(query);
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

  return {
    serviceData,
    options: { profile: { name: identity.display_name } }
  };
});
