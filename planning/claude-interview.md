# StudyQuest — Interview Transcript

---

## Q1: Dış LLM yapılandırılmamış, plan review nasıl yapılsın?

**Cevap:** Claude Opus ile review (önerilen)

---

## Q2: Mevcut kod araştırılsın mı?

**Cevap:** Evet, codebase araştırılsın (önerilen)

---

## Q3: Web araştırması konuları (çoklu seçim)

**Cevap:** Hepsi — dört konu da araştırılsın:
1. Pixel art CSS/SVG layered avatar system React 2026
2. Discord-like chat UI React Next.js 2026
3. 2D top-down game map Canvas/CSS React 2026
4. Zustand 5 complex state patterns 2026

---

## Q4: Avatar görsel implementasyonu

**Cevap:** "hepsi olsun" — tüm yaklaşımlar birlikte.
**Netleştirme (Q8):** Avatar Screen + Lobi = SVG pixel art (`<rect>` elementleri ile çizilmiş karakter). Chat mesajı, Leaderboard gibi küçük alanlarda emoji kullanılmaya devam eder.

---

## Q5: Rank sistemi — LP kazanma tetikleyicisi

**Cevap:** Her tamamlanan çalışma seansında LP kazanılır (her Pomodoro/session = LP ödülü, LP kaybı yok).

---

## Q6: Avatar lobisi harita görünümü

**Cevap:** Basit pixel art oda, CSS background ile (önerilen) — 800x600px, tiled zemin + duvarlar, dosya gereksiz.

---

## Q7: Kapsam — kaç özellik planlanacak?

**Cevap:** Tüm 5 özellik birlikte planlanacak: Rank, Avatar, Market, Community, Lobi.

---

## Q8: Avatar netleştirme

**Cevap:** Evet — SVG pixel art büyük görüntüler (Avatar Screen, Lobi), emoji küçük görüntüler (sohbet, leaderboard).

---

## Q9: Community sayfası yaklaşımı

**Cevap:** CommunityScreen.tsx tamamen yeniden yazılacak (full rewrite).

---

## Q10: Market item görselleri

**Cevap:** "ikiside olsun" — her iki yaklaşım birlikte: text isimler + emoji ikonlar VE her item için küçük SVG pixel art önizleme.

---

## Q11: Rank-up animasyonu

**Cevap:** Evet, rank-up kutlaması olsun — LP 100'e ulaşıp rank artınca tam ekran modal veya banner + animasyon.

---

## Q12: Lobi yürüme animasyonu

**Cevap:** Evet, yürüme animasyonu olsun — WASD ile hareket ederken karakter frame'leri değişir (sağa, sola, yukarı, aşağı yönlere göre).

---

## Q13: Özellik önceliği

**Cevap:** Hepsi eşit öncelikte — planlama sırasında mantıklı sıra belirlenir.

---

## Karar Özeti

| Konu | Karar |
|------|-------|
| Avatar varlıkları | SVG `<rect>` ile pixel art karakter; emoji küçük görsellerde devam |
| LP kazanımı | Her tamamlanan çalışma seansı |
| LP kaybı | Yok |
| Rank-up animasyon | Var (modal/banner) |
| Lobi harita | CSS pixel art oda (800x600) |
| Lobi animasyon | Frame-bazlı yürüme animasyonu |
| Community | CommunityScreen.tsx tam yeniden yazım |
| Market item görseller | Text + emoji + SVG pixel art önizleme |
| Zustand yaklaşımı | Mevcut flat store genişletme (slice yok, immer yok) |
| Test | TypeScript types only (test framework kurulu değil) |
| Öncelik sırası | Tüm 5 özellik eşit |
