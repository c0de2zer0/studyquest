# StudyQuest — Birleşik Spesifikasyon

Bu belge; orijinal spec, codebase araştırması ve interview cevaplarını tek bir kapsamlı spesifikasyona birleştirir.

---

## Proje Bağlamı

StudyQuest, Next.js 16 / React 19 / TypeScript / Tailwind CSS 4 / Zustand 5 ile geliştirilmiş gamified bir çalışma uygulamasıdır. Dark cyberpunk/gaming estetik, Türkçe arayüz. 11 ekran mevcut: Dashboard, Timer, Plan, Avatar, Market, Community, Tournament, Rando, Leaderboard, Analytics, Profile.

Tek Zustand store (`/src/store/index.ts`) tüm state'i tutar (~600 satır, ~170 action). Harici UI kütüphanesi yok — tüm UI sıfırdan HTML/CSS/React ile yazılmış. Test framework kurulu değil; TypeScript strict mode yeterli kabul edilir.

---

## Geliştirme Gerektiren 5 Özellik

---

### Özellik 1: Rank Sistemi — LoL Tarzı

#### Hedef
Mevcut sadece level/XP sistemine ek olarak tam bir LP ve division sistemi eklemek.

#### Rank Kademeleri
Demir IV → III → II → I → Bronz IV → ... → Gümüş → Altın → Platin → Elmas → Usta

Her tier 4 division içerir (IV, III, II, I), Usta hariç (divisionless).

```
Tiers: ['Demir', 'Bronz', 'Gümüş', 'Altın', 'Platin', 'Elmas', 'Usta']
```

#### LP Sistemi
- Her tamamlanan çalışma seansı (timer session end) LP kazandırır
- LP kazanım formülü: `Math.round(seansÇalışmaDakikası * LP_PER_MINUTE)` (LP_PER_MINUTE = 2 önerilen başlangıç)
- LP 0-99 arası değişir; 100'e ulaşınca division/tier yükseltme
- Division yükseltme: IV → III → II → I → bir üst tier'ın IV'üne geç
- Usta'ya ulaşınca LP sistemi durmaz ama tier değişmez; LP sadece "Usta LP" olarak birikmesi devam eder
- **LP kaybı yok** (kullanıcı kararı)

#### Rank-Up Animasyonu
LP 100'e ulaşıp terfi tetiklenince bir kutlama modal/banner gösterilecek:
- Yeni tier + division gösterimi
- "RANK UP!" başlığı
- Konfeti animasyonu (mevcut `confetti-fall` CSS animation kullanılabilir)
- 3-5 saniye sonra otomatik kapanır veya tıklamayla kapatılır

#### Store Değişiklikleri
`user` nesnesine şu alanlar eklenecek:
```typescript
lp: number               // 0-99 (veya 0-∞ Usta'da)
lpHistory: number[]      // son kazanılan LP miktarları (son 20 kayıt)
rankTier: string         // 'Demir' | 'Bronz' | 'Gümüş' | 'Altın' | 'Platin' | 'Elmas' | 'Usta'
rankDivision: number     // 1-4 (Usta'da 0)
```

Mevcut `user.rank` (string) ve `user.rankEmoji` alanları korunacak veya `rankTier`'den türetilecek.

Yeni store action'ları:
- `gainLP(amount)` — LP ekler, 100'e ulaşınca rank yükseltir, `showRankUpModal` flag'ini true yapar
- `dismissRankUp()` — modal flag'ini kapatır

#### UI Değişiklikleri
- **Dashboard:** XP strip veya ayrı bölümde rank badge + LP progress bar
- **Profile ekranı:** Rank bilgisi görünür (tier, division, LP, rankHistory grafiği)
- **Leaderboard:** Her oyuncunun yanında rank badge

#### Sabitler Güncellemesi
`constants.ts`'de yeni RANK_TIERS dizisi ve LP_PER_MINUTE sabiti eklenecek.

---

### Özellik 2: Avatar Sistemi — Pixel Art RPG

#### Hedef
İnsan şeklinde pixel art karakter oluşturma; satın alınan ve equip edilen eşyalar katman katman üstüne biniyor.

#### Teknik Yaklaşım: SVG `<rect>` tabanlı pixel art

Harici kütüphane kullanılmayacak. Karakter, CSS `viewBox` içindeki `<rect>` elementleri ile çizilecek. Örnek karakter ızgara çözünürlüğü: 16×32 veya 24×48 piksel.

Temel katman yapısı (z-index sırası):
1. `body` — ten rengi, gövde
2. `bottom` — pantolon/etek
3. `top` — üst giysi
4. `shoes` — ayakkabı
5. `hair` — saç (omuzların üzerinde)
6. `head` — kafa (ten rengi, yüz)
7. `hat` — şapka (kafanın üstü)
8. `accessory` — aksesuar (gözlük, kolye, vb.)

Her katman `<svg>` içinde `<rect>` veya `<path>` elementleri kullanılarak `position: absolute` ile üstüste yığılır. Tüm katmanlar aynı `viewBox` ve boyutlarda olacak.

#### Pixel Art Tanımları
Her item (örn. "mavi kapşon"), kaç piksel hangi renkte `<rect>` çizileceğini tanımlayan bir pixel map ile temsil edilir:

```typescript
interface PixelDef {
  x: number;
  y: number;
  color: string;
}

interface AvatarLayerDef {
  id: string;
  name: string;
  slot: 'body' | 'top' | 'bottom' | 'shoes' | 'hair' | 'hat' | 'accessory';
  pixels: PixelDef[];
}
```

Base body + base head her zaman görünür; diğer katmanlar equip edilen item'a göre eklenir veya gizlenir.

#### Animasyon (Lobi için)
Avatar Screen'de: statik önizleme (frame yok).
Lobi'de: 4-frame yürüme animasyonu — her yön (aşağı, sol, sağ, yukarı) için farklı pixel map set'i. `setInterval` ile frame döngüsü (idle: frame 0, walking: frame 1-3-1 pattern veya 0-1-2-3).

#### Büyük ve Küçük Avatar
- **Büyük (Avatar Screen, Lobi):** 96×192 veya 64×128 px SVG — pixel art
- **Küçük (sohbet, leaderboard):** Emoji devam eder (değişiklik yok)

#### Store Değişiklikleri
`user.equippedItems` mevcut haliyle yeterli ama `bottom` ve `shoes` slotları eklenecek:

```typescript
equippedItems: {
  hat: string | null,
  top: string | null,
  bottom: string | null,    // YENİ
  shoes: string | null,     // YENİ
  accessory: string | null,
  background: string | null
}
```

#### Yeni Component
`PixelAvatar` component'i `/src/components/PixelAvatar.tsx` olarak oluşturulacak.
Props: `equippedItems`, `size` ('small' | 'medium' | 'large'), `direction?`, `isWalking?`.

#### Avatar Screen Güncellemesi
`AvatarScreen.tsx` büyük emoji'nin yerine `<PixelAvatar>` component'ini kullanacak. Equip etme butonu tıklandığında avatar anında güncellenir.

---

### Özellik 3: Market Genişletmesi

#### Hedef
Mevcut 16 item yerine 50+ item. Her kategori için 5-8 item (bazı kategoriler daha fazla).

#### Yeni Kategoriler ve Slotlar
Mevcut kategoriler: `hat`, `top`, `accessory`, `background`, `costume`
Yeni eklenecek: `bottom`, `shoes`

Her kategori için nadirliklere göre item dağılımı:
- Common: 3-4 item
- Rare: 2-3 item
- Epic: 1-2 item
- Legendary: 1 item

#### Her Item için SVG Pixel Art Önizleme
Market sayfasındaki item card'larında emoji yerine veya emojiye ek olarak küçük SVG pixel art önizleme gösterilecek. Bu, yukarıdaki `AvatarLayerDef.pixels` veri yapısından `<svg>` render'ı ile sağlanacak.

#### Mock Data Güncellemesi
`/src/lib/mock-data.ts` içindeki `mockMarketItems` dizisi genişletilecek. Yeni item'lar için `AvatarLayerDef` pixel tanımları da `mock-data.ts` veya ayrı bir `avatar-layers.ts` dosyasına eklenecek.

#### Fiyatlandırma Kılavuzu
- Common: 50-150 sa (saat/coin)
- Rare: 200-400 sa
- Epic: 500-800 sa
- Legendary: 1000-2000 sa

---

### Özellik 4: Community Sayfası — Gerçek Discord Gibi

#### Hedef
`CommunityScreen.tsx` tamamen yeniden yazılacak. Gerçek Discord benzeri 3 panel layout.

#### Layout (Desktop — Masaüstü genişliğinde)
```
┌─────────────────┬──────────────────────────┬─────────────────┐
│  Sol Sidebar    │    Mesaj Alanı           │  Sağ Sidebar    │
│  (240px)        │    (flex-1)              │  (240px)        │
│                 │                          │                 │
│  ── Metin ──    │  # genel                 │  ONLINE (4)     │
│  # genel        │  ─────────────────────   │  🟢 Ahmet S.    │
│  # matematik    │  [mesajlar scroll]       │  🟡 Zeynep K.   │
│  # fizik        │                          │  🔴 Can M.      │
│  ...            │  ─────────────────────   │                 │
│  ── Sesli ──    │  [mesaj yazma alanı]     │  ÇEVRIMDIŞI (2) │
│  🔊 Çalışma 1   │                          │  ⚫ Ayşe T.     │
│  🔊 Lobi        │                          │                 │
└─────────────────┴──────────────────────────┴─────────────────┘
```

**Mobilde:** Tab-based navigation (3 tab: Kanallar / Sohbet / Üyeler)

#### Mesaj Alanı Özellikleri
- Mesajlar gruplandırılmış: aynı kullanıcının ardışık mesajları avatar tekrarlamaz
- Her mesajda hover'da hızlı emoji reaction bar (👍 ❤️ 😂 😮 😢 🔥 💯 🎯)
- Mesaj gönderme input'u Enter ile gönderir, Shift+Enter yeni satır
- Otomatik scroll to bottom yeni mesaj gelince
- Mesaj zaman damgası (timestamp)
- Mevcut `addReaction` store action'ı kullanılacak (zaten çalışıyor)

#### Kanal Listesi
- Kategorilere göre gruplanmış: "DERS KANALLARI" ve "GENEL"
- Okunmamış badge (unread count)
- Aktif kanalın farklı highlight'ı
- Sesli oda listesi kapasiteyle birlikte

#### Sağ Sidebar — Üye Listesi
- Çevrimiçi üyeler statüsüyle (🟢 çalışıyor, 🟡 mola, 🔴 rahatsız etme, ⚫ çevrimdışı)
- "(Sen)" etiketi kendi kullanıcı için
- Çevrimdışı üyeler collapse edilebilir

#### Sesli Oda Katılım
Sesli odaya "Katıl" tıklandığında lobi ekranına geçiş yapılacak (aktif tab değişimi veya modal). Bu, Özellik 5 ile entegre.

---

### Özellik 5: Sesli Oda / Avatar Lobisi

#### Hedef
Community'de sesli odaya girilince 2D top-down harita açılıyor. Kendi pixel art avatarın WASD/ok tuşlarıyla hareket edebiliyor. Diğer mock kullanıcılar da görünüyor.

#### Teknik Yaklaşım
CSS `position: absolute` tabanlı (Canvas değil). Karakter ve diğer oyuncular absolute positioned div'ler.

```
Harita boyutu: 800×600 CSS piksel
Karakter boyutu: 48×48 piksel
Hareket hızı: 3 piksel/frame
FPS: requestAnimationFrame (~60 fps)
```

#### Hareket Sistemi
- Tuşlar: WASD + ok tuşları (her ikisi de çalışır)
- Tuş durumu `useRef<Set<string>>` ile tutulur (state değil — re-render tetiklememek için)
- Mevcut konum `posRef` (useRef) ile tutulur; React state `playerPos` sadece render için güncellenir
- `requestAnimationFrame` loop — her frame'de konum güncellenir, sınırlar içinde tutulur

#### Harita (CSS Pixel Art)
Zemin: küçük karo deseni — CSS `repeating-linear-gradient` veya `background-image: url('data:image/svg+xml,...')` ile inline SVG tile
Duvarlar: haritanın 4 kenarı + bazı iç engeller (masalar, raflar) CSS div'leri ile
Renk paleti: mevcut cyberpunk palette (--bg, --s1, --s2, --purple, --cyan renkleri)

#### Mock Oyuncular
5-6 mock kullanıcı statik veya hafif hareketle. Her 2-3 saniyede rastgele küçük pozisyon değişimi (`setInterval` ile, ±10px range). Üzerlerinde kullanıcı adı + küçük emoji.

#### Avatar Animasyonu
Hareket ederken yürüme animasyonu: yön değiştikçe `direction` state güncellenir (`'up' | 'down' | 'left' | 'right'`). Durduğunda idle frame.

#### LobbyRoom Component
`/src/components/screens/LobbyRoom.tsx` veya mevcut `CommunityScreen.tsx` içine gömülü modal olarak oluşturulacak.

Çıkış butonu lobiden çıkıp Community ekranına döner.

---

## Teknik Kısıtlar (Doğrulandı)

- Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
- Zustand 5 store: `/src/store/index.ts` — flat pattern korunacak, immer/slice eklenmeyecek
- Mock data: `/src/lib/mock-data.ts`, `/src/lib/constants.ts`
- Screen bileşenleri: `/src/components/screens/*.tsx`
- Pixel art için harici kütüphane kullanılmayacak (SVG `<rect>` elementleri)
- Websocket/gerçek zamanlı iletişim yok
- Türkçe arayüz
- Test framework yok — TypeScript strict mode yeterli

---

## Dosya Değişiklik Haritası

| Dosya | Değişiklik Türü |
|-------|----------------|
| `/src/store/index.ts` | Güncelleme — rank alanları + LP actions + equippedItems slots |
| `/src/lib/mock-data.ts` | Güncelleme — 30+ yeni market item + avatar layer tanımları |
| `/src/lib/constants.ts` | Güncelleme — RANK_TIERS, LP_PER_MINUTE sabitleri |
| `/src/components/PixelAvatar.tsx` | **YENİ** — SVG pixel art avatar component |
| `/src/components/screens/AvatarScreen.tsx` | Güncelleme — PixelAvatar entegrasyonu |
| `/src/components/screens/MarketScreen.tsx` | Güncelleme — yeni kategoriler + SVG önizleme |
| `/src/components/screens/CommunityScreen.tsx` | **TAM YENIDEN YAZIM** — Discord 3-panel layout |
| `/src/components/screens/LobbyRoom.tsx` | **YENİ** — 2D top-down avatar lobi |
| `/src/components/screens/DashboardScreen.tsx` | Güncelleme — rank badge + LP bar |
| `/src/components/screens/LeaderboardScreen.tsx` | Güncelleme — rank badge |
| `/src/components/screens/ProfileScreen.tsx` | Güncelleme — tam rank bilgisi |
| `/src/components/RankUpModal.tsx` | **YENİ** — rank-up kutlama animasyonu |
