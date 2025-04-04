import config from '../content-elements.config';

const getElementClassName = (elementName: string): string => {
  if (!elementName) {
    console.error('Element name is required to generate a class name.');
    return '';
  }

  const elementClassName = config.classPrefix
    ? `${config.classPrefix}-${elementName}`
    : elementName;

  return elementClassName;
};

export default getElementClassName;
