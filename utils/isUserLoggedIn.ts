import { getServerSession } from 'next-auth';

const isUserLoggedIn = async (): Promise<boolean> => {
  const session = await getServerSession();

  if (!session || !session.user?.email) {
    return false;
  }

  return true;
};

export default isUserLoggedIn;
