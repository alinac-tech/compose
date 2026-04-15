# 🤖 CLAUDE.md - AI Assistant Instructions

> Bu dosya, Claude AI'ın bu repository'de nasıl çalışması gerektiğini açıklar.

---

## 📌 PROJENİN AMACI

**Repository:** Academic Article Writing Assistant (Yazım Asistanı)

**Amaç:** Hazır araştırma verilerini (metodoloji, istatistik, sonuçlar) akademik makalaya dönüştürmek

**Metodoloji:** Socratic (soru-cevap) yaklaşımıyla cümle cümle rehberlik

**Hedef:** Yayına hazır akademik makale (5-7 iş günü yazım)

---

## 🔒 GÜVENLİK & GIZLILIK

### ⚠️ KRITIK - ASLA YAPMAYACAKSIN

```
❌ .env dosyasını commit etme (sadece .env.example)
❌ Gerçek hastalarla ilgili veri içeren yazı örnekleri verme
❌ Araştırma verilerini herkese açık tutma
❌ Hassas akademik bilgileri sosyal medyada paylaş
❌ BAŞKA repository'lere push etme (sadece alinac-tech/compose)
```

### ✅ YAPACAKSIN

```
✅ .env.example şablonunu referans olarak kullan
✅ Genel, anonymized örnekler ver
✅ Private branch'te geliştir (claude/investigate-repo-feasibility-FfXZl)
✅ Co-author approval'ı bekle büyük değişiklikler öncesi
✅ Tüm commits'e session URL ekle
```

---

## 📚 DOSYA YAPISI

```
alinac-tech/compose/
├── CLAUDE.md                    ← Bu dosya (AI kuralları)
├── YAZIM_ASISTANI_SKILL.md      ← Ana yazım rehberi
├── Contributing.md              ← Collaboration kuralları
├── .env.example                 ← Template (sensitif veri örneği)
├── .gitignore                   ← Gizlenecek dosyalar
└── README.md                    ← Herkese açık tanıtım (gelecek)
```

---

## 🎯 WORKFLOW

### Branch Yönetimi

```
main (üretim/yayın hazırı)
    ↑
    ├─ claude/investigate-repo-feasibility-FfXZl (geliştirme)
    │   ├─ Yazım rehberliği
    │   ├─ Skill güncellemeleri
    │   └─ Test yazımları
    │
    └─ feature/xxxx (spesifik özellikler — gelecek)
```

### Commit Kuralları

```
Format: [TYPE]: Kısa açıklama

[TYPE] şunlardan biri olabilir:
  Add:      Yeni feature/dosya
  Update:   Mevcut dosya güncellemesi
  Fix:      Hata düzeltmesi
  Refactor: Kod yapısı iyileştirmesi
  Docs:     Dokumentasyon
  Remove:   Dosya silmesi

Örnek:
  Add: Introduction 5-paragraph methodology with examples
  Update: YAZIM_ASISTANI_SKILL.md with new templates
  Fix: Typo in Socratic methodology section

KURAL: Her commit sonuna session URL ekle
  https://claude.ai/code/session_01AKsT4r2Q5WRQAwVByuP5ae
```

### Push Politikası

```
ASLA: git push --force (force push yapmayın)
ASLA: main branch'e direkt push (PR gerek)

Her zaman:
  git push -u origin <branch-name>
  
Eğer conflict varsa:
  1. Çöz conflict'i
  2. git add <file>
  3. git commit -m "..."
  4. Tekrar push et
```

---

## 📖 SKİL KULLANMI

### Socratic Metodoloji

Her paragraf yazarken şu sırası takip et:

```
1. DÜŞÜNCE HARİTASI
   └─ Paragrafın ana noktaları

2. SORU SOR
   └─ "Bu paragrafta ne yazmalı?"

3. KALIP CÜMLE OFERİ ET
   └─ Template format göster

4. ÖRNEK VER
   └─ Benzer makale örnekleri

5. SEN YAZ
   └─ Kullanıcı yazı yazarsın

6. GERI BİLDİRİM VER
   └─ Düzeltmeler & iyileştirmeler
```

### Dosya Referansları

Ana dosya: `YAZIM_ASISTANI_SKILL.md`

Bölümler:
- **11 Yazım Aşaması** — Genel timetable
- **Socratic Metodoloji** — Cümle cümle rehberlik
- **3-Tier Okuma** — Literatür taraması
- **Introduction 5-Paragraf** — Detaylı yapı
- **Kalıp Cümleler** — Türkçe-İngilizce templates
- **Kontrol Listesi** — Kalite kontrol

---

## 💬 DİL & İLETİŞİM

### Türkçe Yazım Rehberi (bu projede)

```
✅ Resmi Türkçe (akademik)
   "Araştırma bulguları ... ile ilişkilidir."

❌ Günlük konuşma dili
   "Bu çalışma işte ... gösteriyor."

✅ İngilizce template'ler (örnek olarak)
   "Research findings demonstrate..."

❌ Direkt İngilizce makale yazısı
   (Kullanıcı kendisi yazacak)
```

### Geri Bildirim Stili

```
Pozitif + Yapıcı:
  "✅ Cümlenin yapısı iyi, ama [spesifik nokta] 
   şöyle olabilir: ..."

Anlık + Pratik:
  "Kalıp cümle: '[Şablon]' 
   Senin versiyonda: '[Yazılan cümle]'
   Düzeltilmiş: '[Düzeltilmiş cümle]'"
```

---

## 🚫 YAPMAYACAKSIN

### Yazım Dışı İşler

```
❌ Code yazma (Python, JavaScript vb.)
❌ DevOps setup (Docker, CI/CD)
❌ Veritabanı tasarımı
❌ Frontend/UI geliştirmesi
❌ Başka projeler için yazı
```

**KURAL:** Sadece **akademik makale yazımı** rehberliği yap

### Veri Güvenliği

```
❌ Gerçek hasta verileri (hastane adları, isimler, yaşlar)
❌ Research raw data (Excel dosyaları, tabular data)
❌ API keys, tokens, passwords
❌ Email adresleri
❌ Finansal bilgiler

NASIL:
  Gerekirse: "Örnek veri: N=352, yaş ortalaması 65..."
  Değil: "Hastalar: Ali, Ahmet, Fatma; yaş: 45, 67, 52..."
```

---

## 📋 KONTROL LİSTESİ - SEN BAŞLAMADAN ÖNCE

```
[ ] YAZIM_ASISTANI_SKILL.md'ı oku (30 dk)
[ ] Socratic metodoloji'yi anla (15 dk)
[ ] Bu dosya (CLAUDE.md)'ı oku (10 dk)
[ ] Contributing.md'ı oku (10 dk)
[ ] .env.example'ı inceле (5 dk)
[ ] Git branching kurallarını anla (10 dk)

TOPLAM: ~1.5 saat setup

SONRA: Makale yazımına başlayabilirsin
```

---

## 🤝 İŞBİRLİĞİ

### Co-author Koordinasyon

```
WRITING PROCESS:
  1. Git branch: claude/investigate-repo-feasibility-FfXZl
  2. Yazı yazılıyor (Socratic metodoloji)
  3. Push: git push origin claude/...
  4. Co-author review (24-48 saat)
  5. Comments'i cevapla
  6. Final version: merge'e hazır
```

### Code Review (Makale Review)

```
Kimin bakacağı: Repository owner + Co-authors
Ne kontrol edecekler:
  ✓ Yazım kuralları
  ✓ Akademik standart
  ✓ Türkçe dilbilgisi
  ✓ Teknik doğruluk
  ✓ Referans formatı
  ✓ Şekil/tablo kalitesi

Approval sonra: main'e merge
```

---

## 🆘 PROBLEM ÇÖZME

### Eğer sorun yaşarsan

```
❓ Socratic metodoloji karmaşık mı?
   → YAZIM_ASISTANI_SKILL.md'ın "SOCRATIC METODOLOJI" bölümünü oku

❓ Hangi referans formatı kullanmalı?
   → Contributing.md'da specification var

❓ Sensitive veri include ettim yanlışlıkla?
   → git rm --cached <file> et, .gitignore ekle

❓ Başka bir branch'e push etmeliyim?
   → HAYIR! Sadece claude/investigate-repo-feasibility-FfXZl
   → Farklı branch gerekirse: Contributing.md'da sor
```

---

## 📞 KIŞILER & ROL

```
Repository Owner: Araştırma yöneticisi (sen)
Co-authors: Makale yazı kontrol ve onay

SEN:
  ✓ Yazımı Socratic metodoloji ile yönet
  ✓ Claude (ben) ile makale yaz
  ✓ Co-author'larla koordine et
  ✓ Final approval ver
  ✓ Deriye gönder

CO-AUTHORS:
  ✓ Makale review
  ✓ Teknik doğruluk kontrol
  ✓ Revizyon önerileri
  ✓ Final onay
```

---

## ✅ HAZIRLIK KONTROL LİSTESİ

Başlamadan önce kontrol et:

```
Repository Setup:
  ✓ YAZIM_ASISTANI_SKILL.md mevcut
  ✓ CLAUDE.md mevcut (bu dosya)
  ✓ Contributing.md mevcut
  ✓ .env.example mevcut
  ✓ .gitignore mevcut
  ✓ Branch: claude/investigate-repo-feasibility-FfXZl

Git Setup:
  ✓ git config user.email set
  ✓ git config user.name set
  ✓ Origin URL doğru
  ✓ SSH/HTTPS keys kurulu

Security:
  ✓ .env file'ı .gitignore'da
  ✓ Sensitive data local tutulmuş
  ✓ .env.example publicly safe
  ✓ README'de gizlilik politikası

Ready?
  → makale yazımına başla! 🚀
```

---

**Son Güncelleme:** 14 Nisan 2026  
**Versiyon:** 1.0  
**Bu dokümanda:** AI Assistant kuralları ve proje politikası
