import { Log } from '../Logs.types';

export const getTableData = (logs: Log[] | null) => {
  return [
    {
      thead: 'Datum',
      tbody: logs?.map((log) =>
        new Date(log.timestamp).toLocaleString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      ),
      width: '200px',
    },
    { thead: 'Aktivität', tbody: logs?.map((log) => log.activity) },
    {
      thead: 'Benutzer:in',
      tbody: logs?.map((log) => log.email),
      width: '150px',
    },
  ];
};
