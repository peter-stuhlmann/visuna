import { FormElement } from '@/components/templates/form/Form.types';
import { PageVisibility } from '@/lib/workspaces/pages/pages.types';
import connectToDatabase from '@/utils/connectToDatabase';

export type Form = {
  _id: string;
  slug: string;
  name: string;
  createdAt: string;
  publishStatus: PageVisibility;
  // formLanguages?: string[];
  formElements?: FormElement[];
};

export const getForms = async (): Promise<Form[] | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<Form>('forms');

  try {
    const forms = await collection.find({}).toArray();

    if (forms.length > 0) {
      const formattedForm = forms.map((form) => ({
        _id: form._id.toString(),
        slug: form.slug,
        name: form.name || 'Unbenanntes Formular',
        createdAt: form.createdAt || new Date().toISOString(),
        publishStatus: form.publishStatus || 'offline',
      }));

      return formattedForm as Form[];
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
