#!/usr/bin/env node

import { Command } from 'commander';

import createMigration from './cli/create-migration';
import installMigration from './cli/install-migration';
import runMigration from './cli/run-migration';

const program = new Command();

program
  .command('migration:install')
  .description('Initialise the migrations')
  .action(installMigration);

program
  .command('migration:new')
  .description('Create a new migration file')
  .argument('<migrationName>', 'Name of the migration (Eg.: "Add article"): ')
  .action(createMigration);

program
  .command('migration:run')
  .description('Run all migrations that haven\'t already been run')
  .action(runMigration);

program.parseAsync(process.argv);
