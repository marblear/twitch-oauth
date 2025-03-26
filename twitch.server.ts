import { fetch, Headers } from 'meteor/fetch';
import { Meteor } from 'meteor/meteor';
import TwitchOAuth from './TwitchOAuth';
import {
  OAuth,
  TwitchIdentity,
  TwitchJWTIdentity,
  TwitchOAuthQuery,
  TwitchOAuthTokenResponse,
  TwitchServiceConfiguration,
  TwitchUser,
  TwitchUserServiceData,
  UserAccessTokenResult,
  UserAuthTokenRefreshResponse
} from './types';

const tokenEndpoint = 'https://id.twitch.tv/oauth2/token';
const expectedIssuer = 'https://id.twitch.tv/oauth2';
const defaultMinimumAccessTokenDuration = 1000 * 60 * 60; // 1 hour

TwitchOAuth.whitelistedFields = ['email'];

export const getTokenResponse = async (config: TwitchServiceConfiguration, query: TwitchOAuthQuery) => {
  const { clientId, secret, redirectUri } = config;
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    body: new URLSearchParams({
      'client_id': clientId,
      'client_secret': secret ?? '',
      'code': query.code,
      'grant_type': 'authorization_code',
      'redirect_uri': redirectUri
    })
  });
  const json = await response.json() as TwitchOAuthTokenResponse;
  return {
    accessToken: json.access_token,
    identityToken: json.id_token,
    refreshToken: json.refresh_token,
    scope: json.scope,
    expiresIn: json.expires_in,
    tokenType: json.token_type
  };
};

const getIdentity = (identityToken: string) => {
  if (!identityToken) throw new Meteor.Error(403, 'No identity token');
  const identity = JSON.parse(Buffer.from(identityToken.split('.')[1], 'base64').toString()) as TwitchJWTIdentity;
  return {
    id: identity.sub,
    clientId: identity.aud,
    username: identity.preferred_username,
    issuer: identity.iss,
    email: identity.email,
    emailVerified: identity.email_verified,
    picture: identity.picture,
    expiresAt: identity.exp,
    updatedAt: identity.updated_at
  } as TwitchIdentity;
};

const verifyIdentity = (config: TwitchServiceConfiguration, identity: TwitchIdentity) => {
  if (identity.issuer !== expectedIssuer) throw new Meteor.Error(403, 'Issuer mismatch');
  if (identity.clientId !== config.clientId) throw new Meteor.Error(403, 'Client ID mismatch');
};

const getUserAccessToken = async (userId: string, minimumTokenDuration: number = defaultMinimumAccessTokenDuration) => {
  if (!userId) throw new Meteor.Error(403, 'User ID not provided');
  const user = await Meteor.users.findOneAsync({
    _id: userId,
    'services.twitch': { $exists: true }
  }, { fields: { 'services.twitch': 1 } }) as unknown as TwitchUser;
  if (!user) throw new Meteor.Error(403, 'User not found');

  const { accessToken, scope, expiresAt } = user.services.twitch;

  if (expiresAt < (+new Date) + minimumTokenDuration) {
    return refreshUserAccessToken(user);
  }

  return {
    accessToken,
    scope,
    expiresAt
  };
};

const refreshUserAccessToken = async (user: TwitchUser): Promise<UserAccessTokenResult> => {
  const config = (await ServiceConfiguration.configurations.findOneAsync({ service: 'twitch' })) as unknown as TwitchServiceConfiguration;
  if (!config) throw new Meteor.Error(403, 'No Twitch service configuration');
  const { clientId, secret } = config;

  const userId = user._id;
  const refreshToken = user.services?.twitch?.refreshToken;

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/x-www-form-urlencoded'
    }),
    body: new URLSearchParams({
      'client_id': clientId,
      'client_secret': secret ?? '',
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken
    })
  });
  const json = await response.json() as UserAuthTokenRefreshResponse;

  const result: UserAccessTokenResult = {
    accessToken: json.access_token,
    scope: json.scope,
    expiresAt: (+new Date) + (1000 * json.expires_in)
  };

  const serviceData: Partial<TwitchUserServiceData> = {
    ...result,
    refreshToken: json.refresh_token
  };
  const $set = {
    'services.twitch.accessToken': serviceData.accessToken,
    'services.twitch.refreshToken': serviceData.refreshToken,
    'services.twitch.expiresAt': serviceData.expiresAt,
    'services.twitch.scope': serviceData.scope
  };

  await Meteor.users.updateAsync({ _id: userId }, { $set });

  return result;
};

OAuth.registerService('twitch', 2, null, async query => {
  const config = (await ServiceConfiguration.configurations.findOneAsync({ service: 'twitch' })) as unknown as TwitchServiceConfiguration;
  if (!config) throw new Meteor.Error(403, 'Twitch accounts service not configured');

  const response = await getTokenResponse(config, query);
  const { accessToken, identityToken, refreshToken } = response;
  const identity = getIdentity(identityToken);
  verifyIdentity(config, identity);

  const serviceData: TwitchUserServiceData = {
    id: identity.id,
    username: identity.username,
    email: identity.email,
    emailVerified: identity.emailVerified,
    accessToken,
    identityToken,
    refreshToken,
    scope: response.scope,
    expiresAt: (+new Date) + (1000 * response.expiresIn)
  };

  return {
    serviceData,
    options: { username: identity.username, profile: { firstName: identity.username, avatar: identity.picture } }
  };
});


TwitchOAuth.getUserAccessToken = getUserAccessToken;

// Accounts.registerLoginHandler(async query => {
//   console.log('registerLoginHandler');
//   console.log({ query });
//   return undefined;
// });
