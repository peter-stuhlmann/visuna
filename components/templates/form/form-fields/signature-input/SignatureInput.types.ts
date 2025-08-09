export type SignatureInputProps = {
  label: string;
  // name: string;
  onChange: (signature: string) => void;
  clearSignatureText: string;
  error: boolean;
  // required: boolean;
  requiredMessage: string;
};
