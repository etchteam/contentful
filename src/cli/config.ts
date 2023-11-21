import path from 'path';

import * as dotenv from 'dotenv';

dotenv.config();

export const CONTENTFUL_DIR = path.join(
  path.resolve(),
  'integrations',
  'contentful',
);
export const MIGRATION_DIR = path.join(CONTENTFUL_DIR, 'migrations');
export const SPACE_ID =
  process.env.CONTENTFUL_SPACE_ID ||
  (process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID as string);
export const MANAGEMENT_ACCESS_TOKEN = process.env
  .CONTENTFUL_MANAGEMENT_ACCESS_TOKEN as string;
export const ENVIRONMENT =
  process.env.CONTENTFUL_ENVIRONMENT ??
  process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ??
  'develop';
