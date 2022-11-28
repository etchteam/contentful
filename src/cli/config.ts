import path from 'path';

export const CONTENTFUL_DIR = path.join(path.resolve(), 'integrations', 'contentful');
export const MIGRATION_DIR = path.join(CONTENTFUL_DIR, 'migrations');
export const SPACE_ID = process.env.CONTENTFUL_SPACE_ID as string;
export const MANAGEMENT_ACCESS_TOKEN = process.env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN as string;
export const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT ?? 'develop';
