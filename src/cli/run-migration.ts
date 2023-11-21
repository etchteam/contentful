import fs from 'fs';
import path from 'path';

import { createClient, ClientAPI } from 'contentful-management';
import { runMigration as contentfulMigration } from 'contentful-migration';
import difference from 'lodash/difference';

import {
  MIGRATION_DIR,
  SPACE_ID,
  MANAGEMENT_ACCESS_TOKEN,
  ENVIRONMENT,
} from './config';

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

  const migrationEntries = await environment.getEntries({
    content_type: MIGRATION_CONTENT_TYPE,
  });

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
};

const migrate = async (client: ClientAPI, enabledSpaces: string[]) => {
  const history = await getMigrationHistory(client);
  const files = fs.readdirSync(MIGRATION_DIR);
  const newMigrations = difference(files, history).sort((fileA, fileB) => {
    const a = parseInt(fileA.split('-')[0], 10);
    const b = parseInt(fileB.split('-')[0], 10);
    return a - b;
  });

  if (newMigrations.length > 0) {
    console.info('\n📝 Migrating:\n');
  } else {
    console.info('\n\nNothing to migrate\n\n');
  }

  for (const filename of newMigrations) {
    const filePath = path.join(MIGRATION_DIR, filename);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const migration = require(path.join(MIGRATION_DIR, filename));
    const spaces = migration.spaces ?? [];
    const shouldRunForSpace = enabledSpaces.some((space) =>
      spaces.includes(space),
    );

    if (spaces?.length > 0 && !shouldRunForSpace) {
      console.info(
        `\nSkipping ${filename} as it is not configured to run on ${spaces.join(
          ', ',
        )}\n`,
      );
      continue;
    }

    await contentfulMigration({
      filePath,
      spaceId: SPACE_ID,
      accessToken: MANAGEMENT_ACCESS_TOKEN,
      environmentId: ENVIRONMENT,
      yes: true,
    });

    await addMigrationHistory(client, filename);
  }
};

const runMigration = async (options: { spaces: string }) => {
  try {
    const enabledSpaces = options.spaces?.split(',') ?? [];
    const client = createClient({ accessToken: MANAGEMENT_ACCESS_TOKEN });
    await migrate(client, enabledSpaces);
  } catch (error) {
    console.error(error);
    throw new Error('🚨 Error running migrations');
  }
};

export default runMigration;
