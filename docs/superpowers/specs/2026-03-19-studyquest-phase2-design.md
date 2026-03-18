# StudyQuest Phase 2 — Design Spec
> Date: 2026-03-19 | Status: Approved

## Overview

Four feature groups to implement in order:
1. Avatar visual fix
2. Community rewrite (Facebook-like feed + ders yarışması)
3. Dashboard improvements (quote, task %, lesson distribution)
4. Integration data → other pages + Analytics daily task chart

---

## Section 1 — Avatar Fix

**Problem:** Pixel art SVG layers misaligned, character looks unpleasant on AvatarScreen preview.

**Changes:**
- Redraw base character SVG on a 32×48px grid with clean humanoid silhouette (head, torso, arms, legs)
- Realign all equip slot positions (hair, top, bottom, shoes, accessory) to match the new grid
- Increase preview size on AvatarScreen, improve background contrast
- Ensure `imageRendering: 'pixelated'` and `image-rendering: crisp-edges` are correctly applied to all SVG layers

**Files:** `src/components/PixelAvatar.tsx`, `src/lib/avatar-layers.ts`, `src/components/screens/AvatarScreen.tsx`

---

## Section 2 — Community: Facebook-style Feed + Ders Yarışması

### Layout (3-panel Discord shell preserved)
- **Left sidebar:** channels + voice rooms (existing, kept)
- **Center panel:** Scrollable post feed (replaces chat-only view)
- **Right sidebar:** Online members (existing, kept)

### Post Feed
- Two post types selectable at creation:
  - **Normal post:** text content + emoji reactions
  - **Yarışma postu (Challenge):** subject, duration (30min / 1hr / 2hr), "KATIL" CTA button
- Post creation button at top of center panel; opens inline form
- Posts show: author avatar, name, timestamp, content, reaction bar

### Challenge Flow
1. User creates a challenge post (subject + duration)
2. Post appears in feed with participant count and "KATIL" button
3. Other users click "KATIL" → `openLobby(challengeId)` called → Lobby opens as overlay
4. Inside lobby: all participants' timers visible (mock), countdown running
5. On completion: result screen shown, LP awarded to top finisher

### Store Changes
- Add `CommunityPost` interface: `{ id, userId, userName, userEmoji, userColor, type: 'post'|'challenge', content, subject?, duration?, participants: string[], reactions, timestamp }`
- Add `communityPosts: CommunityPost[]` to store
- Add `createPost(post)`, `joinChallenge(postId)` actions
- Mock data: 6–8 sample posts (mix of normal + challenge)

**Files:** `src/components/screens/CommunityScreen.tsx`, `src/store/index.ts`, `src/lib/mock-data.ts`

---

## Section 3 — Dashboard Improvements

### 3a — Daily Motivational Quote Card
- Positioned at the very top of DashboardScreen, above all other cards
- Date-seeded selection: `quotes[dayOfYear % quotes.length]`
- 10 philosopher/thinker quotes stored as static array in `src/lib/constants.ts`
- Each entry: `{ text: string, author: string, initials: string, color: string }`
- Author shown as small circular avatar (colored initials, 28px) beside the quote text
- Subtle card style with left border accent color matching author color

### 3b — Daily Task Completion %
- Below the existing task list section
- Mini card: "Bugün: X/Y görev tamamlandı (Z%)" with a thin progress bar
- 7-day history: small bar chart (7 mini bars), each bar = % completed that day
- "Genel Ortalama: %67" derived from 7-day average
- Task history stored in store as `taskHistory: { date: string, done: number, total: number }[]`; populated on day change (mock: pre-filled 7 days)

### 3c — Lesson Distribution Source
- Add `userSubjects: Subject[]` to store, initialized from `SUBJECTS` constants + integration mock
- Analytics donut chart reads `userSubjects` instead of hardcoded `mockSubjectDistribution`
- Dashboard lesson distribution (if shown) also reads `userSubjects`

**Files:** `src/components/screens/DashboardScreen.tsx`, `src/lib/constants.ts`, `src/store/index.ts`

---

## Section 4 — Integration Data → Other Pages + Analytics Task Chart

### Integration Subjects Propagation
- Store gains `integrationSubjects: Subject[]` (mock: subjects from Notion/GCal, same shape as `SUBJECTS`)
- Computed `allSubjects = [...SUBJECTS, ...integrationSubjects]` exposed from store
- **Plan screen:** weekly calendar blocks use `allSubjects` for color/emoji
- **Timer screen:** subject picker lists `allSubjects`
- **Dashboard:** new task creation subject picker uses `allSubjects`
- **Analytics:** lesson distribution donut uses `allSubjects` with real hour weights from `taskHistory`

### Analytics — Daily Task Chart (new section)
- Added below existing heatmap section
- Title: "GÜNLÜK GÖREV TAMAMLAMA"
- 30-day bar chart: each bar split into completed (purple/cyan) vs incomplete (dark)
- X-axis: dates (abbreviated), Y-axis: task count
- Tooltip on hover: "12 Mart: 4/5 tamamlandı (%80)"
- Data source: `taskHistory` array in store (mock: 30 entries)

**Files:** `src/components/screens/AnalyticsScreen.tsx`, `src/components/screens/PlanScreen.tsx`, `src/components/screens/TimerScreen.tsx`, `src/store/index.ts`, `src/lib/mock-data.ts`

---

## Implementation Order

| # | Section | Depends On | Est. Complexity |
|---|---------|-----------|-----------------|
| 1 | Avatar Fix | — | Medium |
| 2 | Store additions (posts, taskHistory, integrationSubjects) | — | Low |
| 3 | Community feed + challenge | Store additions | High |
| 4 | Dashboard quote + task % + subjects | Store additions | Medium |
| 5 | Analytics task chart | Store additions | Medium |
| 6 | Integration → Plan/Timer | Store additions | Low |

Sections 2 (store) must run first; then 3–6 can partially parallelize.

---

## Constraints
- No real-time/WebSocket — all multiplayer is mock/simulation
- No external image assets — author avatars use colored initials
- Pixel art: CSS/SVG only, no image files
- Turkish UI throughout
