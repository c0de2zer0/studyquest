<!-- PROJECT_CONFIG
runtime: typescript-npm
test_command: npm run build
END_PROJECT_CONFIG -->

<!-- SECTION_MANIFEST
section-01-store
section-02-constants-mockdata
section-03-avatar-layers
section-04-pixel-avatar
section-05-rank-components
section-06-market-expansion
section-07-avatar-screen
section-08-rank-ui
section-09-community
section-10-lobby
END_MANIFEST -->

# Implementation Sections Index

## Dependency Graph

| Section | Depends On | Blocks | Parallelizable |
|---------|------------|--------|----------------|
| section-01-store | — | all | No (foundation) |
| section-02-constants-mockdata | 01 | 03, 05, 09 | No |
| section-03-avatar-layers | 02 | 04, 06 | Yes (with 05, 09) |
| section-04-pixel-avatar | 03 | 06, 07, 10 | Yes (with 08) |
| section-05-rank-components | 02 | 08 | Yes (with 03, 09) |
| section-06-market-expansion | 04 | — | Yes (with 07, 10) |
| section-07-avatar-screen | 04 | — | Yes (with 06, 10) |
| section-08-rank-ui | 05 | — | Yes (with 04) |
| section-09-community | 02 | 10 | Yes (with 03, 05) |
| section-10-lobby | 04, 09 | — | Yes (with 06, 07) |

## Execution Order (Batches)

1. **Batch 1 — serial:** section-01-store (foundation, all store changes)
2. **Batch 2 — serial:** section-02-constants-mockdata (constants + mock-data updates)
3. **Batch 3 — parallel:** section-03-avatar-layers, section-05-rank-components, section-09-community
4. **Batch 4 — parallel:** section-04-pixel-avatar, section-08-rank-ui
5. **Batch 5 — parallel:** section-06-market-expansion, section-07-avatar-screen, section-10-lobby

## Section Summaries

### section-01-store
All Zustand store changes: new rank fields (`lp`, `rankTier`, `rankDivision`, `lpHistory`, `showRankUpModal`, `rankUpInfo`) on the user object; extend `equippedItems` with `bottom`, `shoes`, `hair` slots; add `activeLobbyRoom: string | null` at store root; add `channel: string` to `Message` interface; implement `gainLP`, `dismissRankUp`, `openLobby`, `closeLobby` actions; update `equipItem` to sync `user.equippedItems` (including costume multi-slot logic).

### section-02-constants-mockdata
Update `/src/lib/constants.ts`: add `RANK_TIERS`, `LP_PER_MINUTE`, `RANK_TIER_COLORS`, `RANK_TIER_EMOJIS`; deprecate `RANK_THRESHOLDS` with comment. Update `/src/lib/mock-data.ts`: add new fields to `mockUser` (`lp: 45`, `rankTier: 'Altın'`, `rankDivision: 4`, `lpHistory: []`, `showRankUpModal: false`, `rankUpInfo: null`); add `channel` ids to `mockChatMessages`.

### section-03-avatar-layers
Create `/src/lib/avatar-layers.ts`: define `PixelRect`, `AvatarLayerDef`, `AnimatedLayerDef` types; export `BASE_BODY_LAYER`, `BASE_HEAD_LAYER`, and `AVATAR_LAYER_MAP` with layer definitions for all currently existing market items (16 items) and a representative set of new items from each category.

### section-04-pixel-avatar
Create `/src/components/PixelAvatar.tsx`: a `React.memo`-wrapped SVG component rendering the base character plus equipped item layers in z-order. Supports `size` ('preview' | 'lobby'), `direction`, `isWalking`, `frameIndex` props. Uses `imageRendering: 'pixelated'`.

### section-05-rank-components
Create `/src/components/RankBadge.tsx` (compact tier/division/LP display). Create `/src/components/RankUpModal.tsx` (full-screen promotion celebration, 4s auto-dismiss with setTimeout cleanup). Update `AppShell.tsx` to conditionally render `<RankUpModal />`.

### section-06-market-expansion
Extend `mockMarketItems` in `/src/lib/mock-data.ts` from 16 to 50+ items across all 7 categories (hat, hair, top, bottom, shoes, accessory, background, costume). Add corresponding entries to `AVATAR_LAYER_MAP` in `avatar-layers.ts`. Update `MarketScreen.tsx` to show pixel art preview SVG alongside item emoji. Align pricing: Common 15–50sa, Rare 50–150sa, Epic 150–400sa, Legendary 500–1000sa.

### section-07-avatar-screen
Update `AvatarScreen.tsx`: replace the large emoji display with `<PixelAvatar equippedItems={user.equippedItems} size="preview" direction="down" />`. Verify that tapping "GİY" triggers re-render (via the updated `equipItem` → `user.equippedItems` sync from section 01).

### section-08-rank-ui
Update three screen components to use `RankBadge`:
- `DashboardScreen.tsx`: add rank section below XP strip with `RankBadge` (md) + LP progress bar
- `ProfileScreen.tsx`: replace static rank string with `RankBadge` (lg) + LP history sparkline
- `LeaderboardScreen.tsx`: append `RankBadge` (sm) to each row; remove legacy `user.rank` string display

### section-09-community
Complete rewrite of `CommunityScreen.tsx` as a three-panel Discord-like layout. Left sidebar: channels grouped by `"lessons"` / `"general"` categories + voice rooms with "Katıl" button. Center: message list filtered by `activeChannel` (using new `Message.channel` field) + emoji reactions + reply + auto-scroll. Right sidebar: member list grouped by status. Mobile: three-tab layout at < 700px. Clicking "Katıl" calls `openLobby(roomId)`.

### section-10-lobby
Create `/src/components/screens/LobbyRoom.tsx`: 800×600 CSS pixel art room, rendered as `position: fixed` overlay inside `CommunityScreen.tsx`. User avatar moves with WASD/arrow keys via rAF loop + ref-based position (React state only for re-renders). 5 mock players with ref-based idle movement (not React state). `React.memo` on static components. CSS `transform: scale()` for mobile viewports < 800px. "Lobiden Çık" button calls `closeLobby()`.
