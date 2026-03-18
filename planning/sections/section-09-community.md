I now have all the information needed to write the section. Let me compose the complete section content.

# section-09-community

## Overview

This section covers the complete rewrite of `CommunityScreen.tsx` as a Discord-like three-panel layout. The existing file already has a working but mobile-only tab-based layout. The new implementation upgrades it to a proper three-panel desktop layout with proper channel filtering (using the new `Message.channel` field), collapsible channel categories, emoji reactions, reply support, and a voice room "Katıl" button that triggers the lobby overlay from section-10.

**Depends on:**
- `section-01-store` — for `activeLobbyRoom`, `openLobby`, `closeLobby`, `Message.channel` field, updated `sendMessage` that attaches `channel`
- `section-02-constants-mockdata` — for `mockChatMessages` with `channel` ids set

**Blocks:**
- `section-10-lobby` — `LobbyRoom` is conditionally rendered inside `CommunityScreen`

---

## Tests

### TypeScript Checks (run `npm run build`)

Before adding the `channel` field to `Message` and updating `sendMessage`:

- `Message.channel: string` must be a required field (not optional) — all messages must belong to a channel
- `mockChatMessages` in `mock-data.ts` must type-check with the new `channel` field on every entry
- `sendMessage` inside the store must use `get().activeChannel` (correct Zustand pattern) to attach channel to the new message: `channel: get().activeChannel`
- `openLobby: (roomId: string) => void` and `closeLobby: () => void` must compile and be accessible from `CommunityScreen`
- `activeLobbyRoom: string | null` must initialize as `null`

### Logic Verification (manual browser console / vitest)

```
// Channel filtering
sendMessage("hello") when activeChannel === 'gen'
→ new message has channel: 'gen'

setActiveChannel('mat')
→ messages filtered to channel === 'mat' (most messages from mockChatMessages will not appear)
→ messages from 'gen' channel are hidden
```

### Manual Browser Verification

**Desktop layout (>= 700px viewport):**
- All three panels are visible simultaneously
- Left sidebar (`240px`) is fixed width and scrolls independently when channel list is long
- Right sidebar (`240px`) is fixed width and scrolls independently
- Center panel fills remaining width with `flex: 1`
- Switching channels via left sidebar updates `activeChannel` in store and re-filters messages

**Mobile layout (< 700px viewport):**
- Three-tab bar appears at the top: "Kanallar / Sohbet / Üyeler"
- Each tab shows only the correct panel
- No horizontal overflow / scrollbar

**Reactions:**
- Hovering a message shows a reaction bar (8 preset emojis + "+" button)
- Clicking an emoji adds a reaction pill with count = 1, `reacted: true` styling
- Clicking the same emoji again removes the reaction
- Clicking an emoji that already has reactions by others increments count and marks `reacted: true`

**Reply:**
- Clicking the reply icon (↩) sets local `replyingTo` state and shows a preview bar above the input
- Clicking "×" on the preview bar clears `replyingTo`
- Sending while replying calls `sendMessage(text, replyingTo.id)`

**Voice rooms:**
- Voice rooms listed below text channels in the left sidebar
- Each room shows name, occupied/capacity bar
- "Katıl" button calls `openLobby(room.id)` — this sets `activeLobbyRoom` in the store
- After clicking "Katıl", the LobbyRoom overlay appears (section-10 concern)

---

## Implementation Details

### File to Rewrite

**`/home/behlul/studyquest/src/components/screens/CommunityScreen.tsx`**

The existing file (~370 lines) is already structurally correct for mobile-only. It needs to be refactored to:
1. Add desktop three-panel layout
2. Filter messages by `activeChannel` (requires `Message.channel` from section-01)
3. Connect voice room "Katıl" to `openLobby` instead of `joinRoom`
4. Conditionally render `<LobbyRoom />` overlay (when section-10 is ready)

### Pre-requisite Store Changes (from section-01)

These must be in place before implementing this section:

The `Message` interface in `/home/behlul/studyquest/src/store/index.ts` currently lacks a `channel` field. It must be added:

```typescript
export interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  userColor: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; reacted?: boolean }[];
  isSystem?: boolean;
  replyTo?: string;
  channel: string;  // NEW — required, not optional
}
```

The `sendMessage` action must be updated to attach the current channel:

```typescript
sendMessage: (text, replyTo) => {
  if (!text.trim()) return;
  // ...timestamp logic unchanged...
  set(s => ({
    messages: [...s.messages, {
      id: `m${Date.now()}`,
      userId: 'u1',
      userName: s.user.name,
      userEmoji: s.user.emoji,
      userColor: '#7B5CF5',
      content: text,
      timestamp,
      reactions: [],
      replyTo,
      channel: get().activeChannel,  // NEW
    }]
  }));
},
```

The store root must also have:

```typescript
activeLobbyRoom: string | null;  // at root level, not inside user
openLobby: (roomId: string) => void;
closeLobby: () => void;
```

In `StoreState`:
```typescript
activeLobbyRoom: string | null;
openLobby: (roomId: string) => void;
closeLobby: () => void;
```

These actions should set `activeLobbyRoom` and call the existing `joinRoom`/`leaveRoom` actions:

```typescript
activeLobbyRoom: null,
openLobby: (roomId) => { set({ activeLobbyRoom: roomId }); get().joinRoom(roomId); },
closeLobby: () => { const r = get().activeLobbyRoom; set({ activeLobbyRoom: null }); if (r) get().leaveRoom(r); },
```

### Pre-requisite Mock Data Changes (from section-02)

`mockChatMessages` in `/home/behlul/studyquest/src/lib/mock-data.ts` must have `channel` added to every entry. The existing messages should all be in the `'gen'` channel (matching `mockChannels` entry `{ id: 'gen', name: 'genel-sohbet', ... }`):

```typescript
export const mockChatMessages = [
  { id: 'm1', ..., channel: 'gen' },
  { id: 'm2', ..., channel: 'gen' },
  // ... all existing messages get channel: 'gen'
];
```

Optionally add a few messages with `channel: 'mat'` to verify channel switching works.

### CommunityScreen Architecture

The component uses the following local state:

```typescript
// Panel visibility — only used when viewport is narrow
const [panel, setPanel] = useState<Panel>('chat');

// Collapsed categories in left sidebar
const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

// Message input and reply
const [inputText, setInputText] = useState('');
const [replyingTo, setReplyingTo] = useState<Message | null>(null);  // full Message object, not just id

// Hover for reaction bar
const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);

// Expanded emoji picker per message
const [expandedPicker, setExpandedPicker] = useState<string | null>(null);

// Status menu
const [showStatusMenu, setShowStatusMenu] = useState(false);
```

Store selectors (use narrow selectors to avoid re-renders):

```typescript
const messages = useStore(state => state.messages);
const activeChannel = useStore(state => state.activeChannel);
const voiceRooms = useStore(state => state.voiceRooms);
const joinedRooms = useStore(state => state.joinedRooms);
const activeLobbyRoom = useStore(state => state.activeLobbyRoom);
const user = useStore(state => state.user);
const userStatus = useStore(state => state.userStatus);
const sendMessage = useStore(state => state.sendMessage);
const addReaction = useStore(state => state.addReaction);
const setActiveChannel = useStore(state => state.setActiveChannel);
const openLobby = useStore(state => state.openLobby);
const setUserStatus = useStore(state => state.setUserStatus);
```

### Three-Panel Desktop Layout Structure

The outer container must have:

```
height: calc(100vh - 140px)
display: flex
flex-direction: row   ← only on desktop
overflow: hidden
```

On mobile (< 700px) the flex-direction switches to column and the tab bar is shown.

**Responsive breakpoint approach:** Use a `useEffect` + `window.innerWidth` to set a `const isMobile = width < 700` local state, updated on `resize`. Or use a CSS-only approach with a wrapper class. Since the project uses inline React styles, the `isMobile` boolean state approach is preferred.

```typescript
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 700);
  check();
  window.addEventListener('resize', check);
  return () => window.removeEventListener('resize', check);
}, []);
```

### Left Sidebar

Width: `240px`, `flexShrink: 0`, `overflowY: 'auto'`, `background: 'var(--s2)'`

On mobile this panel is only rendered when `panel === 'channels'`.

**Server header block:**
```tsx
<div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
  <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700 }}>📚 StudyQuest</div>
  <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#10B981' }}>🟢 247 çevrimiçi</div>
</div>
```

**Voice rooms section:**

Map over `voiceRooms`. For each room:
- Show emoji, room name, occupied/capacity bar
- Show "Katıl" button that calls `openLobby(room.id)` — NOT `joinRoom`
- Show "Çık" button when room is in `joinedRooms`, which calls `closeLobby()`
- The `isJoined` check still uses `joinedRooms.includes(room.id)` for styling purposes

```tsx
const isJoined = joinedRooms.includes(room.id);
// Button:
onClick={() => isJoined ? store.closeLobby() : store.openLobby(room.id)}
// Label:
{isJoined ? 'Çık' : 'Katıl'}
```

**Text channels — collapsible groups:**

Two groups: `"lessons"` (label: "Ders Kanalları") and `"general"` (label: "Genel"). Each group has a toggle button using local `collapsedCategories` state:

```typescript
const toggleCategory = (cat: string) => {
  setCollapsedCategories(prev => {
    const next = new Set(prev);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    return next;
  });
};
```

When a category is collapsed, only the header row is shown (no channel items). The header row shows a chevron icon (Lucide `ChevronDown`/`ChevronRight`) indicating collapse state.

Each channel item shows:
- `#` icon (Lucide `Hash`) in `var(--dim)` color
- Channel name in Rajdhani font — bold and `var(--text)` color if `unread > 0`, muted otherwise
- Active channel: `background: 'rgba(123,92,245,.1)'` and colored text `var(--cyan)`
- Unread dot: small red circle with count if `unread > 0`
- `onClick`: calls `setActiveChannel(ch.id)`

**User panel at bottom of left sidebar:**

```tsx
<div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
  {/* user emoji avatar */}
  {/* user name + status */}
  {/* settings button with status menu dropdown */}
</div>
```

This is identical to the existing implementation and can be kept as-is.

### Center Panel — Message List

`flex: 1`, `display: flex`, `flexDirection: 'column'`, `overflow: 'hidden'`

On mobile this is shown when `panel === 'chat'`.

**Channel header:**
```tsx
<div style={{ padding: '8px 12px', background: 'var(--s1)', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
  <span style={{ fontFamily: 'Space Mono', fontSize: 14, color: '#22D3EE' }}>#</span>
  <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#22D3EE', flex: 1 }}>
    {activeChannelData?.name || 'genel-sohbet'}
  </span>
  <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>👥 247</span>
</div>
```

**Filtered messages:**

```typescript
const activeChannelData = mockChannels.find(c => c.id === activeChannel);
const filteredMessages = messages.filter(m => m.channel === activeChannel);
```

Map over `filteredMessages` to render messages. The existing grouping logic is preserved (compare `msg.userId` to `prevMsg.userId`).

**Message grouping:** If a message's `userId` matches the previous message's `userId`, render in compact form (no avatar, no username header, small left padding indent to align with grouped messages). Otherwise render the full row with avatar circle + username + timestamp.

**Reply thread indicator:** If `msg.replyTo` is set, show a small reply reference above the message content:
```tsx
{msg.replyTo && (
  <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginBottom: 2, paddingLeft: grouped ? 0 : 40 }}>
    ↩ {messages.find(m => m.id === msg.replyTo)?.userName}
  </div>
)}
```

**Reaction pills:** Render below message content when `msg.reactions.length > 0`. Each pill: `emoji + count`. Highlighted style when `r.reacted === true`: `border: '1px solid rgba(123,92,245,.4)'`, `background: 'rgba(123,92,245,.15)'`, `color: '#9D82F8'`.

**Hover reaction bar:** Show when `hoveredMsg === msg.id`. Position: `position: 'absolute'`, `top: -16`, `right: 12`. Contains 8 quick reaction emoji buttons + reply button:

```typescript
const QUICK_REACTIONS = ['👍', '❤️', '🔥', '💡', '✅', '😂', '💪', '🎉'];
```

Each button calls `addReaction(msg.id, emoji)`. The reply button sets `replyingTo = msg` (full `Message` object).

**Auto-scroll:** The existing `chatEndRef` / `useEffect` pattern is preserved unchanged:
```typescript
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [filteredMessages.length]);
```

**Empty state:** When `filteredMessages.length === 0`:
```tsx
<div style={{ padding: 24, textAlign: 'center' }}>
  <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
  <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--dim)' }}>
    Bu kanalda henüz mesaj yok. İlk mesajı sen gönder!
  </div>
</div>
```

### Center Panel — Message Input

The input area is `<textarea>` (not `<input>`) to support multi-line input. Auto-resize up to 4 lines. Height adjusts with `onInput`:

```typescript
const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const el = e.currentTarget;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 4 * 22) + 'px';  // 22px per line approx
};
```

`onKeyDown`:
- `Enter` (without Shift): calls `handleSend()`, prevents default
- `Shift+Enter`: allows newline (default behavior, no prevention needed)

**Reply preview bar** (shown above textarea when `replyingTo !== null`):
```tsx
{replyingTo && (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 6, background: 'rgba(123,92,245,.08)', borderLeft: '2px solid #7B5CF5', borderRadius: 4 }}>
    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#7B5CF5', flex: 1 }}>
      ↩ {replyingTo.userName}&apos;a yanıtlıyorsun
    </span>
    <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--dim)', cursor: 'pointer', fontSize: 14 }}>×</button>
  </div>
)}
```

**`handleSend` function:**
```typescript
const handleSend = () => {
  if (!inputText.trim()) return;
  sendMessage(inputText.trim(), replyingTo?.id);
  setInputText('');
  setReplyingTo(null);
};
```

### Right Sidebar — Member List

Width: `240px`, `flexShrink: 0`, `overflowY: 'auto'`, `background: 'var(--s2)'`

On mobile this is shown when `panel === 'members'`.

**Status priority sort order:** `studying > online > break > dnd > offline`

```typescript
const STATUS_ORDER: Record<string, number> = {
  studying: 0, online: 1, break: 2, dnd: 3, offline: 4
};
```

**Grouping:** Two sections: "ÇEVRİMİÇİ" and "ÇEVRİMDIŞI".

Online members = `mockOnlineMembers` filtered/sorted by `STATUS_ORDER`. The current user is injected at the top of the online group with a `(Sen)` suffix on their name.

Offline section is static (shows a "216 kişiyi gör →" button as in the existing code).

**Member row:**
```tsx
<div key={m.id} style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
  {/* Status color dot */}
  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[m.status], flexShrink: 0 }} />
  {/* Emoji avatar */}
  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${m.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
    {m.emoji}
  </div>
  {/* Name + status text */}
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {m.name} {m.id === user.id && <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>(Sen)</span>}
    </div>
    <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: m.color }}>{m.statusText}</div>
  </div>
</div>
```

Current user `id` is `'u1'` (matching `mockUser.id`) — use `user.id` from store to stay flexible.

### Mobile Tab Bar

When `isMobile === true`, show the tab bar at the top and render only the active panel:

```typescript
type Panel = 'channels' | 'chat' | 'members';
const PANEL_TABS: Panel[] = ['channels', 'chat', 'members'];
const PANEL_LABELS = ['Kanallar', 'Sohbet', 'Üyeler'];
```

The tab bar style (Orbitron font, active underline in `--cyan`) is kept from the existing implementation.

When `isMobile === false`, all three panels are rendered side-by-side in the flex row and the tab bar is hidden.

### LobbyRoom Integration (section-10 stub)

In `CommunityScreen`, import `LobbyRoom` from section-10 and conditionally render it:

```typescript
// Import (add after section-10 is implemented)
// import { LobbyRoom } from '@/components/screens/LobbyRoom';

// Render at the bottom of the component's return statement:
{activeLobbyRoom !== null && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
    {/* <LobbyRoom /> */}
  </div>
)}
```

Until section-10 is complete, this block can be a placeholder div or commented out. The `activeLobbyRoom` check in the store is all that is needed from this section's perspective.

### Status Colors Reference

These constants are used across multiple sub-sections of this component:

```typescript
const statusColors: Record<string, string> = {
  online: '#10B981',
  studying: '#22D3EE',
  break: '#F59E0B',
  dnd: '#EF4444',
  offline: '#64748B',
};
const statusLabels: Record<string, string> = {
  online: 'Çevrimiçi',
  studying: 'Çalışıyor',
  break: 'Mola',
  dnd: 'Rahatsız Etme',
  offline: 'Görünmez',
};
```

### Styling Notes

- All new UI follows existing CSS variable palette: `var(--bg)`, `var(--s1)`, `var(--s2)`, `var(--text)`, `var(--muted)`, `var(--dim)`, `var(--purple)`, `var(--cyan)`
- Fonts: Orbitron for headings/labels, Rajdhani for body/names, Space Mono for numbers/badges/timestamps
- No external UI libraries — all components are built with plain HTML + inline React styles
- The outer container height formula: `height: 'calc(100vh - 140px)'` accounts for the top navigation header + bottom tab bar

### Summary of Changes Required

| File | Change Type | What Changes |
|------|-------------|--------------|
| `/src/store/index.ts` | Update (section-01) | Add `Message.channel`, update `sendMessage`, add `activeLobbyRoom`, `openLobby`, `closeLobby` to `StoreState` and implementation |
| `/src/lib/mock-data.ts` | Update (section-02) | Add `channel: 'gen'` to all `mockChatMessages` entries |
| `/src/components/screens/CommunityScreen.tsx` | Rewrite | Full rewrite as described above |