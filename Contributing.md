# 🤝 Contributing Guide - İşbirliği Rehberi

> Bu rehber, Academic Article Writing Assistant repository'sine nasıl katkı yapılacağını açıklar.

---

## 📌 İÇİNDEKİLER

1. [Başlamadan Önce](#başlamadan-önce)
2. [Git Workflow](#git-workflow)
3. [Commit Kuralları](#commit-kuralları)
4. [Pull Request Süreci](#pull-request-süreci)
5. [Dosya Yapısı](#dosya-yapısı)
6. [Kalite Kontrol](#kalite-kontrol)
7. [Sık Sorulan Sorular](#sık-sorulan-sorular)

---

## 🚀 Başlamadan Önce

### Gereklilikler

```bash
✓ Git kurulu (git --version)
✓ GitHub account (veya Gitea)
✓ Repository'ye push erişimi
✓ CLAUDE.md'ı okumuşsun
✓ YAZIM_ASISTANI_SKILL.md'ı okumuşsun
```

### Kurulum

```bash
# Repository klonla
git clone http://local_proxy@127.0.0.1:55472/git/alinac-tech/compose.git
cd compose

# Branch kontrol et
git branch -a

# Aktif branch: claude/investigate-repo-feasibility-FfXZl
git checkout claude/investigate-repo-feasibility-FfXZl
```

---

## 🌿 Git Workflow

### Branch Stratejisi

```
main (stable, yayın hazırı)
  ↑
  └─ claude/investigate-repo-feasibility-FfXZl (development)
      ├─ Makale yazımı (devam ediyor)
      ├─ Skill güncellemeleri
      └─ Metodoloji iyileştirmeleri

Future branches (gerekli olursa):
  feature/xxx
  hotfix/xxx
  docs/xxx
```

### Branch Adlandırması

```
Aktif development: claude/investigate-repo-feasibility-FfXZl

Yeni feature gerekirse:
  feature/writing-templates-v2
  feature/multilingual-support
  feature/automated-checklist

Hata düzeltme:
  hotfix/typo-in-methodology
  hotfix/broken-links-in-doc

Dokümantasyon:
  docs/add-italian-templates
  docs/update-workflows
```

---

## 📝 Commit Kuralları

### Format

```
[TYPE]: Kısa başlık

Detaylı açıklama (opsiyonel)

https://claude.ai/code/session_01AKsT4r2Q5WRQAwVByuP5ae
```

### TYPE Kategorileri

```
[Add]       → Yeni feature/dosya/bölüm
[Update]    → Mevcut içeriği güncelle
[Fix]       → Hata düzeltme
[Refactor]  → Yapı iyileştirmesi
[Docs]      → Dokümantasyon
[Remove]    → Dosya/içerik silme
[Improve]   → Performans/kalite iyileştirmesi
```

### Commit Örnekleri

```bash
# ✓ İyi commit
git commit -m "Add: PARAGRAPH 3 methodology with literature analysis examples

- Düşünce haritası eklendi
- Socratic sorular hazırlandı
- 3 makale örneği entegre edildi
- Kalıp cümleler Türkçe-İngilizce sunuldu

https://claude.ai/code/session_01AKsT4r2Q5WRQAwVByuP5ae"

# ✓ Basit bir güncelleme
git commit -m "Fix: Typo in Introduction section, paragraph 2

https://claude.ai/code/session_01AKsT4r2Q5WRQAwVByuP5ae"

# ❌ Kötü commit (özet değil, detay yok)
git commit -m "update files"

# ❌ Kötü commit (URL yok)
git commit -m "Add new methodology section"
```

### Commit En İyi Uygulamalar

```
✓ Sık commit yap (her paragraf, her bölüm)
✓ Mantıksal birimler halinde commit et
✓ Commit mesajını imperative form'da yaz
  ("Add" değil "Added", "Fix" değil "Fixed")
✓ Her commit'e session URL ekle
✓ 50 karakterden kısa özet başlık yaz

❌ Büyük, karışık commit'ler
❌ "temp", "fix", "update" gibi vague mesajlar
❌ URL olmayan commit'ler
❌ Bir commit'te 10+ dosya
```

---

## 📤 Push Politikası

### Standart Push

```bash
# Yeni branch ilk defa push
git push -u origin claude/investigate-repo-feasibility-FfXZl

# Sonraki push'lar
git push

# Spesifik branch'e
git push origin claude/investigate-repo-feasibility-FfXZl
```

### Güvenli Push

```bash
# ASLA force push yapma
❌ git push --force
❌ git push -f
❌ git push --force-with-lease

# Eğer conflict varsa:
✓ Pull önce
git pull origin claude/investigate-repo-feasibility-FfXZl

# Conflict'i çöz
# (editörde çöz veya merge tool kullan)

# Sonra commit + push
git add .
git commit -m "Merge: Resolve conflict in YAZIM_ASISTANI_SKILL.md"
git push
```

### Network Hataları

```bash
# Push başarısız olursa (network error):

# Retry 1 (2 saniye bekle)
sleep 2 && git push

# Retry 2 (4 saniye bekle)
sleep 4 && git push

# Retry 3 (8 saniye bekle)
sleep 8 && git push

# Retry 4 (16 saniye bekle)
sleep 16 && git push

# Hala başarısız? Bağlantı kontrolü yap
git remote -v
ping 127.0.0.1
```

---

## 📥 Pull Request Süreci (Gelecek)

### PR Oluşturmadan Önce

```
[ ] CLAUDE.md okudum
[ ] Contributing.md okudum
[ ] .env.example kontrol ettim
[ ] .gitignore kontrol ettim
[ ] Tüm commit'ler yapıldı
[ ] Hiç .env dosyası commit edilmedi
[ ] Hiç gerçek veri commit edilmedi
```

### PR Açma (Gelecekte)

```bash
# 1. Kendi fork'ından PR aç
# 2. Base: main, Compare: claude/investigate-repo-feasibility-FfXZl

# 3. PR Title
"Makale Yazımı: Introduction + Paragraph 1-3"

# 4. PR Description
"""
## Özet
Introduction bölümü yazıldı (5 paragraf).

## Yapılan İşler
- [ ] Paragraph 1: Disease burden (3 cümle)
- [ ] Paragraph 2: Current approach + limitations (3 cümle)
- [ ] Paragraph 3: Literature analysis (3 cümle)
- [ ] Paragraph 4: Study rationale (2 cümle)
- [ ] Paragraph 5: Objectives (1 cümle)

## Test Kontrol
- [ ] Türkçe dilbilgisi kontrol edildi
- [ ] Referanslar formatted (Vancouver)
- [ ] Plagiarism scan yapıldı
- [ ] Co-author'la reviewed

## Deadline
Target gönderimi: May 30, 2026
"""

# 5. Review request'e gönder
# 6. Approval'a bekle
# 7. Merge (maintainer tarafından)
```

---

## 📂 Dosya Yapısı

### Mevcut Yapı

```
alinac-tech/compose/
├── CLAUDE.md
│   └─ AI assistant kuralları
│
├── YAZIM_ASISTANI_SKILL.md
│   ├─ 11 yazım aşaması
│   ├─ Socratic metodoloji
│   ├─ 3-Tier okuma stratejisi
│   └─ Introduction 5 paragraf
│
├── Contributing.md
│   └─ Bu dosya (işbirliği rehberi)
│
├── .env.example
│   └─ Template (gerçek değerler local'de)
│
├── .gitignore
│   ├─ .env (gerçek veri)
│   ├─ .DS_Store
│   ├─ node_modules/
│   ├─ *.pdf (research PDF'ler)
│   └─ /research_data/ (raw data)
│
└── README.md (gelecek)
    └─ Herkese açık proje tanıtımı
```

### Yeni Dosya Eklemek

```bash
# Yeni metodoloji dokümenti
touch docs/METHODOLOGY_V2.md

# Yeni template koleksiyonu
mkdir templates/
touch templates/TEMPLATES_TURKISH.md
touch templates/TEMPLATES_ENGLISH.md

# Workflow dosyaları
mkdir workflows/
touch workflows/WRITING_CHECKLIST.md
touch workflows/REVIEW_CHECKLIST.md

# Her zaman .gitignore kontrol et!
```

---

## ✅ Kalite Kontrol

### Yazım Kalitesi

```
[ ] Türkçe dilbilgisi doğru
[ ] Akademik ton (resmi)
[ ] Mantık akışı clear
[ ] Referanslar doğru sitlenmiş
[ ] Kelime sayısı uygun (3000-4000)
[ ] Şekil/tablo clear ve labeled
```

### Dosya Kalitesi

```
[ ] Asla .env commit edilmedi
[ ] Asla hastalar/adlar commit edilmedi
[ ] .gitignore kontrol edildi
[ ] Markdown format doğru
[ ] Linkler çalışıyor
[ ] Code blocks formatted
```

### Git Kalitesi

```
[ ] Commit mesajları clear
[ ] Session URL'si var
[ ] Branch adı doğru
[ ] Hiç force push yok
[ ] Hiç merge conflict yok
```

---

## 📊 Yazım Aşaması Kontrol Lisesi

Her bölüm yazılırken kontrol et:

### Outline Aşaması
```
[ ] Paragraf sayısı doğru (Introduction: 5)
[ ] Mantık akışı clear
[ ] Heading'ler consistent
```

### Yazım Aşaması
```
[ ] Düşünce haritası yapıldı
[ ] Sorular soruldu
[ ] Kalıplar sunuldu
[ ] Örnekler verildi
[ ] Kullanıcı yazı yazarsın
```

### Review Aşaması
```
[ ] Co-author tarafından reviewed
[ ] Türkçe dilbilgisi
[ ] Akademik standart
[ ] Teknik doğruluk
[ ] Referans format
[ ] Tablo/şekil kalitesi
```

### Final Aşaması
```
[ ] Tüm revizyon'lar uygulandı
[ ] Copy-editing yapıldı
[ ] Derji şablonuna uyum
[ ] Final proofreading
[ ] SUBMIT hazırlanmış
```

---

## 🆘 Sık Sorulan Sorular

### S: Hangi branch'te geliştirmeli?

**C:** Her zaman `claude/investigate-repo-feasibility-FfXZl`'de

```bash
git checkout claude/investigate-repo-feasibility-FfXZl
# Yazı yaz
git push origin claude/investigate-repo-feasibility-FfXZl
```

### S: Main branch'e push edebilir miyim?

**C:** HAYIR! Main stable kalmalı. Her zaman development branch'te çalış.

### S: Conflict nasıl çözülür?

**C:**
```bash
git pull origin claude/investigate-repo-feasibility-FfXZl
# Editörde conflict işaretiyle (<<<, ===, >>>) çöz
git add <file>
git commit -m "Merge: Resolve conflict"
git push
```

### S: Force push kullanabilir miyim?

**C:** ASLA. Force push geçmiş silebilir. Conflict normal çöz.

### S: .env dosyasını yanlışlıkla commit ettim?

**C:**
```bash
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Fix: Remove .env from tracking"
git push
```

### S: Nasıl yanl sanırım, git reset --hard yapabilir miyim?

**C:** SADECE lokal'de ve son commit'ten hemen sonra:

```bash
# LOKAL ONLY (henüz push etmediysen)
git reset --hard HEAD~1

# Eğer push ettiysen → revert kullan
git revert <commit-sha>
git push
```

### S: Commit mesajımızı değiştirebilir miyim?

**C:** SADECE push etmeden önce:

```bash
# Son commit'i düzenle
git commit --amend

# Eğer push ettiysen → revise ile yeni commit yap
git commit -m "Docs: Clarify previous commit"
git push
```

### S: Hangi format'da referans kullanmalı?

**C:** Vancouver format (çoğu derji bu formatı kullanır)

```
[1] Yazar A, Yazar B. Makale başlığı. Dergi Adı. 2026;cilt(sayı):sayfa-sayfa.

Örnek:
[1] Smith J, Johnson M. HALP score for acute kidney injury prediction. 
    European Journal of Cardio-Thoracic Surgery. 2026;45(3):234-242.
```

### S: Test yapmalı mıyım?

**C:** Makale yazımında "test" yok. Kontrol et:
- Türkçe dilbilgisi
- Akademik ton
- Referans formatı
- Mantık akışı
- Plagiarism (Turnitin vs.)

### S: Başka birisiyle aynı bölümde çalışmak istersek?

**C:** Koordine et:
```bash
# Kişi A: Introduction yazıyor
git checkout -b feature/introduction
git push -u origin feature/introduction

# Kişi B: Methods yazıyor
git checkout -b feature/methods
git push -u origin feature/methods

# Sonra merge edilir (maintainer'a sor)
```

---

## 📞 İletişim & Destek

### Sorulara Cevap Bulma

1. **CLAUDE.md** — AI kuralları
2. **YAZIM_ASISTANI_SKILL.md** — Metodoloji
3. **Contributing.md** — Bu dosya
4. **Git documentation** — `git help <command>`

### Hata Raporlama

Eğer bug bulursan:

1. CLAUDE.md kontrol et (belki kurala aykırı)
2. Hata detaylarını yaz
3. Mesaj gönder (owner'a)

---

## ✨ Ekstra İpuçları

### Yazım Hızını Arttır

```
✓ Template'leri kopyala, özelleştir
✓ Socratic metodoloji'yi otomatikleştir
✓ Örneğe bakarak yaz
✓ Draft → Review → Final döngüsünü uyguला
```

### Kaliteyi İyileştir

```
✓ Peer review (co-author) iste
✓ Plagiarism scan yap (Turnitin, Copyscape)
✓ Bir gece ara, sabah oku
✓ Sesli oku (yazım hataları duyulur)
```

### Git'i Master Et

```
✓ `git log` ile geçmiş gör
✓ `git diff` ile değişiklikleri kontrol et
✓ `git status` sıkça bak
✓ Local'de deneme yapıp push et
```

---

## 🎯 Özet

```
1. CLAUDE.md'ı oku
2. claude/investigate-repo-feasibility-FfXZl branch'te çalış
3. Sık commit yap (URL ile)
4. Push (force push yok!)
5. Co-author'la koordine et
6. Review'a bekle
7. Merge'e hazırlandığında main'e gir
```

---

**Son Güncelleme:** 14 Nisan 2026  
**Versiyon:** 1.0  
**Durum:** Hazır ve aktif

---

### 🚀 Hazırsan, yazım aşamasına başlayabilirsin!

Sorularını CLAUDE.md'da "PROBLEM ÇÖZME" bölümünde bulabilirsin.
