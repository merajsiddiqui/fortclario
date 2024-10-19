import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityCaseNamingStrategy } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import dotenv from 'dotenv';
dotenv.config();

const config: Options = {
  entities: ['dist/entities'], // Path to the compiled JS entities
  entitiesTs: ['src/entities'], // Path for TypeScript entities
  dbName: process.env.DB_NAME || 'your_database_name',
  user: process.env.DB_USER || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  debug: process.env.APP_ENVIRONMENT !== 'production',
  metadataProvider: TsMorphMetadataProvider,
  namingStrategy: EntityCaseNamingStrategy,
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: false,
    alwaysAnalyseProperties: true,
  },
  driver: PostgreSqlDriver,
};

export default config;
