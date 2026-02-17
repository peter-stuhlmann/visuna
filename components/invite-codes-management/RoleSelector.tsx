import styled from 'styled-components';
import { ROLES, ASSIGNABLE_ROLES, getRoleLabel, type RoleKey } from '@/lib/roles/roles';

type Props = {
  roleOption: string;
  setRoleOption: (r: string) => void;
};

export default function RoleSelector({ roleOption, setRoleOption }: Props) {
  return (
    <Wrapper>
      {ASSIGNABLE_ROLES.map((key) => (
        <RoleButton
          key={key}
          $active={roleOption === key}
          onClick={() => setRoleOption(key)}
          type="button"
          title={ROLES[key].description.de}
        >
          {getRoleLabel(key, 'de')}
        </RoleButton>
      ))}
    </Wrapper>
  );
}

/* ---------------- Styles ---------------- */

const Wrapper = styled.div`
  display: flex;
  gap: 12px;
  margin: 16px 0;
`;

const RoleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 14px 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: ${(p) => (p.$active ? '#f3f3f3' : '#fff')};
  color: ${(p) => (p.$active ? '#111827' : '#111827')};
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${(p) => (p.$active ? '#f3f3f3' : 'rgba(0,0,0,0.04)')};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.4);
  }
`;
