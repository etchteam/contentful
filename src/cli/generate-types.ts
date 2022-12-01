import fs from 'fs';
import path from 'path';
import { createClient, ClientAPI, Collection, ContentTypeProps, ContentType } from 'contentful-management';
import { Field, FieldType } from "contentful"
import { SPACE_ID, MANAGEMENT_ACCESS_TOKEN, ENVIRONMENT, CONTENTFUL_DIR } from './config';
import { upperFirst, camelCase } from "lodash"

const renderLink = (field: Field, isArray?: boolean) => {
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

  const contentTypes = field.validations.find(validation => !!validation.linkContentType)

  if (contentTypes) {
    return contentTypes?.linkContentType
      .map((contentType) => `${upperFirst(camelCase(contentType))}${isArray ? 'Collection': ''}`)
      .join(' | ');
  }

  return `{ [key: string]: unknown }`
};

const renderArray = (field: Field) => {
  if (field.items?.type === 'Symbol') {
    return 'string[]';
  }

  if (field.items?.type === 'Link') {
    const formattedField = {
      ...field,
      linkType: field.items.linkType,
      validations: field.items.validations || []
    };
    return `${renderLink(formattedField, true)}`;
  }

  return 'unknown[]';
}

const renderContentType = (contentType: ContentType) => {
  const name = upperFirst(camelCase(contentType.sys.id));

  const fields = contentType.fields
    .filter(field => !field.omitted)
    .map<string>(field => {
      const fieldName = field.type === 'Array' ? `${field.id}Collection` : field.id;
      const functionMap: Record<FieldType, (field: Field) => string> = {
        Array: renderArray,
        Boolean: () => 'boolean',
        Date: () => 'string',
        Integer: () => 'number',
        Link: renderLink,
        Location: () => '{ lat: number, lon: number }',
        Number: () => 'number',
        Object: () => 'Record<string, any>',
        RichText: () => '{ json: Document }',
        Symbol: () => 'string',
        Text: () => 'string',
      }

      return `  ${fieldName}${field.required ? '' : '?'}: ${functionMap[field.type](field)}`
    })
    .join('\n');

  return [
    `export interface ${name} {\n${fields}\n}`,
    `export interface ${name}Collection {\n  items: ${name}[]\n}`
  ].join('\n\n');
}

function renderAllContentTypes(contentTypes: Collection<ContentType, ContentTypeProps>): string {
  return contentTypes.items.map(contentType => renderContentType(contentType)).join("\n\n");
}

const getContentTypes = async (client: ClientAPI): Promise<Collection<ContentType, ContentTypeProps>> => {
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment(ENVIRONMENT);
  return environment.getContentTypes({ limit: 1000 });
};

const generateTypes = async (client: ClientAPI) => {
  const contentTypes = await getContentTypes(client);
  const renderedTypes = renderAllContentTypes(contentTypes);
  const typesDir = path.join(CONTENTFUL_DIR, 'types');

  fs.mkdirSync(typesDir, { recursive: true });

  fs.writeFileSync(
    path.join(typesDir, 'contentful.d.ts'),
    `import { Document } from "@contentful/rich-text-types";\n\n${renderedTypes}\n`,
    'utf8'
  );

  console.info(`Types generated at /integrations/contentful ✨`);
}

const runTypeGeneration = async () => {
  try {
    const client = createClient({ accessToken: MANAGEMENT_ACCESS_TOKEN });
    await generateTypes(client);
  } catch (error) {
    console.error(error);
  }
};

export default runTypeGeneration;
