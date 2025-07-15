export type AppConfig = {
  nodeEnv: string;
  port: number;
  debugMode: boolean;
  fallbackLanguage: string;
  accessTokenExpires: string;
  accessTokenKey: string;
  refreshTokenExpires: string;
  refreshTokenKey: string;
  corsOrigin: boolean | string | RegExp | (string | RegExp)[];
};
