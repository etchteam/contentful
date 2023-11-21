const enabledMarks = {
  enabledMarks: ['bold', 'italic'],
  message: 'Only bold and italic marks are allowed',
};

const nodes = {
  nodes: {},
};

export const boldAndItalicOnly = [
  { ...enabledMarks },
  { ...nodes },
  {
    enabledNodeTypes: ['hyperlink', 'entry-hyperlink', 'asset-hyperlink'],
    message: 'Only links are allowed',
  },
];

export const boldItalicAndHeadersOnly = [
  { ...enabledMarks },
  { ...nodes },
  {
    enabledNodeTypes: [
      'heading-2',
      'heading-3',
      'heading-4',
      'hyperlink',
      'entry-hyperlink',
      'asset-hyperlink',
    ],
    message: 'Only headings and links are allowed',
  },
];

export const longFormText = [
  { ...enabledMarks },
  { ...nodes },
  {
    enabledNodeTypes: [
      'heading-2',
      'heading-3',
      'heading-4',
      'ordered-list',
      'unordered-list',
      'hr',
      'blockquote',
      'embedded-entry-block',
      'embedded-asset-block',
      'hyperlink',
      'entry-hyperlink',
      'asset-hyperlink',
      'embedded-entry-inline',
    ],
    message: 'Only headings, lists, images, entries and links are allowed',
  },
];
