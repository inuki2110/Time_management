export function parseTimeEntryFromClient(body: {
  id: string;
  date: string;
  category: string;
  description: string;
  startTime: string;
  endTime: string;
}) {
  const { id, date, category, description, startTime, endTime } = body;
  const localDate = new Date(
    new Date(date).getFullYear(),
    new Date(date).getMonth(),
    new Date(date).getDate()
  );

  return {
    id,
    date: localDate,
    category,
    description,
    startTime: new Date(startTime), 
    endTime: new Date(endTime),
  };
}
