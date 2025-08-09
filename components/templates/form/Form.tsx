'use client';

import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { Form } from './Form.styles';
// import { useLanguage } from '../contexts/LanguageContext.fe';
import { useRouter } from 'next/navigation';
import {
  CheckboxField,
  DateField,
  // SelectField,
  SignatureInput,
  HorizontalLine,
} from './form-fields';
import { FormProps } from './Form.types';
import {
  Button,
  Heading,
  TextInput,
} from '@/components/content-elements/default';

const FormComponent: FC<FormProps> = ({ formElements }) => {
  // const { language } = useLanguage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {}
  );
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if ('target' in e && e.target instanceof HTMLSelectElement) {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if ('type' in e.target && e.target.type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: false });
    }
  };

  const handleSignatureChange = (signature: string) => {
    setFormData({
      ...formData,
      signature,
    });
  };

  const validateForm = () => {
    const errors: Record<string, boolean> = {};

    formElements.forEach((formElement) => {
      if (formElement.required && !formData[formElement.id]) {
        errors[formElement.id] = true;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-medical-history-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form data');
      }

      const responseData = await response.json();

      if (responseData.name === formData.name) {
        router.push(
          '/success?name=' +
            encodeURIComponent(formData.name) +
            '&clientId=' +
            encodeURIComponent(responseData.clientId)
        );
      } else {
        console.error('Name in response does not match the form data');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div>Wird geladen... </div>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <div>
        {formElements
          .sort((a, b) => a.order - b.order)
          .map((formElement) => {
            const formElementId = formElement.id as string;

            return (
              <div key={formElementId}>
                {formElement.type === 'text' && (
                  <TextInput
                    name={formElementId}
                    // error={!!formErrors[formElementId]}
                    // handleChange={handleChange}
                    label={formElement.data?.label as string}
                    value={(formData[formElementId] as string) || ''}
                    required={formElement.required || false}
                    // requiredMessage={
                    //   (formElement.requiredMessage &&
                    //     formElement.requiredMessage) ||
                    //   ''
                    // }
                  />
                )}
                {formElement.type === 'date' && (
                  <DateField
                    name={formElementId}
                    error={!!formErrors[formElementId]}
                    handleChange={handleChange}
                    label={formElement.data?.label as string}
                    value={(formData[formElementId] as string) || ''}
                    required={formElement.required || false}
                    requiredMessage={
                      (formElement.requiredMessage &&
                        formElement.requiredMessage) ||
                      ''
                    }
                  />
                )}
                {formElement.type === 'textarea' && (
                  <TextInput
                    name={formElementId}
                    // error={!!formErrors[formElementId]}
                    // handleChange={handleChange}
                    label={formElement.data?.label as string}
                    value={(formData[formElementId] as string) || ''}
                    required={formElement.required || false}
                    rows={4}
                    // requiredMessage={
                    //   (formElement.requiredMessage &&
                    //     formElement.requiredMessage) ||
                    //   ''
                    // }
                  />
                )}
                {/* {formElement.type === 'select' && (
                  <SelectField
                    name={formElementId}
                    error={!!formErrors[formElementId]}
                    handleChange={handleChange}
                    label={formElement.data?.label as string}
                    value={(formData[formElementId] as string) || ''}
                    required={formElement.required || false}
                    options={formElement.options}
                    language={language}
                    requiredMessage={
                      (formElement.requiredMessage &&
                        formElement.requiredMessage) ||
                      ''
                    }
                  />
                )} */}
                {formElement.type === 'checkbox' && (
                  <CheckboxField
                    name={formElementId}
                    error={!!formErrors[formElementId]}
                    handleChange={handleChange}
                    label={formElement.data?.label as string}
                    checked={(formData[formElementId] as boolean) || false}
                    required={formElement.required || false}
                    requiredMessage={
                      (formElement.requiredMessage &&
                        formElement.requiredMessage) ||
                      ''
                    }
                  />
                )}
                {formElement.type === 'signature' && (
                  <SignatureInput
                    label={formElement.data?.label as string}
                    // name={formElementId}
                    onChange={handleSignatureChange}
                    clearSignatureText={'Feld leeren'}
                    error={!!formErrors[formElementId]}
                    // required={formElement.required || false}
                    requiredMessage={
                      (formElement.requiredMessage &&
                        formElement.requiredMessage) ||
                      ''
                    }
                  />
                )}
                {formElement.type === 'hr' && <HorizontalLine />}
                {formElement.type === 'h2' && (
                  <Heading
                    element="h2"
                    value={formElement.data?.h2 as string}
                  />
                )}
                {formElement.type === 'infotext' && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formElement.data?.label as string,
                    }}
                  />
                )}
                {formElement.type === 'submit' && (
                  <Button type="submit" variant="contained">
                    {formElement.data?.label as string}
                  </Button>
                )}
              </div>
            );
          })}
      </div>
    </Form>
  );
};

export default FormComponent;
