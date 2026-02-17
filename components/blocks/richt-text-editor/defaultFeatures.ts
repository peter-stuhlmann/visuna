export type EditorFeature =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'text-color'
  | 'background-color'
  | 'block'
  | 'font-family'
  | 'font-size'
  | 'line-height'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'align-justify'
  | 'bullet-list'
  | 'ordered-list'
  | 'blockquote'
  | 'superscript'
  | 'subscript'
  | 'emojis'
  | 'link'
  | 'table'
  | 'clear-formatting'
  | 'undo'
  | 'redo'
  | 'html-mode';

export const defaultFeatures: EditorFeature[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'text-color',
  'background-color',
  'block',
  'font-family',
  'font-size',
  'line-height',
  'align-left',
  'align-center',
  'align-right',
  'align-justify',
  'bullet-list',
  'ordered-list',
  'blockquote',
  'superscript',
  'subscript',
  'emojis',
  'link',
  'table',
  'clear-formatting',
  'undo',
  'redo',
  'html-mode',
];
