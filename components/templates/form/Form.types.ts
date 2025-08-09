export type FormElement = {
  id: string;
  name: string;
  order: number;
  // label: Record<string, string>;
  type: string;
  data: Data | null;
  required?: boolean;
  requiredMessage?: string;
  // options?: { label: Record<string, string>; value: string }[];
};

export type FormProps = {
  formElements: FormElement[];
};

export type Data = Record<
  string,
  string | number | boolean | string[] | number[] | boolean[]
>;
