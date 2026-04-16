# HBYS MCP - FortiClient VPN Otomasyonu Kurulum Rehberi

## Adım 1: macOS Kurulum

### Gereksinimler
- macOS (Ventura veya üzeri)
- Python 3.8+
- FortiClient VPN
- İPhone (iOS 16+)

### Python Kütüphanelerini Yükle
```bash
pip install -r requirements.txt
```

### Credentials Saklama (ÖNEMLİ!) 🔐

**Seçenek A: macOS Keychain (Önerilir)**
```bash
python3 keychain_manager.py save your_username your_password
```

**Seçenek B: Environment Variables**
```bash
cp .env.example .env
# .env dosyasını düzenle ve credentials'ını gir
nano .env
```

**Seçenek C: Her seferinde gir**
```bash
python3 main.py  # Username/password isteyecek
```

Detaylı güvenlik rehberi için: [SECURITY.md](SECURITY.md)

### Güvenlik İzinleri (Önemli!)
FortiClient'ı kontrol etmek için macOS izni gerekli:
1. **System Preferences → Security & Privacy → Accessibility**
2. Terminal veya Python uygulamasını listeye ekle

## Adım 2: iOS Shortcuts Kurulum

### iPhone'da Shortcuts Uygulamasını Aç
1. **Shortcuts app** → **Automation** → **+**
2. **Aşağıdaki adımları ekle:**

#### Trigger: Message Notification
- **Automation type:** "Received Message"
- **From:** Siz seçin veya herkes
- **Contains:** Boş bırak (tüm mesajları yakala)

#### Aşağıdaki aksiyonları sırayla ekle:

```
1. Get Text from "Received Message"
2. Ask for [6-digit number] with default response
3. Send Message "Token: [response]" to [Computer Name]
   (iMessage üzerinden)
4. Delete Message (opsiyonel)
```

**YA DA** Daha basit versiyon:

```
1. Get Text from "Received Message"
2. Extract token (Find text matching regex: \d{6})
3. Send Message "[token]" to [Computer Name]
```

### macOS Bilgisayar Kontağı Ayarla
- iPhone ve Mac aynı Apple ID ile oturum açmalıdır
- iMessage etkinleştirilmiş olmalıdır

## Adım 3: Script'i Çalıştır

```bash
python3 main.py
```

### Çalışma Akışı:
1. ✓ FortiClient'ı aç ve credential'larını gir
2. ✓ VPN şifresi iste (2FA token'ı bekleme başlasın)
3. ✓ iPhone'da token'ı alıp iMessage ile bilgisayara gönder
4. ✓ Python script otomatik olarak token'ı FortiClient'a girecek

## Sorun Giderme

### iMessage Mesajları Alınmıyor
- Kontrol et: iPhone + Mac aynı Apple ID
- iMessage ayarlarını kontrol et
- Firewall'u kontrol et

### FortiClient Penceresi Arka Plana Gidiyor
- FortiClient penceresi ön planda olmalıdır
- `AppleScript` ile pencereyi öne getirebiliriz

### Token Girilmiyor
- Accessibility izinlerini kontrol et
- FortiClient penceresinin aktif olduğundan emin ol

## Gelişmiş Konfigürasyon

Dilerseniz aşağıdakileri ekleyebiliriz:
- [ ] Bulut desteği (Telegram/email üzerinden token gönderme)
- [ ] Loglama sistemi
- [ ] Token'ı Clipboard'a kopyala (daha güvenilir)
- [ ] Timeout mekanizması
- [ ] VPN bağlantı durumunu kontrol et
