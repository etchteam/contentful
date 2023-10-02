#!/usr/bin/env ts-node

import { Command } from 'commander';

import createMigration from './cli/create-migration';
import installMigration from './cli/install-migration';
import runMigration from './cli/run-migration';
import generateTypes from './cli/generate-types';

const program = new Command();

program
  .command('migration:install')
  .description('Initialise the migrations')
  .action(installMigration);

program
  .command('migration:new')
  .description('Create a new migration file')
  .argument('<migrationName>', 'Name of the migration (Eg.: "Add article")')
  .action(createMigration);

program
  .command('migration:run')
  .description('Run all migrations that haven\'t already been run')
  .option(
    '-p, --projects <projectOne,projectTwo>',
    'Project names (separated by commas) to run this migration for'
  )
  .action(runMigration);

program
  .command('typegen')
  .description('Generate a .d.ts file from your Contentful content')
  .action(generateTypes);

program.parseAsync(process.argv);
