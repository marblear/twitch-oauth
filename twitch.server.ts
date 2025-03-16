import TwitchOAuth from './TwitchOAuth';
import { OAuth, Query } from './types';

TwitchOAuth.whitelistedFields = ['email'];

const getTokenResponse = (query: Query) => {
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
