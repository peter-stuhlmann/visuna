import styled from 'styled-components';

export const CheckboxWrapper = styled.div<{ $error: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0.5rem 0;
  color: ${({ $error }) => ($error ? '#d32f2f' : 'inherit')};
`;

export const Label = styled.span`
  margin-left: 0.5rem;
  font-size: 0.95rem;
`;

export const Input = styled.input`
  accent-color: #0070f3;
  transform: scale(1.2);
`;

export const ErrorText = styled.span`
  font-size: 0.8rem;
  color: #d32f2f;
`;
