'use client';

import { FC } from 'react';

// import FormLanguages from '@/components/dashboard/create-form/FormLanguages';
import FormFieldManagement from './FormFieldManagement';
import { Form } from '@/app/(backend)/workspaces/[workspaceId]/formularverwaltung/helpers/getForms';

type FormManagementProps = {
  form: Form;
};

const FormManagement: FC<FormManagementProps> = ({ form }) => {
  // const [selectedFormLanguages, setSelectedFormLanguages] = useState<string[]>(
  //   form.formLanguages || []
  // );

  // if (!form || !form.formElements || form.formElements.length === 0) return;

  return (
    <>
      {/* <FormLanguages
        formId={form._id}
        selectedFormLanguages={selectedFormLanguages}
        setSelectedFormLanguages={setSelectedFormLanguages}
      /> */}
      {/* {selectedFormLanguages.length > 0 && ( */}
      <FormFieldManagement
        form={{ ...form, formElements: form.formElements! }}
        // selectedFormLanguages={selectedFormLanguages}
      />
      {/* )} */}
    </>
  );
};

export default FormManagement;
