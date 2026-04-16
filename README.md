# HBYS MCP - FortiClient VPN Otomasyonu

FortiClient VPN'e **otomatik olarak** giriş yapan akıllı bir sistem:
- ✅ Username/Password otomatik girer
- ✅ 2FA token'ı iPhone'dan alır
- ✅ Token'ı otomatik olarak girer
- ✅ VPN bağlantısını tamamlar

## Hızlı Başlangıç

### 1. Kurulum
```bash
# Kütüphaneleri yükle
pip install -r requirements.txt

# Config dosyasını oluştur
cp config.example.py config.py
# Sonra config.py'de credentials'ını güncelle
```

### 2. İlk Kez Ayarla
Detaylı kurulum için: [SETUP.md](SETUP.md)

### 3. Çalıştır

**Seçenek A: İnteraktif mod (Credential'ları sorgulanır)**
```bash
python3 main.py
```

**Seçenek B: Command-line argümanları ile**
```bash
python3 main.py "your_username" "your_password"
```

## Çalışma Akışı

```
1. Script'i çalıştır
2. ↓ Username/Password otomatik girilir
3. ↓ İPhone'dan token gelmeyi bekle
4. ↓ Token otomatik girilir
5. ✅ VPN bağlantısı kurulur
```

## Yapı

```
├── main.py              # Ana script
├── config.example.py    # Konfigürasyon şablonu
├── SETUP.md             # Detaylı kurulum rehberi
├── requirements.txt     # Python kütüphaneleri
└── README.md            # Bu dosya
```

## Sistem Gereksinimleri

- **macOS** (Ventura 13+)
- **Python 3.8+**
- **FortiClient VPN**
- **iPhone** (iMessage ile)
- **İnternet bağlantısı**

## İOS Shortcuts Kurulum Özeti

1. Shortcuts app → Automation → "Message Received"
2. Token geldiğinde iMessage ile bilgisayara gönder
3. Örnek:
   ```
   Telegram: 123456 kodunuzla giriş yapın
   → iOS Shortcuts: "123456" mesajını bilgisayara gönder
   → macOS script: Tokeni yakalar ve FortiClient'a girer
   ```

## Güvenlik Notları

⚠️ **Önemli:**
- Credentials'ı ortam değişkeninde veya yapılandırma dosyasında saklayın
- `config.py` dosyasını `.gitignore`'a ekleyin
- Keyboard simülasyonu için Accessibility izni gereklidir

## Sorun Giderme

### "FortiClient uygulaması açık değil"
→ FortiClient'ı başlatın

### "Accessibility izni yok"
→ System Preferences → Security & Privacy → Accessibility → Terminal/Python ekle

### "iMessage mesajları alınmıyor"
→ iPhone + Mac aynı Apple ID ile oturum açmalı

### "Token girilmiyor"
→ FortiClient penceresinin ön planda olduğundan emin olun

## Gelecek Özellikler

- [ ] Cloud desteği (Telegram/Slack)
- [ ] Loglama sistemi
- [ ] Clipboard'a kopyala (daha güvenilir)
- [ ] VPN durumunu kontrol et
- [ ] Retry mekanizması

## Geliştirici Notları

Yeni özellikler eklemek için:

```python
# FortiClientAutomation sınıfına yeni metod ekle
def new_feature(self):
    """Yeni özellik açıklaması"""
    pass
```

## İletişim

Sorular veya sorunlar için: GitHub Issues

---

**Geliştirildi:** HBYS MCP Team  
**Son Güncelleme:** 2026-04-16
