import fs from 'fs';
import path from 'path';

import { MIGRATION_DIR } from 'cli/config';

const initTemplate =
`import type { MigrationFunction } from '@etchteam/contentful';

const migrate: MigrationFunction = (migration) => {
  // Create the migration content type
  // This stores the names of the migrations that have already run in this contentful environment
  const migrationEntity = migration.createContentType('migration');

  // Setup the content type name and listing display
  migrationEntity
    .name('Migration')
    .displayField('filename')
    .description('Used by migration scripts')

  // Add the filename field
  migrationEntity
    .createField('filename')
    .type('Symbol')
    .name('Filename')
    .validations([{ unique: true }])
    .required(true);

  // Add the created at field
  migrationEntity
    .createField('createdAt')
    .type('Date')
    .name('Created at')
    .required(true);
};

// @ts-ignore
export = migrate; // eslint-disable-line
`;

const installMigration = () => {
  fs.mkdirSync(MIGRATION_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(MIGRATION_DIR, '0-init.ts'),
    initTemplate,
    'utf8'
  );

  console.info(`Migrations installed at /integrations/contentful ✨`);
}

export default installMigration;
