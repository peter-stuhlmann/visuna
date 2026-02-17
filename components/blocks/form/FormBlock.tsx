'use client';

import { FC, useEffect, useState } from 'react';
// import {
//   FormControl,
//   Label,
//   Select,
//   Option,
//   Message,
// } from './FormBlock.styled';
import styled from 'styled-components';

type Form = {
  _id: string;
  name: string;
};

type FormBlockProps = {
  value: string;
  onChange: (value: string) => void;
};

const FormBlock: FC<FormBlockProps> = ({ value, onChange }) => {
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await fetch('/api/forms/get-forms');
        if (!res.ok) throw new Error('Fehler beim Abrufen der Formulardaten');
        const data = await res.json();
        setForms(data || []);
      } catch (error) {
        console.error('Fehler beim Laden der Formulare:', error);
      }
    };

    fetchForms();
  }, []);

  return (
    <FormControl>
      <Label htmlFor="form-select">Formular auswählen</Label>
      <Select
        id="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {forms.length > 0 ? (
          forms.map((form) => (
            <Option key={form._id} value={form._id}>
              {form.name}
            </Option>
          ))
        ) : (
          <Option disabled value="">
            Kein Formular vorhanden
          </Option>
        )}
      </Select>
      {forms.length === 0 && (
        <Message>Es sind aktuell keine Formulare verfügbar.</Message>
      )}
    </FormControl>
  );
};

export default FormBlock;

export const FormControl = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;

export const Label = styled.label`
  font-size: 14px;
  margin-bottom: 6px;
`;

export const Select = styled.select`
  padding: 8px 10px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

export const Option = styled.option``;

export const Message = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #666;
`;
