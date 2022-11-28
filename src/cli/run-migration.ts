import fs from 'fs';
import path from 'path';
import { createClient, ClientAPI } from 'contentful-management';
import { runMigration as contentfulMigration } from 'contentful-migration';
import difference from 'lodash/difference';
import { MIGRATION_DIR, SPACE_ID, MANAGEMENT_ACCESS_TOKEN, ENVIRONMENT } from './config';

const MIGRATION_CONTENT_TYPE = 'migration';

const getMigrationHistory = async (client: ClientAPI): Promise<string[]> => {
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT);

  try {
    await environment.getContentType(MIGRATION_CONTENT_TYPE);
  } catch (error) {
    console.info('🆕 No migration history found, running all migrations');
    return [];
  }

  const migrationEntries = await environment.getEntries({ content_type: MIGRATION_CONTENT_TYPE });

  const filenames: string[] = migrationEntries.items.map((entry) => {
    return entry.fields.filename['en-GB'] ?? entry.fields.filename['en-US'];
  });

  return filenames;
};

const addMigrationHistory = async (client: ClientAPI, filename: string) => {
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT);

  environment.createEntryWithId(MIGRATION_CONTENT_TYPE, filename, {
    fields: {
      filename: { 'en-GB': filename },
      createdAt: { 'en-GB': new Date() },
    },
  });

  console.info(`✅ ${filename} \n\n`);
}

const migrate = async (client: ClientAPI) => {
  const history = await getMigrationHistory(client);
  const files = fs.readdirSync(MIGRATION_DIR);
  const newMigrations = difference(files, history);

  if (newMigrations.length > 0) {
    console.info('\n📝 Migrating:\n');
  } else {
    console.info('\n\nNothing to migrate\n\n');
  }

  for (const filename of newMigrations) {
    await contentfulMigration({
      filePath: path.join(MIGRATION_DIR, filename),
      spaceId: SPACE_ID,
      accessToken: MANAGEMENT_ACCESS_TOKEN,
      environmentId: ENVIRONMENT,
      yes: true
    });

    await addMigrationHistory(client, filename);
  }
}

const runMigration = async () => {
  try {
    const client = createClient({ accessToken: MANAGEMENT_ACCESS_TOKEN });
    await migrate(client);
  } catch (error) {
    console.error(error);
  }
};

export default runMigration;
