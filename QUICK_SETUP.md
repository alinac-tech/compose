# ⚡ Hızlı Kurulum - Tek Tıkla Shortcut

**Hedef:** iPhone'da **1 tıp** = Shortcut kuruldu + Aktif

---

## 🎯 Seçenek 1: iCloud Link (TAVSIYYE - EN KOLAY)

### ADIM 1: Shortcut'u iPhone'da Oluştur

**Şu metni kopyala ve iPhone'da Shortcuts app'ta yapıştır:**

```
Shortcut Adı: "VPN_Token_Forward"

Actions (Sırayla ekle):
┌─────────────────────────────────────┐
│ 1️⃣  Automation Setup                │
│ ├── Trigger: "Message"              │
│ ├── Type: "Received Message"         │
│ └── From: "Anyone"                  │
├─────────────────────────────────────┤
│ 2️⃣  Text                            │
│ └── Input: [Message Body]           │
├─────────────────────────────────────┤
│ 3️⃣  Match Text                      │
│ ├── Text: (Yukarıdaki Text)         │
│ ├── Regex: \d{6}                    │
│ └── Full match: ON ✓                │
├─────────────────────────────────────┤
│ 4️⃣  Send Message                    │
│ ├── Message: [Matched Text]         │
│ ├── Via: "iMessage"                 │
│ ├── To: "Your Mac"*                 │
│ └── * Apple ID veya iMessage adresi │
├─────────────────────────────────────┤
│ 5️⃣  Delete Message (Optional)       │
│ └── Delete: ON ✓                    │
└─────────────────────────────────────┘
```

**Kaydet ve "Done" tıkla**

---

### ADIM 2: iCloud Link Oluştur

1. **Shortcuts App → Automation sekmesine git**
2. Oluşturduğun "VPN_Token_Forward" otomasyonu bultur
3. **"⋯" (Daha fazla) tıkla**
4. **"Share" seçeneği → "iCloud Link" seç**
5. **"Copy Link" tıkla**

```
Oluşan link:
https://www.icloud.com/shortcuts/abc123def456gh7
```

---

### ADIM 3: Link'i Paylaş (Tek Tıp Kurulum)

Bu link'i istediğin yere gönder:

**Bilgisayarda birisi link'e tıklarsa:**
1. Safari aç (otomatik açılır)
2. Shortcuts app seçeneği görülür
3. **"Add Shortcut" → BITTI! ✅**

**Telefonda:**
- Aynı Apple ID'de → 1 tıp = kuruldu
- Farklı cihaz → Bilgisayara gönder + bilgisayar yapıştır

---

## 📱 Seçenek 2: QR Code (EN HIZLI - SCAN)

### iCloud Link'i QR'a Çevir

```bash
# macOS'ta QR code oluştur
python3 -c "
import qrcode
link = 'https://www.icloud.com/shortcuts/abc123def456'
qr = qrcode.QRCode()
qr.add_data(link)
qr.make()
qr.make_image().save('shortcut_qr.png')
"
```

### Kullanım
1. **QR kodu göster**
2. **iPhone kamerası ile scan**
3. **Shortcuts app aç → Add → BITTI! ✅**

---

## 🔗 Seçenek 3: URL Scheme (MANUEL TRIGGER)

### Shortcut'u Manuel Çalıştır

**Safari'ye yapıştır:**
```
shortcuts://run-shortcut/?name=VPN_Token_Forward
```

**Kısayol link olarak:**
```html
<a href="shortcuts://run-shortcut/?name=VPN_Token_Forward">
  🔐 VPN Token Gönder
</a>
```

---

## 📋 Kontrol Listesi

Hepsi tamam mı? ✅ ile kontrol et:

```
iPhone Tarafında:
☑️ Shortcuts app installed
☑️ "VPN_Token_Forward" Automation oluşturuldu
☑️ Message trigger aktif
☑️ Regex pattern doğru: \d{6}
☑️ iMessage seçilmiş
☑️ Mac adresu girilmiş

Mac Tarafında:
☑️ Messages app açık
☑️ iMessage etkin
☑️ Python script hazır (main.py)
☑️ Same Apple ID (iPhone + Mac)

Test:
☑️ Bir SMS/mesaj test gönder
☑️ Shortcut çalışıyor mu?
☑️ iMessage'da token geldi mi?
☑️ main.py token'ı yakala mı?
```

---

## 🎨 Shortcut Widget (Home Screen)

İstersen Shortcut'u home screen'e widget olarak ekle:

1. **Shortcuts App → Automation seç**
2. **Uzun bas → "Edit Details"**
3. **"Add to Home Screen" seçeneği**
4. **Widget ekle ve özelleştir**

Artık **1 tıp** → Shortcut çalışır! ⚡

---

## ❓ Sık Sorulan Sorular

### P: Link'i başkasına göndersem kurabilir mi?
**C:** Evet! Link'e tıkla → Shortcut yüklenir → Aktif olur

### P: iMessage çalışmıyor
**C:** iPhone + Mac aynı Apple ID'de mi?
```
iPhone: Settings → [Apple ID] → iMessage ON
Mac: Messages → Settings → Accounts → iMessage ON
```

### P: Token otomatik göndermiyor?
**C:** Regex pattern: `\d{6}` doğru mu?
- ✅ "123456" → Bulur
- ✅ "Kod: 123456" → Bulur
- ❌ "Kod123456" (boşluk yok) → Bulamaz

### P: Shortcut'u başka cihaza kopyalamak?
**C:** iCloud Link → Başka cihazda aç → "Add" → Bitti!

---

## 🚀 FAST TRACK (5 Dakika)

```
⏱️ 1 dakika: iPhone Shortcuts app aç
⏱️ 1 dakika: Actions kopyala-yapıştır
⏱️ 1 dakika: "Save" tıkla
⏱️ 1 dakika: iCloud Link oluştur
⏱️ 1 dakika: Link test et

✅ BITTI!
```

---

## 🔧 Sorun Gidericisi

| Sorun | Çözüm |
|-------|-------|
| "iMessage kurulmuyor" | Aynı Apple ID kontrol et |
| "Token bulunamıyor" | Regex pattern: `\d{6}` |
| "Shortcut çalışmıyor" | Automation "ON" mi? |
| "Link çalışmıyor" | Linkdeki ID doğru mu? |
| "Mesaj silinmiyor" | Delete action'ı ekle |

---

## 📞 Destek

Sorun varsa:
1. SHORTCUTS_SETUP.md oku
2. SHORTCUTS_EXAMPLES.md kontrol et
3. Message gönder! 📱

---

**Başlamaya hazır mısın?** 🚀
