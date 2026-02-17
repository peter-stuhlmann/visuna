'use client';

import { FC } from 'react';
import FormManagement from '@/components/create-form/FormManagement';
import { Form } from '@/app/(backend)/workspaces/[workspaceId]/formularverwaltung/helpers/getForms';

const FormClientWrapper: FC<{ form: Form }> = ({ form }) => {
  return <FormManagement form={form} />;
};

export default FormClientWrapper;
