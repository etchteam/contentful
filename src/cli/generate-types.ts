import fs from 'fs';
import path from 'path';

import { ContentTypeField, ContentTypeFieldType } from 'contentful';
import {
  createClient,
  ClientAPI,
  Collection,
  ContentTypeProps,
  ContentType,
} from 'contentful-management';
import camelCase from 'lodash/camelCase';
import upperFirst from 'lodash/upperFirst';

import {
  SPACE_ID,
  MANAGEMENT_ACCESS_TOKEN,
  ENVIRONMENT,
  CONTENTFUL_DIR,
} from './config';

const renderLink = (field: ContentTypeField, isArray?: boolean) => {
  if (field.linkType === 'Asset') {
    return `{
      url: string;
      title: string;
      description: string;
      width: number;
      height: number;
      size: number;
      contentType: string;
    }`;
  }

  const contentTypes = field.validations.find(
    (validation) => !!validation.linkContentType,
  );

  if (contentTypes) {
    return contentTypes?.linkContentType
      .map(
        (contentType) =>
          `${upperFirst(camelCase(contentType))}${isArray ? 'Collection' : ''}`,
      )
      .join(' | ');
  }

  return `{ [key: string]: unknown }`;
};

const renderArray = (field: ContentTypeField) => {
  if (field.items?.type === 'Symbol') {
    return 'string[]';
  }

  if (field.items?.type === 'Link') {
    const formattedField = {
      ...field,
      linkType: field.items.linkType,
      validations: field.items.validations || [],
    };
    return formattedField.linkType === 'Asset'
      ? `{\n    items: ${renderLink(formattedField, true)}[]\n  }`
      : renderLink(formattedField, true);
  }

  return 'unknown[]';
};

const renderContentType = (contentType: ContentType) => {
  const name = upperFirst(camelCase(contentType.sys.id));

  const fields = contentType.fields
    .filter((field) => !field.omitted)
    .map<string>((field) => {
      const fieldName =
        field.type === 'Array' ? `${field.id}Collection` : field.id;
      const functionMap: Record<
        ContentTypeFieldType,
        (field: ContentTypeField) => string
      > = {
        Array: renderArray,
        Boolean: () => 'boolean',
        Date: () => 'string',
        Integer: () => 'number',
        Link: renderLink,
        ResourceLink: renderLink,
        Location: () => '{ lat: number, lon: number }',
        Number: () => 'number',
        Object: () => 'Record<string, any>',
        RichText: () => '{ json: Document }',
        Symbol: () => 'string',
        Text: () => 'string',
      };

      return `  ${fieldName}${field.required ? '' : '?'}: ${functionMap[
        field.type
      ](field)}`;
    })
    .join('\n');

  return [
    `export interface ${name} extends ContentfulEntry {\n${fields}\n}`,
    `export interface ${name}Collection extends ContentfulCollection {\n  items: ${name}[]\n}`,
  ].join('\n\n');
};

function renderAllContentTypes(
  contentTypes: Collection<ContentType, ContentTypeProps>,
): string {
  return contentTypes.items
    .map((contentType) => renderContentType(contentType))
    .join('\n\n');
}

const getContentTypes = async (
  client: ClientAPI,
): Promise<Collection<ContentType, ContentTypeProps>> => {
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT);
  return environment.getContentTypes({ limit: 1000 });
};

const generateTypes = async (client: ClientAPI, filename?: string) => {
  const contentTypes = await getContentTypes(client);
  const renderedTypes = renderAllContentTypes(contentTypes);
  const typesDir = path.join(CONTENTFUL_DIR, 'types');

  fs.mkdirSync(typesDir, { recursive: true });

  fs.writeFileSync(
    path.join(typesDir, filename ?? 'contentful.d.ts'),
    `import { Document } from "@contentful/rich-text-types";

interface ContentfulEntry {
  __typename: string;
  sys: {
    id: string;
    spaceId: string;
    environmentId: string;
    locale: string;
    publishedAt: string;
    firstPublishedAt: string;
    publishedVersion: number;
  };
}

interface ContentfulCollection {
  __typename: string;
  total: number;
  skip: number;
  limit: number;
}

${renderedTypes}`,
    'utf8',
  );

  console.info(`Types generated at /integrations/contentful ✨`);
};

const runTypeGeneration = async (options?: { filename?: string }) => {
  try {
    const client = createClient({ accessToken: MANAGEMENT_ACCESS_TOKEN });
    await generateTypes(client, options?.filename);
  } catch (error) {
    console.error(error);
    throw new Error('🚨 Error generating types');
  }
};

export default runTypeGeneration;
