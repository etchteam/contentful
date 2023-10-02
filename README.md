# @etchteam/contentful

Helpers we use at [Etch](https://etch.co) for working with Contentful

## Install

```bash
npm install @etchteam/contentful
```

## CLI

### Setup

The CLI depends on the following environment variables being present

- [`CONTENTFUL_SPACE_ID`](https://www.contentful.com/help/find-space-id/)
- [`CONTENTFUL_ENVIRONMENT`](https://www.contentful.com/developers/docs/concepts/multiple-environments/)
- [`CONTENTFUL_MANAGEMENT_ACCESS_TOKEN`](https://www.contentful.com/developers/docs/references/authentication/#getting-a-personal-access-token)

### Usage

Use `--help` to display help for a command.

#### Install migrations

```bash
npx etch-contentful-cli migration:install
```

Creates a directory at `/integrations/contentful/migrations` containing a `0-init` migration.

When migrations are run, this will set the migration content type on your configured contentful space.

#### New migration

```bash
npx etch-contentful-cli migration:new "MIGRATION_NAME"
```

Creates a new migration file at `/integrations/contentful/migrations` with the `"MIGRATION_NAME"` provided.

#### Run migrations

```bash
npx etch-contentful-cli migration:run
```

Runs all migrations that haven't already been run.

Accepts an optional  `--projects <projectOne,projectTwo>` argument which allows migrations to be filtered.

Projects can be set per migration, by exporting a projects array:

```javascript
export const projects = ['projectOne', 'projectTwo'];
```

If no projects argument is provided, all migrations will run.

#### Generate types

```bash
npx etch-contentful-cli typegen
```

Generate Graphql API compatible types based on your content in Contentful

## Validators

Some basic validators are available to use with content types, they can be imported:

```javascript
import { validator } from '@etchteam/contentful';
```

Then used with their corresponding Contentful input type:

```javascript
newEntity
  .createField('summary')
  .type('RichText')
  .name('Summary')
  .validations(validator.richText.boldAndItalicOnly);
```
