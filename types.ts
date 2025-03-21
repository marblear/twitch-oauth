export interface TwitchOAuthQuery {
  scope: string;
  code: string;
}

export interface TwitchOAuthTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: 'bearer';
}

export interface TwitchJWTIdentity {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  email_verified: boolean;
  picture: string;
  updated_at: string;
  preferred_username: string;
}

export interface TwitchIdentity {
  id: string;
  clientId: string;
  username: string;
  issuer: string;
  email: string;
  emailVerified: boolean;
  picture: string;
  expiresAt: number;
  updatedAt: string;
}

export interface OAuthCredential {
  _id: string;
  key: string;
  credential: string;
  credentialSecret: string;
  createdAt: Date;
}

export type LoginStyle = 'popup' | 'redirect';

export interface LoginOptions {
  loginStyle: LoginStyle;
}

export type RequestCredentialCallback = () => void;

export interface UserAuthTokenRefreshResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: 'bearer';
}

export interface UserAccessTokenResult {
  accessToken: string;
  scope: string[];
  expiresAt: number;
}

export interface TwitchOAuthInterface {
  requestCredential?(options: LoginOptions | null, callback: RequestCredentialCallback): Promise<void>;

  retrieveCredential?(credentialToken: string, credentialSecret: string): OAuthCredential;

  getUserAccessToken?(minimumTokenDuration?: number): Promise<UserAccessTokenResult>;

  whitelistedFields?: string[];
}

export interface TwitchServiceConfiguration {
  clientId: string;
  secret?: string;
  redirectUri: string;
  scopes?: string[];
}

export interface TwitchUserServiceData {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  accessToken: string;
  identityToken: string;
  refreshToken: string;
  scope: string[];
  expiresAt: number;
}

export interface TwitchUser {
  _id: string;
  services: { twitch: TwitchUserServiceData };
}

export interface RegisterServiceResult {
  serviceData: TwitchUserServiceData;
  options?: { profile?: Record<string, string> };
}

export interface LaunchLoginOptions {
  loginService: string;
  loginStyle: string;
  loginUrl: string;
  credentialRequestCompleteCallback: RequestCredentialCallback;
  credentialToken: string;
  popupOptions: { width: number; height: number };
}

type Base64EncodedState = string;

declare const OAuth: {
  registerService: (type: string, oAuthVersion: number, oAuth1Urls: string | null, callback: (query: TwitchOAuthQuery) => void) => RegisterServiceResult
  _loginStyle: (service: string, config: TwitchServiceConfiguration, options: LoginOptions) => string
  launchLogin: (options: LaunchLoginOptions) => void
  _generateState: (loginStyle: string, credentialToken: string, redirectUrl: string) => Base64EncodedState
};

export { OAuth };
