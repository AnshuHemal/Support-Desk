import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const REFRESH_INTERVAL = 2 * 60 * 1000;

export const useTicketLock = (ticketId) => {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState(null);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const socketRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  const acquireLock = useCallback(async () => {
    if (!ticketId || !user) return;

    setIsAcquiring(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        `/ticket-locks/${ticketId}/acquire`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.locked) {
        setIsLocked(true);
        setLockedBy(response.data.lockedBy);
        return false;
      } else {
        setIsLocked(false);
        setLockedBy(null);
        startRefreshInterval();
        return true;
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setIsLocked(true);
        setLockedBy(error.response.data.lockedBy);
        return false;
      }
      return false;
    } finally {
      setIsAcquiring(false);
    }
  }, [ticketId, user]);

  const releaseLock = useCallback(async () => {
    if (!ticketId) return;

    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/ticket-locks/${ticketId}/release`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLocked(false);
      setLockedBy(null);
      stopRefreshInterval();
    } catch (error) {
    }
  }, [ticketId]);

  const refreshLock = useCallback(async () => {
    if (!ticketId) return;

    try {
      const token = localStorage.getItem('token');
      await api.post(
        `/ticket-locks/${ticketId}/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      if (error.response?.status === 410 || error.response?.status === 404) {
        setIsLocked(true);
        stopRefreshInterval();
      }
    }
  }, [ticketId]);

  const startRefreshInterval = useCallback(() => {
    stopRefreshInterval();
    refreshIntervalRef.current = setInterval(refreshLock, REFRESH_INTERVAL);
  }, [refreshLock]);

  const stopRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  const checkLock = useCallback(async () => {
    if (!ticketId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/ticket-locks/${ticketId}/check`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.locked) {
        const isLockedByMe = response.data.lockedBy.id === user?.id;
        setIsLocked(!isLockedByMe);
        setLockedBy(isLockedByMe ? null : response.data.lockedBy);
      } else {
        setIsLocked(false);
        setLockedBy(null);
      }
    } catch (error) {
    }
  }, [ticketId, user]);

  useEffect(() => {
    if (!ticketId) return;

    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('token') },
    });

    socketRef.current = socket;

    socket.emit('join-ticket', ticketId);

    socket.on('ticket-locked', (data) => {
      if (data.lockedBy.id !== user?.id) {
        setIsLocked(true);
        setLockedBy(data.lockedBy);
      }
    });

    socket.on('ticket-unlocked', (data) => {
      setIsLocked(false);
      setLockedBy(null);
    });

    checkLock();

    return () => {
      socket.emit('leave-ticket', ticketId);
      socket.disconnect();
      stopRefreshInterval();
    };
  }, [ticketId, user, checkLock, stopRefreshInterval]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      releaseLock();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        releaseLock();
      } else {
        checkLock();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [releaseLock, checkLock]);

  return {
    isLocked,
    lockedBy,
    isAcquiring,
    acquireLock,
    releaseLock,
    refreshLock,
  };
};
