# HBYS MCP - FortiClient VPN Otomasyonu

FortiClient VPN'e **otomatik olarak** giriş yapan akıllı bir sistem:
- ✅ Username/Password otomatik girer
- ✅ 2FA token'ı iPhone'dan alır
- ✅ Token'ı otomatik olarak girer
- ✅ VPN bağlantısını tamamlar

## 🚀 Hızlı Başlangıç

### **En Hızlı: 5 Dakikada Başla!** ⚡
👉 **[QUICK_SETUP.md](QUICK_SETUP.md)** ← Başla buradan!

### Detaylı Kurulum

**1. Python kütüphanelerini yükle:**
```bash
pip install -r requirements.txt
```

**2. Credentials'ı güvenli şekilde sakla:**
```bash
# Seçenek A: macOS Keychain (En güvenli)
python3 keychain_manager.py save username password

# Seçenek B: Environment variables
cp .env.example .env
nano .env  # Credentials'ını gir

# Seçenek C: Her seferinde sor
# (Script'in bunu yapacak)
```

**3. iOS Shortcuts'ı iPhone'da kur:**
- 📱 [QUICK_SETUP.md](QUICK_SETUP.md) → iCloud Link yöntemi

**4. Python script'i çalıştır:**
```bash
python3 main.py
```

## Çalışma Akışı

```
1. Script'i çalıştır
2. ↓ Username/Password otomatik girilir
3. ↓ İPhone'dan token gelmeyi bekle
4. ↓ Token otomatik girilir
5. ✅ VPN bağlantısı kurulur
```

## Dokümantasyon

```
📚 Rehberler:
├── README.md                      # Bu dosya (Genel)
├── SETUP.md                       # Kurulum talimatları
├── SECURITY.md                    # 🔐 Credentials güvenliği
├── SHORTCUTS_SETUP.md             # 📱 iOS Shortcuts adım adım
└── SHORTCUTS_EXAMPLES.md          # 📋 Hazır Shortcut örnekleri

💻 Kod:
├── main.py                        # Ana otomasyonu script
├── keychain_manager.py            # macOS Keychain yönetim
├── config.example.py              # Konfigürasyon şablonu
├── .env.example                   # Environment variables şablonu
└── requirements.txt               # Python kütüphaneleri
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
