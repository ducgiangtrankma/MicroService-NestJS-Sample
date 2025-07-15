import { registerAs } from '@nestjs/config';
import { IsString, ValidateIf } from 'class-validator';
import { DatabaseConfig } from './database-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  DATABASE_TYPE: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASS: string;

  @ValidateIf((envValues) => envValues.DATABASE_URL)
  @IsString()
  DATABASE_URL: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  console.info(`Register Database config from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    type: process.env.DATABASE_TYPE,
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    urlConnection: process.env.DATABASE_URL,
  };
});
