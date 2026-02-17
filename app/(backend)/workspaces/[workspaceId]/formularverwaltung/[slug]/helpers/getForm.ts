import connectToDatabase from '@/utils/connectToDatabase';
import { Form } from '../../helpers/getForms';

export const getForm = async (slug: string): Promise<Form | null> => {
  const { db } = await connectToDatabase(process.env.DB_NAME as string);
  const collection = db.collection<Form>('forms');

  try {
    if (!slug) {
      return null;
    }

    const form = await collection.findOne({ slug: slug });

    if (form) {
      const formattedForm = {
        _id: form._id.toString(),
        slug: form.slug,
        name: form.name,
        formElements:
          form.formElements &&
          form.formElements
            .map((element) => ({
              ...element,
              name: element.name,
            }))
            .sort((a, b) => a.order - b.order),
      };

      return formattedForm as Form;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
};
