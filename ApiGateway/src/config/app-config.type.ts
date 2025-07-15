export type AppConfig = {
  nodeEnv: string;
  port: number;
  debugMode: boolean;
  fallbackLanguage: string;
  accessTokenExpires: string;
  accessTokenPublicKey: string;
  internalTokenPrivateKey: string;
  corsOrigin: boolean | string | RegExp | (string | RegExp)[];
  userServiceUrl: string;
  socialServiceUrl: string;
  //Service host
  userServiceHost: string;
  socialServiceHost: string;
  senderServiceHost: string;
};
