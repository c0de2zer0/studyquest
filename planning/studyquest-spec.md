# StudyQuest — Özellik Geliştirme Spesifikasyonu

## Proje Nedir?
Gamified çalışma uygulaması. Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand 5, Framer Motion, Lucide React.
Dark cyberpunk/gaming estetik, Türkçe arayüz.

Mevcut ekranlar: Dashboard, Timer, Plan, Avatar, Market, Community, Tournament, Rando, Leaderboard, Analytics, Profile.

---

## Geliştirme Gerektiren 5 Özellik

### 1. Rank Sistemi — LoL Tarzı
**Mevcut sorun:** Sadece level/XP var, rank yok.

**İstenenler:**
- Rank kademeleri: Demir I-IV → Bronz I-IV → Gümüş I-IV → Altın I-IV → Platin I-IV → Elmas I-IV → Usta
- Haftalık çalışma saatine/XP'ye göre rank belirleniyor
- LP (League Points) sistemi — 100 LP = bir üst bölüme yüksel
- Her rank için farklı rozet/renk/ikon
- Rank göstergesi Dashboard, Profile ve Leaderboard'da görünsün
- Zustand store'a rank, lp, rankHistory alanları eklenmeli

### 2. Avatar Sistemi — Pixel Art RPG Tarzı
**Mevcut sorun:** Satın alınan kıyafetler avatar üzerinde görünmüyor.

**İstenenler:**
- İnsan şeklinde pixel art karakter (base sprite, CSS/SVG ile — harici lib yok)
- Giyilen eşyalar katman katman üstüne biniyor: saç/baş, üst, alt, ayakkabı, aksesuar
- Avatar ekranında canlı önizleme
- Market'ten satın alınan item equip edilince avatarda hemen görünsün
- Zustand store'daki equippedItems kullanılmalı

### 3. Market Genişletmesi — Daha Fazla Item
**Mevcut sorun:** Çok az item var.

**İstenenler:**
- Pixel art kıyafet kategorileri: Baş/Saç, Üst, Alt, Ayakkabı, Aksesuar, Arka Plan
- Her kategori için en az 5-8 item
- Nadirliklere göre fiyatlandırma: Common, Rare, Epic, Legendary
- Mock data güncellenmeli (src/lib/mock-data.ts veya constants.ts)

### 4. Community Sayfası — Gerçek Discord Gibi
**Mevcut sorun:** Şu an sadece statik görüntü gibi, işlevsellik yok.

**İstenenler:**
- Sol sidebar: metin kanalları (#genel, #matematik vb.) + sesli odalar listesi
- Orta: gerçek chat alanı — mesaj yazılıp gönderilebiliyor, geçmiş mesajlar görünüyor
- Sağ sidebar: online üye listesi (çalışıyor/mola/dnd statüsleriyle)
- Emoji reaksiyon sistemi (mesajlara emoji ekle/kaldır, sayacı görünür)
- Sesli odaya "Katıl" butonu → avatar lobisine geçiş

### 5. Sesli Oda / Avatar Lobisi
**İstenenler:**
- Community'de sesli odaya girince 2D top-down harita açılıyor
- Kendi pixel art avatarın haritada görünüyor
- WASD veya ok tuşlarıyla hareket edebiliyorsun
- Diğer mock kullanıcı avatarları da görünüyor (sabit veya hafifçe hareket eden)
- Lobiden çıkma butonu var
- Canvas API veya CSS absolute positioning kullanılabilir
- Gerçek zamanlı çok oyunculu OLMAYACAK — mock/simülasyon yeterli

---

## Teknik Kısıtlar
- Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
- Zustand 5 store: `/src/store/index.ts`
- Mock data: `/src/lib/mock-data.ts`, `/src/lib/constants.ts`
- Screen bileşenleri: `/src/components/screens/*.tsx`
- Pixel art için harici kütüphane kullanılmayacak
- Websocket/gerçek zamanlı iletişim olmayacak
- Türkçe arayüz
