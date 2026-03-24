import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config/config';
import { getAuthToken } from '../utils/session';
import apiClient from '../services/apiClient';

function normId(v) {
  return String(v ?? '')
    .toLowerCase()
    .replace(/-/g, '');
}

export function useEventChat(eventId, chatId) {
  const [messages, setMessages]           = useState([]);
  const [connected, setConnected]         = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [messagesReady, setMessagesReady] = useState(false);

  // Refs that are always current — safe to read inside socket callbacks
  const viewerIdRef   = useRef('');
  const connectedRef  = useRef(false);
  const socketRef     = useRef(null);

  // Keep connectedRef in sync with state so sendMessage never reads stale value
  useEffect(() => { connectedRef.current = connected; }, [connected]);

  // ─── Helper: add or ignore a message (deduplicates by id) ────────────────
  const appendMessage = useCallback((incoming) => {
    if (!incoming?.id) return;
    const vid    = viewerIdRef.current;
    const isMine =
      incoming.is_mine !== undefined
        ? incoming.is_mine
        : Boolean(vid && normId(incoming.sender_id) === normId(vid));
    const normalized = { ...incoming, is_mine: Boolean(isMine) };
    setMessages((prev) => {
      const exists = prev.some((m) => String(m.id) === String(normalized.id));
      return exists ? prev : [...prev, normalized];
    });
  }, []);

  // ─── Load message history whenever chatId changes ────────────────────────
  useEffect(() => {
    let cancelled = false;
    setMessagesReady(false);
    setMessages([]);

    if (!chatId) {
      setMessagesReady(true);
      return;
    }

    apiClient
      .get(`/api/community/chats/${chatId}/messages?limit=100`)
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.messages) ? data.messages : [];
        const vid  = String(data?.viewerId || data?.viewer_id || '');
        if (vid) viewerIdRef.current = vid;
        setMessages(
          list.map((m) => ({
            ...m,
            is_mine:
              m.is_mine !== undefined
                ? m.is_mine
                : Boolean(vid && normId(m.sender_id) === normId(vid)),
          }))
        );
      })
      .catch(() => { if (!cancelled) setMessages([]); })
      .finally(() => { if (!cancelled) setMessagesReady(true); });

    return () => { cancelled = true; };
  }, [chatId]);

  // ─── Mark chat as read on unmount / chatId change ────────────────────────
  useEffect(() => {
    if (!chatId) return;
    return () => {
      apiClient
        .post(`/api/community/chats/${encodeURIComponent(chatId)}/read`)
        .catch(() => {});
    };
  }, [chatId]);

  // ─── Socket lifecycle — created once per (eventId, chatId) pair ──────────
  useEffect(() => {
    const token = getAuthToken();
    if (!token || !eventId || !chatId) return;

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 8000,
    });
    socketRef.current = socket;

    // Named handlers so we can remove them precisely
    const onConnect = () => {
      setConnected(true);
      setConnectionError('');
      socket.emit('chat:join', { eventId, chatId });
    };
    const onReconnectAttempt = () => setConnectionError('Reconnecting…');
    const onDisconnect       = () => setConnected(false);
    const onConnectError     = (err) => {
      setConnected(false);
      setConnectionError(err?.message || 'Socket connection failed');
    };
    const onMessageNew = (message) => {
      // Only handle messages for this specific chat room
      if (String(message.chat_id) !== String(chatId)) return;
      appendMessage(message);
    };
    const onMessageStatus = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status } : m))
      );
    };

    socket.on('connect',           onConnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('disconnect',        onDisconnect);
    socket.on('connect_error',     onConnectError);
    socket.on('message:new',       onMessageNew);
    socket.on('message:status',    onMessageStatus);

    return () => {
      socket.off('connect',           onConnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('disconnect',        onDisconnect);
      socket.off('connect_error',     onConnectError);
      socket.off('message:new',       onMessageNew);
      socket.off('message:status',    onMessageStatus);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, chatId, appendMessage]);

  // ─── HTTP fallback send ───────────────────────────────────────────────────
  const postByHttp = useCallback(
    async (content) => {
      try {
        const { data } = await apiClient.post(
          `/api/community/chats/${encodeURIComponent(chatId)}/messages`,
          { content }
        );
        if (data?.message) appendMessage(data.message);
        return { ok: true, message: data?.message, via: 'http' };
      } catch (error) {
        return { ok: false, error: error.response?.data?.message || 'Message send failed' };
      }
    },
    [chatId, appendMessage]
  );

  // ─── Send (socket with HTTP fallback) ────────────────────────────────────
  const sendMessage = useCallback(
    async (content) => {
      const socket = socketRef.current;
      if (!socket || !connectedRef.current) return postByHttp(content);

      return new Promise((resolve) => {
        let settled = false;

        const fallbackTimer = setTimeout(async () => {
          if (settled) return;
          settled = true;
          resolve(await postByHttp(content));
        }, 2500);

        socket.emit('message:send', { chatId, content }, async (response) => {
          if (settled) return;
          clearTimeout(fallbackTimer);
          settled = true;

          if (response?.ok) {
            if (response.message) appendMessage(response.message);
            resolve(response);
          } else {
            resolve(await postByHttp(content));
          }
        });
      });
    },
    [chatId, postByHttp, appendMessage]
  );

  const markSeen = useCallback(
    (messageId) => socketRef.current?.emit('message:seen', { chatId, messageId }),
    [chatId]
  );

  return { connected, connectionError, messagesReady, messages, sendMessage, markSeen };
}
