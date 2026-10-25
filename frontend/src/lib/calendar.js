/**
 * Builds a Google Calendar "add event" URL from an EventHub event.
 */
const toStamp = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

export const buildGoogleCalendarUrl = ({
  title,
  description = '',
  venue = '',
  date,
  durationHours = 2,
}) => {
  if (!date) return '';
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'GDG RBU Event',
    dates: `${toStamp(start)}/${toStamp(end)}`,
    details: description,
    location: venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default buildGoogleCalendarUrl;
