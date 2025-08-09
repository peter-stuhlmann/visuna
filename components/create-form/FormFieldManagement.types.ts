import { FormElement } from '@/components/templates/form/Form.types';

// export type Translations = {
//   [key: string]: string;
// };

export type FormFieldManagementProps = {
  form: {
    _id: string;
    formElements: FormElement[];
  };
  // selectedFormLanguages: string[];
};
