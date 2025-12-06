import Ticket from '../models/Ticket.js';

export const generateTicketNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const prefix = `TKT-${year}${month}`;

  const lastTicket = await Ticket.findOne({
    ticketNumber: new RegExp(`^${prefix}`),
  }).sort({ ticketNumber: -1 });

  let sequence = 1;
  if (lastTicket) {
    const lastSequence = parseInt(lastTicket.ticketNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};
