# StudyQuest — Handoff Notu
> Yeni oturumda bu dosyayı oku ve devam et.

## Proje Nedir?
Gamified çalışma uygulaması. Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand 5, Framer Motion, Lucide React.
Dark cyberpunk/gaming estetik, Türkçe arayüz.

## Mevcut Durum
Tüm ekranlar implement edilmiş ama henüz git'e commit edilmemiş:
- Dashboard, Timer, Plan, Avatar, Market, Community, Tournament, Rando, Leaderboard, Analytics, Profile
- `/src/components/screens/` altında her ekranın .tsx dosyası var
- `/src/store/index.ts` — Zustand store, tüm state burada
- `/src/lib/mock-data.ts` — Mock veriler
- `/src/lib/constants.ts` — Sabitler

## Yapılacaklar (Kullanıcı ile kararlaştırıldı)

### 1. Community Sayfası — Tam Discord Gibi Çalışsın
**Mevcut sorun:** Şu an sadece Discord'un ekran görüntüsü gibi, gerçek işlevsellik yok.
**İstenenler:**
- Sol sidebar: metin kanalları (#genel, #matematik vb.) + sesli odalar
- Orta: gerçek chat alanı, mesaj gönderme çalışıyor
- Sağ sidebar: online üye listesi (çalışıyor/mola/dnd statüsleriyle)
- Emoji reaksiyon sistemi (mesajlara emoji ekle/kaldır)
- Sesli odaya girildiğinde **pixel art avatar lobisi** açılıyor (aşağıya bak)

### 2. Sesli Oda / Avatar Lobisi
- Sesli odada "Lobiye Gir" butonu var
- Tıklanınca 2D top-down veya yan kaydırmalı bir oda açılıyor
- Pixel art avatarlar bu odada keyboard/touch ile gezinebiliyor
- Diğer online kullanıcıların avatarları da görünüyor
- Lobiden çıkmak için buton var

### 3. Avatar Sistemi — Pixel Art RPG Tarzı
**Mevcut sorun:** Satın alınan kıyafetler avatar üzerinde görünmüyor.
**İstenenler:**
- İnsan şeklinde pixel art karakter (base sprite)
- Giyilen eşyalar katman katman üstüne biniyor (saç, üst, alt, ayakkabı, aksesuar vb.)
- Avatar ekranında canlı önizleme

### 4. Market — Daha Fazla Item
**Mevcut sorun:** Çok az item var.
**İstenenler:**
- Pixel art kıyafet kategorileri: Baş/Saç, Üst, Alt, Ayakkabı, Aksesuar, Arka Plan
- Her kategori için en az 5-8 item
- Nadirliklere göre fiyatlandırma (Common, Rare, Epic, Legendary)

### 5. Rank Sistemi — LoL Tarzı
**Mevcut sorun:** Sadece level/XP var, rank yok.
**İstenenler:**
- Demir I-IV → Bronz I-IV → Gümüş I-IV → Altın I-IV → Platin I-IV → Elmas I-IV → Usta
- Haftalık çalışma saatine/XP'ye göre rank belirleniyor
- Her rank için farklı rozet/renk
- LP (League Points) sistemi — 100 LP = bir üst bölüme yüksel
- Rank göstergesi Dashboard, Profile ve Leaderboard'da görünsün

## Önerilen Yaklaşım (Kullanıcı onaylamadı ama B seçeneği önerildi)
**B) Temel sistemler önce:**
1. Rank sistemi (store'a LP/rank eklenmesi)
2. Avatar pixel art sistemi (sprite + giyim katmanları)
3. Market item genişletmesi
4. Community Discord layout yeniden yazımı
5. Sesli oda avatar lobisi

## Teknik Notlar
- `npm run dev` ile çalıştır (port 3000)
- `npm run build` build al
- `npm run lint` lint
- Pixel art için harici kütüphane gerekmez — CSS sprite veya SVG ile yapılabilir
- Avatar lobi için canvas API veya basit CSS absolute positioning kullanılabilir
- Çok oyunculu gerçek zamanlı OLMAYACAK — mock/simülasyon yeterli (websocket yok)

## Pluginler (Kurulu)
- superpowers (brainstorm, plan, implement, debug vb.)
- frontend-design (UI kaliteli kod üretimi)
- deep-plan (detaylı plan dosyası oluşturma)
- deep-implement (plan'dan kod yazma)
- code-review
- ralph-wiggum
- serena MCP (sembolik kod okuma/düzenleme)

## Yeni Oturumda Yapılacak İlk Adım
1. Bu dosyayı oku
2. Aşağıdaki komutu yaz:

```
/deep-plan @/home/behlul/studyquest/planning/studyquest-spec.md
```

Bu komut deep-plan workflow'unu devam ettirir (research → interview → plan → implement).

## Deep-Plan Durumu (Başlatıldı)
- Spec dosyası: `/home/behlul/studyquest/planning/studyquest-spec.md`
- Planning dir: `/home/behlul/studyquest/planning/`
- Review mode: `opus_subagent`
- Durum: Step 7 (Execute Research) başlamadı — codebase + tüm web araştırmaları yapılacak
