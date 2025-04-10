import { defaultConfig } from '../default.config';

const getElementClassName = (elementName: string): string => {
  if (!elementName) {
    console.error('Element name is required to generate a class name.');
    return '';
  }

  const elementClassName = defaultConfig.classPrefix
    ? `${defaultConfig.classPrefix}-${elementName}`
    : elementName;

  return elementClassName;
};

export default getElementClassName;
