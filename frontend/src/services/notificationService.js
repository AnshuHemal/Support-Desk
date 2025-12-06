import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

let socket = null;

export const initializeNotifications = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const socketUrl = apiUrl.replace('/api', '');

  socket = io(socketUrl, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {

  });

  socket.on('disconnect', () => {

  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
  socket.on('ticket:created', (ticket) => {
    toast.success(`New ticket created: ${ticket.ticketNumber}`, {
      duration: 5000,
    });
  });
  socket.on('ticket:updated', (ticket) => {
    toast.info(`Ticket ${ticket.ticketNumber} has been updated`, {
      duration: 4000,
    });
  });
  socket.on('ticket:assigned', (ticket) => {
    const assigneeName = ticket.assignedTo?.name || 'Unassigned';
    toast.info(`Ticket ${ticket.ticketNumber} assigned to ${assigneeName}`, {
      duration: 4000,
    });
  });
  socket.on('ticket:status_changed', (ticket) => {
    toast.info(`Ticket ${ticket.ticketNumber} status changed to ${ticket.status?.title}`, {
      duration: 4000,
    });
  });
  socket.on('ticket:reply', (data) => {
    const userName = data.reply?.user?.name || 'Someone';
    toast.info(`${userName} replied to ticket`, {
      duration: 4000,
    });
  });

  return socket;
};

export const disconnectNotifications = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
