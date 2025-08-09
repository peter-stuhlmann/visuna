import {
  MdHome,
  MdFeed,
  MdImage,
  MdOutlineSettings,
  MdOutlinePeopleAlt,
} from 'react-icons/md';
import { FaWpforms } from 'react-icons/fa6';
import { LuLogs } from 'react-icons/lu';
import { IoKeySharp } from 'react-icons/io5';

const navData = {
  dashboard: [
    {
      href: `dashboard`,
      de: 'Dashboard',
      en: 'Dashboard',
      icon: <MdHome />,
    },
  ],
  content: [
    {
      href: `seiten`,
      de: 'Seiten',
      en: 'Pages',
      icon: <MdFeed />,
    },
    {
      href: `formularverwaltung`,
      de: 'Formulare',
      en: 'Forms',
      icon: <FaWpforms />,
    },
  ],
  assets: [
    {
      href: `medienpool/bilder`,
      de: 'Bilder',
      en: 'Images',
      icon: <MdImage />,
    },
    {
      href: `medienpool/dokumente`,
      de: 'Dokumente',
      en: 'Documents',
      icon: <MdFeed />,
    },
  ],
  admin: [
    {
      href: `einstellungen`,
      de: 'Website-Einstellungen',
      en: 'Website Settings',
      icon: <MdOutlineSettings />,
    },
    {
      href: `benutzerverwaltung`,
      de: 'Benutzer:innen',
      en: 'Users',
      icon: <MdOutlinePeopleAlt />,
    },
    {
      href: `logs`,
      de: 'Aktivitätsprotokoll (Logs)',
      en: 'Activity Logs',
      icon: <LuLogs />,
    },
    {
      href: `keys`,
      de: 'API-Keys',
      en: 'API Keys',
      icon: <IoKeySharp />,
    },
  ],
};

export default navData;
