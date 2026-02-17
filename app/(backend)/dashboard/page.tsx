import { getLoggedInUser } from '@/utils/getLoggedInUser';
import { Heading } from '@/components/content-elements/default';

export default async function DashboardPage() {
  const user = await getLoggedInUser();

  return (
    <div>
      <Heading
        element="h1"
        value={`Hallo, ${user?.name || user?.email || 'Nutzer'}!`}
      />
    </div>
  );
}
