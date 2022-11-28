import fs from 'fs';
import path from 'path';
import kebabCase from 'lodash/kebabCase';
import { MIGRATION_DIR } from './config';

const migrationTemplate =
`import type { MigrationFunction } from '@etchteam/contentful';
import { richText } from '@etchteam/contentful/validators';

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
      .validations(richText.boldAndItalicOnly)
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

// @ts-ignore
export = migrate; // eslint-disable-line
`;

const createMigration = (migrationName: string) => {
  const migrationFiles = fs.readdirSync(MIGRATION_DIR);
  const lastMigration = migrationFiles[migrationFiles.length - 1];
  const newMigrationNumber = parseInt(lastMigration.split('-')[0]) + 1;
  const migrationFilename = `${newMigrationNumber}-${kebabCase(migrationName)}.ts`;

  fs.writeFileSync(
    path.join(MIGRATION_DIR, migrationFilename),
    migrationTemplate,
    'utf8'
  );

  console.info(`${migrationFilename} created ✨`);
}

export default createMigration;
