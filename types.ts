export type Query = Record<string, string>;

export interface OAuthCredential {
  _id: string;
  key: string;
  credential: string;
  credentialSecret: string;
  createdAt: Date;
}

export interface TwitchOAuthInterface {
  retrieveCredential?(credentialToken: string, credentialSecret: string): OAuthCredential;

  whitelistedFields?: string[];
}

declare let TwitchOAuth: TwitchOAuthInterface;

export interface TwitchUserServiceData {
  accessToken: string;
  scopes: string[];
}

export interface RegisterServiceResult {
  serviceData: TwitchUserServiceData;
  options?: { profile?: Record<string, string> };
}

declare const OAuth: {
  registerService: (type: string, oAuthVersion: number, oAuth1Urls: string | null, callback: (query: Query) => void) => RegisterServiceResult
};

export { OAuth };
