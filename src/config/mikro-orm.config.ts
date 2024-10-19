import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityCaseNamingStrategy } from '@mikro-orm/core';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  entities: ['../entities'], // Path to the directory containing your entities
  entitiesTs: ['../entities'], // Path for TypeScript entities (if using TypeScript)
  dbName: process.env.DB_NAME || 'your_database_name',
  type: 'postgresql', // or 'mysql', 'postgresql', etc.
  user: process.env.DB_USER || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  debug: process.env.NODE_ENV !== 'production',
  metadataProvider: TsMorphMetadataProvider,
  namingStrategy: EntityCaseNamingStrategy,
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: false,
    alwaysAnalyseProperties: true,
  },
};

export default config;
