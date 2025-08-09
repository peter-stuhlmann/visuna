'use client';

import { FC, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import formElementsOptions from './data/formElementsOptions';
import Input from './blocks/input/Input';
import { Data, FormElement } from '@/components/templates/form/Form.types';
// import {
//   Form,
//   FieldGroup,
//   Label,
//   Select,
//   Option,
//   TextInput,
//   CheckboxGroup,
//   CheckboxLabel,
//   CheckboxInput,
//   HelpText,
//   ButtonGroup,
//   Button,
// } from './AddFormElement.styled';

type AddFormElementProps = {
  initialData?: FormElement | null;
  onSave: (elementData: FormElement) => void;
  closeDialog: () => void;
};

const AddFormElement: FC<AddFormElementProps> = ({
  initialData,
  onSave,
  closeDialog,
}) => {
  const [selectedFormField, setSelectedFormField] = useState(
    initialData?.type || ''
  );
  const [name, setName] = useState<string>(initialData?.name || '');
  const [data, setData] = useState<Data | null>(initialData?.data || null);
  const [id] = useState(initialData?.id || uuidv4());
  const [isRequired, setIsRequired] = useState(initialData?.required || false);
  const [requiredMessage, setRequiredMessage] = useState<string>(
    initialData?.requiredMessage || ''
  );

  useEffect(() => {
    if (initialData) {
      setSelectedFormField(initialData.type || '');
      setName(initialData.name);
      setData(initialData.data);
      setIsRequired(initialData.required || false);
      setRequiredMessage(initialData.requiredMessage || '');
    }
  }, [initialData]);

  const handleSave = () => {
    const formData: FormElement = {
      name: name,
      order: initialData?.order || 0,
      type: selectedFormField,
      data: data as Data | null,
      id: id,
      ...(inputs.includes(selectedFormField) && { required: isRequired }),
      ...(inputs.includes(selectedFormField) &&
        isRequired && { requiredMessage }),
    };

    onSave(formData);
  };

  const handleValueChange = (value: string) => {
    setData((prev) => ({ ...prev, value }));
  };

  const handleLabelChange = (value: string) => {
    setData((prev) => ({ ...prev, label: value }));
  };

  const inputs = ['text', 'textarea', 'date', 'select', 'checkbox'];

  return (
    <Form>
      <FieldGroup>
        <Label htmlFor="form-element-select">Formularelement</Label>
        <Select
          id="form-element-select"
          value={selectedFormField}
          onChange={(e) => setSelectedFormField(e.target.value)}
        >
          <Option value="">-- Bitte auswählen --</Option>
          {formElementsOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="field-name">Name</Label>
        <TextInput
          id="field-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FieldGroup>

      {selectedFormField && inputs.includes(selectedFormField) && (
        <>
          <Input
            type={selectedFormField}
            value={data?.label as string}
            onChange={handleLabelChange}
          />

          <CheckboxGroup>
            <CheckboxInput
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            <CheckboxLabel>Ist dieses Feld ein Pflichtfeld?</CheckboxLabel>
          </CheckboxGroup>
        </>
      )}

      {isRequired && (
        <FieldGroup>
          <Label htmlFor="required-message">Pflichtfeld-Text</Label>
          <TextInput
            id="required-message"
            value={requiredMessage}
            onChange={(e) => setRequiredMessage(e.target.value)}
          />
          <HelpText>
            z.B. &quot;Bitte füllen Sie dieses Feld aus.&quot;
          </HelpText>
        </FieldGroup>
      )}

      {selectedFormField === 'h2' && data?.h2 && (
        <Input
          type={selectedFormField}
          value={data?.h2 as string}
          onChange={handleValueChange}
        />
      )}

      <ButtonGroup>
        <Button type="button" onClick={closeDialog}>
          Abbrechen
        </Button>
        <Button type="button" onClick={handleSave} variant="contained">
          Speichern
        </Button>
      </ButtonGroup>
    </Form>
  );
};

export default AddFormElement;

import styled from 'styled-components';
import { Button } from '../content-elements/default';

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 0.95rem;
`;

export const TextInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

export const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

export const Option = styled.option``;

export const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CheckboxInput = styled.input``;

export const CheckboxLabel = styled.span`
  font-size: 0.95rem;
`;

export const HelpText = styled.span`
  font-size: 0.8rem;
  color: #666;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;
