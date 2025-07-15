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
  ACCESS_TOKEN_PUBLIC_KEY: string;

  @IsString()
  INTERNAL_TOKEN_PRIVATE_KEY: string;

  @IsString()
  @IsOptional()
  APP_CORS_ORIGIN: string;

  @IsString()
  USER_SERVICE_HOST: string;
  @IsString()
  SOCIAL_SERVICE_HOST: string;
  @IsString()
  SENDER_SERVICE_HOST: string;
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
    accessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC_KEY,
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES,
    internalTokenPrivateKey: process.env.INTERNAL_TOKEN_PRIVATE_KEY,
    corsOrigin: getCorsOrigin() || true,
    userServiceUrl: process.env.USER_SERVICE_GRPC,
    socialServiceUrl: process.env.SOCIAL_SERVICE_GRPC,
    userServiceHost: process.env.USER_SERVICE_HOST,
    socialServiceHost: process.env.SOCIAL_SERVICE_HOST,
    senderServiceHost: process.env.SENDER_SERVICE_HOST,
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
