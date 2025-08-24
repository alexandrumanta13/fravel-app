import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  // SQLite pentru development local, PostgreSQL pentru Docker/Production
  type: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
  
  // SQLite configuration
  ...((!process.env.DATABASE_URL) && {
    database: join(__dirname, '../../database/fravel.sqlite'),
  }),
  
  // PostgreSQL configuration  
  ...(process.env.DATABASE_URL && {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }),

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Only in development
  logging: process.env.NODE_ENV === 'development',
};