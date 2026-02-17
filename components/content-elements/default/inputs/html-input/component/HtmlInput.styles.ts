import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
`;

export const GroupLabel = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 0.5rem;
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 140px;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  resize: vertical;
  background: #fff;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(var(--primary-color), 1);
    box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.15);
  }

  &:disabled {
    background: #f7f7f7;
    color: rgba(0, 0, 0, 0.6);
    cursor: not-allowed;
  }
`;
