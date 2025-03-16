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

export interface TwitchOAuthInterface {
  requestCredential?(options: LoginOptions, callback: RequestCredentialCallback): Promise<void>;

  retrieveCredential?(credentialToken: string, credentialSecret: string): OAuthCredential;

  whitelistedFields?: string[];
}

export interface TwitchServiceConfiguration {
  clientId: string;
  secret?: string;
  redirectUri: string;
  scopes?: string[];
}

export interface TwitchUserServiceData {
  accessToken: string;
  scopes: string[];
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

declare const OAuth: {
  registerService: (type: string, oAuthVersion: number, oAuth1Urls: string | null, callback: (query: TwitchOAuthQuery) => void) => RegisterServiceResult
  _loginStyle: (service: string, config: TwitchServiceConfiguration, options: LoginOptions) => string
  launchLogin: (options: LaunchLoginOptions) => void
};

export { OAuth };
