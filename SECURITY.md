# 🔐 Credentials Güvenlik Rehberi

Credentials'ı güvenli şekilde saklamak **ÇOK ÖNEMLİ**. Açık metin olarak kaydetmeyin!

## 3 Güvenli Seçenek

### ⭐ 1. macOS Keychain (EN GÜVENLI - Önerilir)

**Nedir?** macOS'un yerleşik şifre yöneticisi. En güvenli seçenek!

**Kurulum:**

```bash
# Credentials'ı Keychain'e kaydet
python3 keychain_manager.py save your_username your_password

# Doğrula
python3 keychain_manager.py get

# VPN'e gir (Keychain otomatik yüklenecek)
python3 main.py
```

**Avantajlar:**
- ✅ Şifre disk'te depolanmıyor
- ✅ Sistem tarafından şifreli
- ✅ Hiçbir yere commit edilmez
- ✅ Sadece bu bilgisayarda kullanılabilir

**Dezavantajlar:**
- ❌ Sadece macOS'ta çalışır

---

### 2. Environment Variables

**Nedir?** İşletim sistemi seviyesinde değişkenler. İyı bir seçenek!

**Kurulum:**

#### A. Geçici (Bu session'da):
```bash
export VPN_USERNAME="your_username"
export VPN_PASSWORD="your_password"

python3 main.py
```

#### B. Kalıcı (.env dosyası):
```bash
# .env dosyası oluştur
cp .env.example .env

# Düzenle ve credentials'ını gir
nano .env
```

**.env dosyası örneği:**
```
VPN_USERNAME=your_username
VPN_PASSWORD=your_password
VPN_TIMEOUT=120
```

**Önemli:** `.env` dosyasını **GİTHUB'A PUSH ETME!** (`.gitignore`'da var)

**Avantajlar:**
- ✅ Kodda görünmez
- ✅ Cross-platform çalışır
- ✅ Ayarlanması kolay

**Dezavantajlar:**
- ❌ Disk'te plain text (az tehlikeli)
- ❌ `.gitignore` unutulursa expose olur

---

### 3. İnteraktif Input (En Basit - Ama Bir Kere)

**Nedir?** Her seferinde password'ü yazarsınız.

**Kullanım:**
```bash
python3 main.py
# Sonra username ve password girilir
# Keychain'e kaydetme seçeneği sunulur
```

**Avantajlar:**
- ✅ Basit
- ✅ Hiçbir dosya saklanmıyor

**Dezavantajlar:**
- ❌ Her seferinde yazmalısınız
- ❌ Kısa dönem çözüm

---

## Credential Priority (Sırasıyla kontrol edilir)

```
1. Command-line arguments: python3 main.py user pass
2. Environment variables: VPN_USERNAME, VPN_PASSWORD
3. macOS Keychain: keychain_manager.py save
4. İnteraktif input: (Sorgu)
```

---

## ⚠️ UYARILAR

### ❌ YAPMA:
```bash
# ❌ Hiçbir zaman bunu yapma!
python3 main.py myusername mypassword  # Terminal history'de görünür

# ❌ Bunu da yapma!
VPN_PASSWORD="password123" python3 main.py  # History'de kalıyor
```

### ✅ YAPMA:
```bash
# ✅ Keychain'e kaydet
python3 keychain_manager.py save myusername mypassword

# ✅ Sonra çalıştır
python3 main.py

# ✅ Yada .env kullan
export $(cat .env | xargs)
python3 main.py
```

---

## Keychain Komutları

```bash
# Credentials'ı kaydet
python3 keychain_manager.py save USERNAME PASSWORD

# Credentials'ı oku
python3 keychain_manager.py get

# Credentials var mı kontrol et
python3 keychain_manager.py exists

# Credentials'ı sil
python3 keychain_manager.py delete
```

---

## GitHub Push Kontrol Listesi

Push etmeden önce:

```bash
# ❌ .env dosyası push edilmiyor mu?
git status | grep .env

# ❌ password history'de var mı?
git log --grep="password" 

# ❌ config.py push ediliyor mu?
ls -la config.py  # (Olmamalı)

# ✅ Hepsi temiz mi?
git diff --cached | grep -i password
```

---

## Başka Seçenekler (Gelecek)

- [ ] Encrypted config file
- [ ] 1Password/LastPass API
- [ ] Cloud credential manager
- [ ] Biometric unlock (macOS)

---

## Sorular?

Herhangi bir sorun varsa message gönder! 🔒
