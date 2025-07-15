import { registerAs } from '@nestjs/config';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Environment, Language } from 'src/constants/app.constant';
import validateConfig from 'src/utils/validate-config';
import { AppConfig } from './app-config.type';

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsEnum(Language)
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  ACCESS_TOKEN_EXPIRES: string;

  @IsString()
  ACCESS_TOKEN_KEY: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES: string;

  @IsString()
  REFRESH_TOKEN_KEY: string;

  @IsString()
  @IsOptional()
  APP_CORS_ORIGIN: string;
}

export default registerAs<AppConfig>('app', () => {
  console.info(`Register AppConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);
  const port = process.env.APP_PORT
    ? parseInt(process.env.APP_PORT, 10)
    : process.env.PORT
      ? parseInt(process.env.PORT, 10)
      : 3000;

  return {
    nodeEnv: process.env.NODE_ENV || Environment.DEVELOPMENT,
    port,
    debugMode: process.env.DEBUG === 'true',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE ?? Language.EN,
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES,
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    corsOrigin: getCorsOrigin() || true,
  };
});
function getCorsOrigin() {
  const corsOrigin = process.env.APP_CORS_ORIGIN;
  if (corsOrigin === 'true') return true;
  if (corsOrigin === '*') return '*';
  return corsOrigin?.includes(',')
    ? corsOrigin.split(',').map((origin) => origin.trim())
    : false;
}
