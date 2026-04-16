# 📱 iOS Shortcuts - Token Forwarding Rehberi

Token'ı telefondan bilgisayara göndermek için iOS Shortcuts kullanacağız.

## Nedir?

iOS Shortcuts = iPhone'da otomatik görevler yapan uygulama  
Token geldiğinde → Otomatik olarak iMessage ile bilgisayara gönderir

---

## ADIM 1: Shortcuts App'i Aç

1. **iPhone'da** "Shortcuts" uygulamasını aç
2. Altta **"Automation"** sekmesine git
3. **"+"** (yeni automation) butonu tıkla

---

## ADIM 2: Trigger Ayarla (Ne zaman çalışsın?)

### "Create New Automation" → "Message" seçeneğini aç

**Ayarlar:**
- **Type:** "Received Message"
- **From:** "Anyone" (veya sadece SMS'in geldiği numara)
- **Filter:** Boş bırak (tüm mesajları yakla)
- **Notification:** OFF (sessiz çalışsın)

✅ **"Next"** tıkla

---

## ADIM 3: Action Ekle - Token Çıkar

### Step 1: Mesajdaki tokeni bul

**"+"** butonu tıkla ve aşağıdakileri sırayla ekle:

```
1. "Ask for [Number]"
   - Title: "Token"
   - Type: "Number"
   - Default: "000000"
```

**YA DA (Daha akıllı)** - Otomatik token çıkar:

```
1. "Text"
   - Gelen mesaj: [Message Body]

2. "Match Text"
   - Text: Yukarıdaki "Text"
   - Regex: \d{6}
   - (Bu 6 haneli sayıyı bulur!)

3. "Get matched text"
   - (Bulunan 6 haneli token)
```

---

## ADIM 4: Action Ekle - iMessage Gönder

**"+"** → "Send Message"

**Ayarlar:**
- **Message:** (Token yazacağı yer)
  - Token değişkenini seç: `[Matched Text]` veya `[Ask for Number]`
  
- **Send via:** "iMessage"

- **To:** Bilgisayarınız
  - Apple ID (örn: sena@icloud.com)
  - YA DA iCloud email
  - YA DA Mac'in iMessage kontağı

**Örnek mesaj:**
```
TOKEN: [Matched Text]
```

---

## ADIM 5: Sonlandır

**"Done"** tıkla

Artık otomasyonunuz aktif! 🎉

---

## 📸 Visual Guide (Adım Adım)

### Seçenek A: Manuel Token (Basit)

```
🔔 Trigger: Message Alındı
    ↓
✏️ Ask for Number: "Token?"
    ↓
📨 Send Message: [Number] to Computer
    ↓
✅ Done
```

### Seçenek B: Otomatik Token (Akıllı)

```
🔔 Trigger: Message Alındı
    ↓
🔍 Match Text Regex: \d{6}
    ↓
📨 Send Message: "TOKEN: [Matched]" to Computer
    ↓
✅ Done
```

---

## ADIM 6: iMessage Kontağını Ayarla

### Mac'in iMessage Adresini Bul

1. **Mac'te** Messages app açık
2. **Menu:** Menü bar'a git
3. **Account Email** kopyala
   - Örn: sena@icloud.com

### iPhone Shortcuts'ta

1. **"To:" kısmında** Mac adresini yaz
2. Kontaklardan seç veya
3. Email yazarak gönder

---

## İnteraktif Shortcut Örneği

Aşağıda basit version:

```
Automation Type: Message
Trigger: Received Message

Actions:
1️⃣  Ask for Number
    Prompt: "6 haneli token?"
    Default answer: "000000"

2️⃣  Send Message
    Message: "TOKEN: [Response from Ask for Number]"
    Via: iMessage
    To: [Your Mac]

3️⃣  Delete Message (opsiyonel)
```

---

## Otomatik Token Çıkarma (Regex)

Eğer **Telegram/SMS otomatik** token gönderiyor ise:

```
Message: "Kodunuz: 123456"
         → Regex: \d{6}
         → Bulur: 123456
         → Gönderir: "123456"
```

---

## 🧪 Test Etme

### 1. Shortcut Aktif mi?

**Shortcuts → Automation:**
- ✅ Yeşil daire (Aktif)
- ❌ Gri/Kapalı (Değil)

### 2. Test Et

**Masaüstünde bir note açıp test mesajı gönder:**

```
Telegram: Doğrulama kodunuz: 654321
```

**İPhone'da Shortcuts aktif** → Şimdi otomatik mesaj bilgisayara gitmeli

### 3. Mac'te İMessage Kontrolü

**Messages app → Siyah nokta görmeli**
- Gelen mesaj örneği: "654321" veya "TOKEN: 654321"

---

## Sorun Giderme

### ❌ "İMessage gönderilmiyor"
1. iPhone + Mac aynı Apple ID'de mi?
2. iMessage aktif mi?
   - Settings → Messages → iMessage "ON"
3. Wi-Fi/internet bağlantısı var mı?

### ❌ "Token bulunmuyor"
1. Regex pattern kontrol et: `\d{6}`
2. Mesaj tam 6 haneli mi?
   - "Kod: 123456" → ✅
   - "Kod 123456" → ✅
   - "Kod: 12345" → ❌ (5 hane)

### ❌ "Kişi bulunamıyor"
1. Mac iMessage email'ini kontrol et
2. iPhone adres defterinde kayıtlı mı?
3. Aynı Apple ID cihazları mi?

---

## Gelişmiş: Webhook ile Gönderme

Dilerseniz iMessage yerine:
- Telegram bot
- Discord webhook
- Email

Kullanabilirsiniz. Ama iMessage en basit seçenek!

---

## Backup Alma

Shortcut'u kaydetmek için:

1. **Shortcuts app → Automation seçeneğinde**
2. **"Share" → iCloud Link** ile paylaş
3. Gerekirse başka cihaza aktar

---

## Cheat Sheet 🚀

```bash
# Son kare
🔔 Message geldi
  ↓
🔍 Token çıkar (regex: \d{6})
  ↓
📱 Format: "TOKEN: 123456"
  ↓
📨 iMessage → Mac gönder
  ↓
💻 Python script yakalar
  ↓
🔐 FortiClient'a otomatik girer
  ↓
✅ VPN bağlandı!
```

---

## Video Linkler (Eğer var ise)

- YouTube: "iOS Shortcuts Message Automation"
- Apple: "Shortcuts User Guide"

---

## Sorular?

Herhangi bir adımda takılırsan message gönder! 📱
