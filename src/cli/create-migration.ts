import fs from 'fs';
import path from 'path';

import kebabCase from 'lodash/kebabCase';

import { MIGRATION_DIR } from './config';

const migrationTemplate = `import type { MigrationFunction, validator } from '@etchteam/contentful';

const migrate: MigrationFunction = (migration) => {
  /*
    // Create new contentType
    const newEntity = migration.createContentType('newEntity');

    newEntity
      .name('New Entity Name')
      .description('Description of the entity');

    newEntity
      .createField('summary')
      .type('RichText')
      .name('Summary')
      .validations(validator.richText.boldAndItalicOnly)
      .required(true);

    // ---------------------------

    // Edit existing contentType
    const existingEntity = migration.editContentType('existingEntity');

    existingEntity.createField('newField')
      .type('Number')
      .name('Name of the field');

    existingEntity.moveField('newField').toTheTop();
    existingEntity.moveField('oldField').toTheBottom();


    // ---------------------------

    Available types:
      Symbol (Short text)
      Text (Long text)
      Integer
      Number
      Date
      Boolean
      Object
      Location
      RichText
      Array (requires items)
      Link (requires linkType)


    Available editor interfaces: https://www.contentful.com/developers/docs/extensibility/app-framework/editor-interfaces/
    Available validations: https://www.contentful.com/developers/docs/references/content-management-api/#/reference/content-types/content-type

    CheatSheet: https://cheatography.com/gburgett/cheat-sheets/contentful-migration/
  */
};

module.exports = migrate; // This has to be a CJS compatible export

// Optionally set the spaces this migration should run on
// Migrations can be filtered using the 'spaces' cli option (eg. migration:run --spaces spaceOne,spaceTwo)
// module.exports.spaces = ['spaceOne'];
`;

const createMigration = (migrationName: string) => {
  const migrationFiles = fs.readdirSync(MIGRATION_DIR);
  const migrationFilename = `${migrationFiles.length}-${kebabCase(
    migrationName,
  )}.ts`;

  fs.writeFileSync(
    path.join(MIGRATION_DIR, migrationFilename),
    migrationTemplate,
    'utf8',
  );

  console.info(`${migrationFilename} created ✨`);
};

export default createMigration;
