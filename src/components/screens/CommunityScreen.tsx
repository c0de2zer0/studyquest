'use client';
import { useStore } from '@/store';
import { mockChannels, mockOnlineMembers } from '@/lib/mock-data';
import { useState, useRef, useEffect } from 'react';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '💡', '✅', '😂', '💪', '🎉'];

type Panel = 'channels' | 'chat' | 'members';

const STATUS_ORDER: Record<string, number> = { studying: 0, online: 1, break: 2, dnd: 3, offline: 4 };

export function CommunityScreen() {
  const {
    messages, activeChannel, joinedRooms, voiceRooms,
    sendMessage, addReaction, setActiveChannel, openLobby, closeLobby, activeLobbyRoom,
    userStatus, setUserStatus, user,
  } = useStore();

  const [panel, setPanel] = useState<Panel>('chat');
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<typeof messages[0] | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filteredMessages = messages.filter(m => m.channel === activeChannel);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim(), replyingTo?.id);
    setInputText('');
    setReplyingTo(null);
  };

  const activeChannelData = mockChannels.find(c => c.id === activeChannel);
  const lessonChannels = mockChannels.filter(c => c.category === 'lessons');
  const generalChannels = mockChannels.filter(c => c.category === 'general');

  const statusColors: Record<string, string> = { online: '#10B981', studying: '#22D3EE', break: '#F59E0B', dnd: '#EF4444', offline: '#64748B' };
  const statusEmojis: Record<string, string> = { online: '🟢', studying: '⏱', break: '🟡', dnd: '🔴', offline: '⚫' };
  const statusLabels: Record<string, string> = { online: 'Çevrimiçi', studying: 'Çalışıyor', break: 'Mola', dnd: 'Rahatsız Etme', offline: 'Görünmez' };

  const sortedMembers = [...mockOnlineMembers].sort((a, b) =>
    (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5)
  );

  const PANEL_TABS: Panel[] = ['channels', 'chat', 'members'];
  const PANEL_LABELS = ['Kanallar', 'Sohbet', 'Üyeler'];

  // ─── Left Sidebar ───────────────────────────────────────────────────────────
  const LeftSidebar = (
    <div style={{
      width: isMobile ? '100%' : 240, flexShrink: 0, overflowY: 'auto',
      background: 'var(--s2)', display: 'flex', flexDirection: 'column',
      borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,.06)',
    }}>
      {/* Server header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>📚 StudyQuest</div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#10B981' }}>🟢 247 çevrimiçi</div>
      </div>

      {/* Voice rooms */}
      <div style={{ padding: '10px 0' }}>
        <div style={{ padding: '4px 14px 6px', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', letterSpacing: 1, textTransform: 'uppercase' }}>🔊 SESLİ ODALAR</div>
        {voiceRooms.map(room => {
          const isJoined = joinedRooms.includes(room.id);
          const occPct = (room.occupied / room.capacity) * 100;
          return (
            <div key={room.id} style={{
              padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8,
              borderLeft: isJoined ? '2px solid #10B981' : '2px solid transparent',
              background: isJoined ? 'rgba(16,185,129,.05)' : 'transparent',
            }}>
              <span style={{ fontSize: 14 }}>{room.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: isJoined ? '#10B981' : 'var(--text)' }}>{room.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1 }}>
                    <div style={{ height: '100%', width: `${occPct}%`, background: isJoined ? '#10B981' : '#7B5CF5', borderRadius: 1 }} />
                  </div>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>{room.occupied}/{room.capacity}</span>
                </div>
              </div>
              <button
                onClick={() => isJoined ? closeLobby() : openLobby(room.id)}
                style={{
                  fontFamily: 'Space Mono', fontSize: 7, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                  background: isJoined ? 'rgba(239,68,68,.1)' : 'rgba(16,185,129,.1)',
                  border: `1px solid ${isJoined ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'}`,
                  color: isJoined ? '#EF4444' : '#10B981',
                }}
              >{isJoined ? 'ÇIK' : 'KATIL'}</button>
            </div>
          );
        })}
      </div>

      {/* Text channels */}
      <div style={{ padding: '8px 0' }}>
        <div style={{ padding: '4px 14px 6px', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', letterSpacing: 1, textTransform: 'uppercase' }}>📚 DERS KANALLARI</div>
        {lessonChannels.map(ch => (
          <button key={ch.id} onClick={() => { setActiveChannel(ch.id); setPanel('chat'); }}
            style={{ width: '100%', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8, background: activeChannel === ch.id ? 'rgba(123,92,245,.1)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: activeChannel === ch.id ? '#22D3EE' : 'var(--dim)' }}>#</span>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, color: ch.unread ? 'var(--text)' : activeChannel === ch.id ? '#22D3EE' : 'var(--muted)', fontWeight: ch.unread ? 700 : 400, flex: 1 }}>{ch.name}</span>
            {ch.unread > 0 && <span style={{ fontFamily: 'Space Mono', fontSize: 8, background: '#EF4444', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ch.unread}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 0' }}>
        <div style={{ padding: '4px 14px 6px', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', letterSpacing: 1, textTransform: 'uppercase' }}>💬 GENEL</div>
        {generalChannels.map(ch => (
          <button key={ch.id} onClick={() => { setActiveChannel(ch.id); setPanel('chat'); }}
            style={{ width: '100%', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 8, background: activeChannel === ch.id ? 'rgba(123,92,245,.1)' : 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: activeChannel === ch.id ? '#22D3EE' : 'var(--dim)' }}>#</span>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, color: ch.unread ? 'var(--text)' : activeChannel === ch.id ? '#22D3EE' : 'var(--muted)', fontWeight: ch.unread ? 700 : 400, flex: 1 }}>{ch.name}</span>
            {ch.unread > 0 && <span style={{ fontFamily: 'Space Mono', fontSize: 8, background: '#EF4444', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ch.unread}</span>}
          </button>
        ))}
      </div>

      {/* User panel */}
      <div style={{ marginTop: 'auto', padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(123,92,245,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{user.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{user.name}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: statusColors[userStatus] }}>{statusEmojis[userStatus]} {statusLabels[userStatus]}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowStatusMenu(!showStatusMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>⚙️</button>
          {showStatusMenu && (
            <div style={{ position: 'absolute', bottom: '100%', right: 0, background: 'var(--s3)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: 4, zIndex: 50 }}>
              {(Object.entries(statusLabels) as [string, string][]).map(([k, v]) => (
                <button key={k} onClick={() => { setUserStatus(k as typeof userStatus); setShowStatusMenu(false); }}
                  style={{ width: '100%', padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}
                >
                  <span style={{ fontSize: 12 }}>{statusEmojis[k]}</span>
                  <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: statusColors[k] }}>{v}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Chat Panel ──────────────────────────────────────────────────────────────
  const ChatPanel = (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      {/* Channel header */}
      <div style={{ padding: '8px 12px', background: 'var(--s1)', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 14, color: '#22D3EE' }}>#</span>
        <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#22D3EE', flex: 1 }}>{activeChannelData?.name || 'genel-sohbet'}</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>👥 247</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div style={{ textAlign: 'center', margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>Bugün</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.06)' }} />
        </div>

        {filteredMessages.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--dim)' }}>Bu kanalda henüz mesaj yok. İlk mesajı sen gönder!</div>
          </div>
        )}

        {filteredMessages.map((msg, i) => {
          const prevMsg = filteredMessages[i - 1];
          const grouped = prevMsg && prevMsg.userId === msg.userId;
          return (
            <div key={msg.id} style={{ padding: grouped ? '1px 12px' : '6px 12px', position: 'relative' }}
              onMouseEnter={() => setHoveredMsg(msg.id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {msg.replyTo && (
                <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginBottom: 2, paddingLeft: grouped ? 0 : 40 }}>
                  ↩ {messages.find(m => m.id === msg.replyTo)?.userName}
                </div>
              )}
              {!grouped && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 2 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${msg.userColor}22`, border: `1px solid ${msg.userColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{msg.userEmoji}</div>
                  <div>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: msg.isSystem ? 'var(--dim)' : msg.userColor }}>{msg.userName}</span>
                    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginLeft: 8 }}>{msg.timestamp}</span>
                  </div>
                </div>
              )}
              <div style={{ paddingLeft: grouped ? 0 : 40 }}>
                <p style={{ fontFamily: 'Rajdhani', fontSize: 13, color: msg.isSystem ? 'var(--dim)' : 'var(--text)', lineHeight: 1.5, fontStyle: msg.isSystem ? 'italic' : 'normal' }}>{msg.content}</p>
                {msg.reactions.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {msg.reactions.map(r => (
                      <button key={r.emoji} onClick={() => addReaction(msg.id, r.emoji)}
                        style={{ fontFamily: 'Space Mono', fontSize: 9, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', background: r.reacted ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${r.reacted ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.08)'}`, color: r.reacted ? '#9D82F8' : 'var(--muted)' }}
                      >{r.emoji} {r.count}</button>
                    ))}
                  </div>
                )}
              </div>
              {hoveredMsg === msg.id && (
                <div style={{ position: 'absolute', top: -16, right: 12, background: 'var(--s2)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, padding: '2px 4px', display: 'flex', gap: 2, zIndex: 10 }}>
                  {QUICK_REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => addReaction(msg.id, emoji)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: '2px' }}>{emoji}</button>
                  ))}
                  <button onClick={() => setReplyingTo(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', padding: '2px 4px' }}>↩</button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div style={{ padding: '8px 12px', background: 'var(--s1)', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        {replyingTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 6, background: 'rgba(123,92,245,.08)', borderLeft: '2px solid #7B5CF5', borderRadius: 4 }}>
            <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#7B5CF5', flex: 1 }}>↩ {replyingTo.userName}&apos;a yanıtlıyorsun</span>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>×</button>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`#${activeChannelData?.name || 'genel'}'a mesaj yaz...`}
            style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '8px 12px', fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = 'rgba(123,92,245,.4)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.08)'; }}
          />
          <button onClick={handleSend} disabled={!inputText.trim()}
            style={{ width: 34, height: 34, borderRadius: 8, border: 'none', cursor: inputText.trim() ? 'pointer' : 'not-allowed', background: inputText.trim() ? 'linear-gradient(135deg, #7B5CF5, #22D3EE)' : 'rgba(255,255,255,.06)', color: 'white', fontSize: 16 }}
          >→</button>
        </div>
      </div>
    </div>
  );

  // ─── Right Sidebar ───────────────────────────────────────────────────────────
  const RightSidebar = (
    <div style={{ width: isMobile ? '100%' : 240, flexShrink: 0, overflowY: 'auto', background: 'var(--s2)', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', letterSpacing: 1 }}>ÇEVRİMİÇİ — {sortedMembers.length + 1}</div>
      </div>
      {/* Self */}
      <div style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[userStatus], flexShrink: 0 }} />
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(123,92,245,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{user.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: '#22D3EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name} <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>(Sen)</span>
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: statusColors[userStatus] }}>{statusLabels[userStatus]}</div>
        </div>
      </div>
      {sortedMembers.map(m => (
        <div key={m.id} style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[m.status] ?? '#64748B', flexShrink: 0 }} />
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${m.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{m.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: m.color }}>{m.statusText}</div>
          </div>
        </div>
      ))}
      <div style={{ padding: '8px 0' }}>
        <div style={{ padding: '4px 12px 6px', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', letterSpacing: 1 }}>ÇEVRİMDIŞI — 216</div>
        <div style={{ padding: '5px 12px' }}>
          <button style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer' }}>216 kişiyi gör →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 140px)', minHeight: 500, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Mobile tab bar */}
      {isMobile && (
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {PANEL_TABS.map((p, i) => (
            <button key={p} onClick={() => setPanel(p)}
              style={{ flex: 1, padding: '8px 0', fontFamily: 'Orbitron', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: panel === p ? '#22D3EE' : 'var(--dim)', borderBottom: panel === p ? '2px solid #22D3EE' : '2px solid transparent' }}
            >{PANEL_LABELS[i]}</button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
        {(!isMobile || panel === 'channels') && LeftSidebar}
        {(!isMobile || panel === 'chat') && ChatPanel}
        {(!isMobile || panel === 'members') && RightSidebar}
      </div>

      {/* LobbyRoom overlay — rendered when activeLobbyRoom is set (section-10) */}
      {activeLobbyRoom !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--s2)', border: '1px solid rgba(123,92,245,.3)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#22D3EE', marginBottom: 8 }}>🎮 Lobi Yükleniyor...</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 16 }}>Oda: {activeLobbyRoom}</div>
            <button onClick={closeLobby} style={{ fontFamily: 'Orbitron', fontSize: 8, padding: '8px 16px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#EF4444', borderRadius: 6, cursor: 'pointer' }}>LOBİDEN ÇIK</button>
          </div>
        </div>
      )}
    </div>
  );
}
