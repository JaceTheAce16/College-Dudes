export interface CalendarEventData {
  name: string;
  phone: string;
  email?: string;
  address: string;
  services: string[];
  totalEstimate: number;
  paymentOption: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
}

/**
 * Creates a Google Calendar event for the given cleaning booking.
 * Returns the created event data or throws an error.
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  eventData: CalendarEventData
): Promise<any> {
  const { name, phone, email, address, services, totalEstimate, paymentOption, scheduledDate, scheduledTimeSlot } = eventData;

  let startIso = '';
  let endIso = '';

  if (scheduledDate) {
    let startHourStr = '10:00:00';
    let endHourStr = '12:00:00';

    if (scheduledTimeSlot === 'morning') {
      startHourStr = '09:00:00';
      endHourStr = '12:00:00';
    } else if (scheduledTimeSlot === 'afternoon') {
      startHourStr = '13:00:00';
      endHourStr = '16:00:00';
    } else if (scheduledTimeSlot === 'evening') {
      startHourStr = '16:00:00';
      endHourStr = '19:00:00';
    }

    startIso = `${scheduledDate}T${startHourStr}`;
    endIso = `${scheduledDate}T${endHourStr}`;
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    startIso = `${yyyy}-${mm}-${dd}T10:00:00`;
    endIso = `${yyyy}-${mm}-${dd}T12:00:00`;
  }

  const formatService = (svc: string) => {
    if (svc === 'siding') return 'Exterior House & Siding Soft Wash';
    if (svc === 'oneCan') return 'Single Trash Can Sanitization';
    if (svc === 'twoCans') return 'Two Trash Cans Sanitization';
    if (svc.startsWith('driveway-')) {
      const size = svc.split('-')[1];
      return `Driveway Pressure Wash (${size.toUpperCase()})`;
    }
    return svc;
  };

  const formattedServices = services.map(formatService).join(', ');

  const formattedSlot = scheduledTimeSlot 
    ? (scheduledTimeSlot === 'morning' ? 'Morning Slot (9:00 AM - 12:00 PM)' : 
       scheduledTimeSlot === 'afternoon' ? 'Afternoon Slot (1:00 PM - 4:00 PM)' : 
       'Evening Slot (4:00 PM - 7:00 PM)')
    : 'Default Spot (10:00 AM - 12:00 PM)';

  const description = [
    `🧹 NEW BOOKING REQUEST FROM WEBSITE`,
    `--------------------------------------`,
    `Customer Name: ${name}`,
    `Phone Number:  ${phone}`,
    `Email:         ${email || 'Not Provided'}`,
    `Address:       ${address}`,
    `Services:      ${formattedServices}`,
    `Total Quote:   $${totalEstimate}`,
    `Payment Type:  ${paymentOption === 'pre_pay_save_10' ? 'Pre-Paid Online (10% Discount)' : 'Pay on Completion (Book Now, Pay Later)'}`,
    `Scheduled:     ${scheduledDate || 'Not Scheduled'} (${formattedSlot})`,
    `--------------------------------------`,
    `👉 Action: Call customer at ${phone} to confirm the scheduled date and time!`
  ].join('\n');

  const eventBody = {
    summary: `🧹 ${scheduledDate ? '[ONLINE SCHEDULED]' : '[PENDING]'} Cleaning: ${name} (${address.split(',')[0]})`,
    location: address,
    description,
    start: {
      dateTime: startIso,
      timeZone: 'America/Chicago'
    },
    end: {
      dateTime: endIso,
      timeZone: 'America/Chicago'
    },
    reminders: {
      useDefault: true
    }
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Google Calendar API Error details:', errorData);
    throw new Error(
      errorData?.error?.message || `Failed to create calendar event: ${response.statusText}`
    );
  }

  return response.json();
}
