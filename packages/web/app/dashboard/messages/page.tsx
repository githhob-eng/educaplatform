// packages/web/app/dashboard/messages/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  de_id: string;
  de_nombre: string;
  para_id: string;
  para_nombre: string;
  contenido: string;
  fecha: string;
  leido: boolean;
}

interface User {
  id: string;
  nombre: string;
  rol: string;
  dni: string;
  email: string;
}

interface ConversationItem {
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: string;
  ultimo_mensaje: string;
  fecha_ultimo: string;
  no_leidos: number;
  es_remitente_actual: boolean;
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // CARGAR DATOS
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadInitialData();
  }, []);

  // SCROLL AL FINAL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUserId]);

  // ACTUALIZAR CONVERSACIONES
  useEffect(() => {
    if (!user) return;
    updateConversations();
  }, [messages, user]);

  // MARCAR COMO LEÍDO
  useEffect(() => {
    if (!selectedUserId || !user) return;
    
    const updated = messages.map(m =>
      m.para_id === user.id && m.de_id === selectedUserId && !m.leido
        ? { ...m, leido: true }
        : m
    );
    
    if (JSON.stringify(updated) !== JSON.stringify(messages)) {
      setMessages(updated);
      localStorage.setItem('messages_app', JSON.stringify(updated));
    }
  }, [selectedUserId]);

  const loadInitialData = async () => {
    try {
      const response = await fetch('http://https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users');
      const data = await response.json();
      setAllUsers(data.users || []);
    } catch (error) {
      console.error('Error:', error);
    }

    const saved = localStorage.getItem('messages_app');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    }

    setLoading(false);
  };

  const updateConversations = () => {
    if (!user) return;

    const convMap: { [key: string]: ConversationItem } = {};

    messages.forEach(msg => {
      const otroUsuarioId = msg.de_id === user.id ? msg.para_id : msg.de_id;
      const otroUsuario = allUsers.find(u => u.id === otroUsuarioId);

      if (!convMap[otroUsuarioId]) {
        convMap[otroUsuarioId] = {
          usuario_id: otroUsuarioId,
          usuario_nombre: otroUsuario?.nombre || 'Usuario',
          usuario_rol: otroUsuario?.rol || 'USER',
          ultimo_mensaje: msg.contenido,
          fecha_ultimo: msg.fecha,
          no_leidos: 0,
          es_remitente_actual: msg.de_id === user.id,
        };
      }

      convMap[otroUsuarioId].ultimo_mensaje = msg.contenido;
      convMap[otroUsuarioId].fecha_ultimo = msg.fecha;
      convMap[otroUsuarioId].es_remitente_actual = msg.de_id === user.id;

      if (msg.para_id === user.id && !msg.leido) {
        convMap[otroUsuarioId].no_leidos++;
      }
    });

    const sorted = Object.values(convMap).sort(
      (a, b) => new Date(b.fecha_ultimo).getTime() - new Date(a.fecha_ultimo).getTime()
    );

    setConversations(sorted);
  };

  const filteredUsers = searchTerm.trim()
    ? allUsers.filter(
        u =>
          u.id !== user?.id &&
          (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.dni.includes(searchTerm))
      )
    : [];

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserSearch(false);
    setSearchTerm('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId || !user) return;

    const selectedUser = allUsers.find(u => u.id === selectedUserId);
    const msg: Message = {
      id: 'msg-' + Date.now(),
      de_id: user.id,
      de_nombre: user.nombre,
      para_id: selectedUserId,
      para_nombre: selectedUser?.nombre || 'Usuario',
      contenido: newMessage,
      fecha: new Date().toISOString(),
      leido: false,
    };

    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem('messages_app', JSON.stringify(updated));
    setNewMessage('');
  };

  const currentMessages = selectedUserId
    ? messages.filter(
        m =>
          (m.de_id === user?.id && m.para_id === selectedUserId) ||
          (m.de_id === selectedUserId && m.para_id === user?.id)
      )
    : [];

  const selectedUserData = selectedUserId
    ? allUsers.find(u => u.id === selectedUserId)
    : null;

  const styles = {
    page: { padding: '0' },
    header: { marginBottom: '24px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
    mainContainer: { display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', height: 'calc(100vh - 200px)' },
    
    // SIDEBAR
    sidebar: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    sidebarHeader: { padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    sidebarTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1f2937' },
    newChatBtn: { padding: '6px 12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
    searchBox: { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: showUserSearch ? 'block' : 'none' },
    searchInput: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: '8px' },
    searchResults: { maxHeight: '250px', overflowY: 'auto' as const },
    searchResultItem: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s' },
    conversationsContainer: { flex: 1, overflowY: 'auto' as const, display: 'flex', flexDirection: 'column' as const },
    conversationItem: { padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.2s', borderLeft: '3px solid transparent' },
    conversationItemActive: { backgroundColor: '#f0f4ff', borderLeftColor: '#4f46e5' },
    conversationName: { fontWeight: '600', color: '#1f2937', fontSize: '13px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    conversationPreview: { fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' as const, overflow: 'hidden' as const, textOverflow: 'ellipsis' },
    badge: { display: 'flex', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' },
    emptyConversations: { padding: '32px 16px', textAlign: 'center' as const, color: '#9ca3af', fontSize: '13px' },

    // CHAT
    chatContainer: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    chatHeader: { padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' },
    chatHeaderTitle: { fontSize: '14px', fontWeight: 'bold', color: '#1f2937' },
    chatHeaderSub: { fontSize: '12px', color: '#9ca3af', marginTop: '2px' },
    messagesArea: { flex: 1, overflowY: 'auto' as const, padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '12px' },
    message: { display: 'flex', marginBottom: '8px' },
    messageBox: { padding: '10px 14px', borderRadius: '8px', maxWidth: '70%', wordWrap: 'break-word' as const, fontSize: '13px', lineHeight: '1.4' },
    messageMine: { alignSelf: 'flex-end' as const, backgroundColor: '#4f46e5', color: '#fff' },
    messageOther: { alignSelf: 'flex-start' as const, backgroundColor: '#f3f4f6', color: '#1f2937' },
    messageTime: { fontSize: '11px', color: '#9ca3af', marginTop: '4px' },
    inputArea: { padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' },
    messageInput: { flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', resize: 'none' as const, maxHeight: '100px' },
    sendBtn: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
    emptyChat: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' },
    emptyIcon: { fontSize: '48px', marginBottom: '12px' },
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>💬 Mensajes</h1>
        <p style={styles.subtitle}>Comunicación directa con usuarios</p>
      </div>

      <div style={styles.mainContainer}>
        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>Conversaciones</div>
            <button style={styles.newChatBtn} onClick={() => setShowUserSearch(!showUserSearch)}>
              {showUserSearch ? '✕' : '➕'}
            </button>
          </div>

          {showUserSearch && (
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Busca por nombre o DNI..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {filteredUsers.length > 0 && (
                <div style={styles.searchResults}>
                  {filteredUsers.map(u => (
                    <div
                      key={u.id}
                      style={styles.searchResultItem}
                      onClick={() => handleSelectUser(u.id)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <div style={{ fontWeight: '600', fontSize: '12px', color: '#1f2937' }}>
                        {u.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {u.rol}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={styles.conversationsContainer}>
            {conversations.length > 0 ? (
              conversations.map(conv => (
                <div
                  key={conv.usuario_id}
                  style={{
                    ...styles.conversationItem,
                    ...(selectedUserId === conv.usuario_id ? styles.conversationItemActive : {}),
                  }}
                  onClick={() => handleSelectUser(conv.usuario_id)}
                  onMouseEnter={(e) => {
                    if (selectedUserId !== conv.usuario_id) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUserId !== conv.usuario_id) {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }
                  }}
                >
                  <div style={styles.conversationName}>
                    <span>{conv.usuario_nombre}</span>
                    {conv.no_leidos > 0 && (
                      <span style={styles.badge}>{conv.no_leidos}</span>
                    )}
                  </div>
                  <div style={styles.conversationPreview}>
                    {conv.no_leidos > 0 ? <strong>{conv.ultimo_mensaje}</strong> : conv.ultimo_mensaje}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyConversations}>
                📭 Sin conversaciones<br />Inicia una nueva con ➕
              </div>
            )}
          </div>
        </div>

        {/* CHAT */}
        {selectedUserId ? (
          <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
              <div>
                <div style={styles.chatHeaderTitle}>{selectedUserData?.nombre}</div>
                <div style={styles.chatHeaderSub}>{selectedUserData?.rol}</div>
              </div>
              <button
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onClick={() => setSelectedUserId(null)}
              >
                ✕ Cerrar
              </button>
            </div>

            <div style={styles.messagesArea}>
              {currentMessages.length > 0 ? (
                currentMessages.map(msg => (
                  <div key={msg.id} style={styles.message}>
                    <div>
                      <div
                        style={{
                          ...styles.messageBox,
                          ...(msg.de_id === user.id ? styles.messageMine : styles.messageOther),
                        }}
                      >
                        {msg.contenido}
                      </div>
                      <div style={styles.messageTime}>
                        {new Date(msg.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyChat}>
                  <div style={styles.emptyIcon}>💭</div>
                  <p>Sin mensajes aún</p>
                  <p style={{ fontSize: '12px' }}>Inicia la conversación</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <textarea
                style={{
                  ...styles.messageInput,
                  height: newMessage.split('\n').length > 3 ? '80px' : '40px',
                }}
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                style={{ ...styles.sendBtn, opacity: newMessage.trim() ? 1 : 0.5 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                📤
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.chatContainer}>
            <div style={styles.emptyChat}>
              <div style={styles.emptyIcon}>💬</div>
              <p>Selecciona una conversación</p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>o inicia una nueva</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
