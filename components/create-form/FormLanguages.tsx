'use client';

import { FC } from 'react';
import styled from 'styled-components';
import languages from '@/data/languages';

type FormLanguagesProps = {
  formId: string;
  selectedFormLanguages: string[];
  setSelectedFormLanguages: (selectedFormLanguages: string[]) => void;
};

const FormLanguages: FC<FormLanguagesProps> = ({
  formId,
  selectedFormLanguages,
  setSelectedFormLanguages,
}) => {
  const saveLanguages = async (
    formId: string,
    selectedFormLanguages: string[]
  ) => {
    try {
      await fetch(`/api/set-form-languages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          selectedLanguages: selectedFormLanguages,
        }),
      });
    } catch (error) {
      console.error('Fehler beim Speichern der Sprachen:', error);
    }
  };

  const handleCheckboxChange = (code: string) => {
    const newSelected = selectedFormLanguages.includes(code)
      ? selectedFormLanguages.filter((lang) => lang !== code)
      : [...selectedFormLanguages, code];

    setSelectedFormLanguages(newSelected);
    saveLanguages(formId, newSelected);
  };

  return (
    <Wrapper>
      <Label>Sprachen auswählen:</Label>
      <CheckboxList>
        {[...languages]
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((language) => (
            <CheckboxItem key={language.code}>
              <Checkbox
                type="checkbox"
                checked={selectedFormLanguages.includes(language.code)}
                onChange={() => handleCheckboxChange(language.code)}
              />
              <LanguageLabel>{language.label}</LanguageLabel>
            </CheckboxItem>
          ))}
      </CheckboxList>
    </Wrapper>
  );
};

export default FormLanguages;

const Wrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 0.75rem;
`;

const CheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: #f2f2f2;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const LanguageLabel = styled.span`
  font-size: 0.95rem;
`;
