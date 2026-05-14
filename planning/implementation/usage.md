# StudyQuest — Kullanım Kılavuzu

## Hızlı Başlangıç

```bash
cd /home/behlul/studyquest
npm run dev        # localhost:3000
npm run build      # production build
npm run lint       # eslint
```

## Implement Edilen Özellikler

### 1. Rank Sistemi (LP/Tier)
`src/store/index.ts` → `gainLP(minutesStudied)` aksiyonu

- Çalışma süresine göre otomatik LP kazanımı (2 LP/dakika)
- 7 tier: Demir → Bronz → Gümüş → Altın → Platin → Elmas → Usta
- Her tier'de IV → III → II → I bölümleri, 100 LP = yükselme
- Rank-up modal (4s) otomatik kapanır
- Puan geçmişi (son 20 giriş, lpHistory dizisi)

### 2. Pixel Art Avatar Sistemi
`src/lib/avatar-layers.ts` — layer tanımları
`src/components/PixelAvatar.tsx` — SVG render bileşeni

- İnsan şeklinde base karakter (SVG, imageRendering: pixelated)
- Giyilen eşyalar z-order ile katman katman biniyor
- `size` prop: 'preview' (avatar ekranı) | 'lobby' (2D oda)
- `direction` ve `isWalking` + `frameIndex` animasyon desteği

### 3. Market Genişletme
`src/lib/mock-data.ts` → `mockMarketItems` (16 → 50+ item)

Kategoriler: hat, hair, top, bottom, shoes, accessory, background, costume
Nadirlikler: Common (15–50sa) → Rare (50–150sa) → Epic (150–400sa) → Legendary (500–1000sa)

### 4. RankBadge Bileşeni
`src/components/RankBadge.tsx`

```tsx
<RankBadge tier="Altın" division={2} lp={65} size="md" />
// size: 'sm' | 'md' | 'lg'
```

Dashboard, Profile ve Leaderboard ekranlarına entegre edildi.

### 5. Community Ekranı (Discord Layout)
`src/components/screens/CommunityScreen.tsx`

- Sol sidebar: kanal listesi (lessons/general kategorileri) + sesli odalar
- Orta panel: kanal bazlı mesaj listesi, emoji reaksiyon, reply, auto-scroll
- Sağ sidebar: online üye listesi (status gruplandırmalı)
- Mobile (<700px): 3-tab düzeni

### 6. Avatar Lobisi (2D Top-Down Oda)
`src/components/screens/LobbyRoom.tsx`

- 800×600 CSS pixel art oda
- WASD/ok tuşları ile hareket (requestAnimationFrame tabanlı)
- 5 mock oyuncu idle animasyonu
- Mobile: `transform: scale()` ile responsive
- CommunityScreen içinde `position: fixed` overlay olarak render

## Bileşen API Referansı

### PixelAvatar
```tsx
import PixelAvatar from '@/components/PixelAvatar';

<PixelAvatar
  equippedItems={user.equippedItems}
  size="preview"          // 'preview' | 'lobby'
  direction="down"        // 'down' | 'up' | 'left' | 'right'
  isWalking={false}
  frameIndex={0}
/>
```

### RankBadge
```tsx
import RankBadge from '@/components/RankBadge';

<RankBadge
  tier={user.rankTier}
  division={user.rankDivision}
  lp={user.lp}
  size="md"               // 'sm' | 'md' | 'lg'
/>
```

### Store Aksiyonları (Yeni)
```typescript
const { gainLP, dismissRankUp, openLobby, closeLobby } = useStore();

gainLP(25);                    // 25 dakika çalışma = 50 LP
dismissRankUp();               // rank-up modalını kapat
openLobby('r1');               // sesli odaya gir
closeLobby();                  // lobiden çık
```

## Ekran Dosyaları
```
src/
  components/
    PixelAvatar.tsx            # Pixel art SVG avatar
    RankBadge.tsx              # Rank/LP rozeti
    RankUpModal.tsx            # Yükselme kutlama modalı
    screens/
      CommunityScreen.tsx      # Discord-like topluluk
      LobbyRoom.tsx            # 2D avatar lobisi
      AvatarScreen.tsx         # Avatar önizleme (PixelAvatar entegre)
      DashboardScreen.tsx      # RankBadge entegre
      ProfileScreen.tsx        # RankBadge + LP geçmişi
      LeaderboardScreen.tsx    # RankBadge her sıra için
  lib/
    avatar-layers.ts           # Layer tanımları ve AVATAR_LAYER_MAP
    constants.ts               # RANK_TIERS, LP_PER_MINUTE, RANK_TIER_COLORS
    mock-data.ts               # 50+ market item, rank fields
  store/
    index.ts                   # Zustand store — tüm aksiyonlar
```
