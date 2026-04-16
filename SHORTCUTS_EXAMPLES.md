# 📱 iOS Shortcuts - Örnek Automation Yapıları

Başlangıç için bu örnekleri kopyalayabilirsin!

---

## 📋 Seçenek 1: Basit Manuel Token

**Kullanım:** Mesaj geldiğinde manuel olarak token sorulur

```
TRIGGER: Message received
├── Ask for Number
│   ├── Prompt: "6 haneli kodu gir:"
│   ├── Default Answer: "000000"
│   └── Type: Number Input
├── Send Message
│   ├── Message: [Response]
│   ├── Via: iMessage
│   └── To: [Your Mac]
└── Show Result: "Gönderildi! ✅"
```

**Pros:** Basit, hatasız  
**Cons:** El ile girmelisin

---

## 🤖 Seçenek 2: Otomatik Regex Token

**Kullanım:** Mesajdan otomatik 6 haneli sayı çıkarır

```
TRIGGER: Message received
├── Text: [Message Body]
├── Match Text
│   ├── Regex: \d{6}
│   └── Full match: ON
├── Send Message
│   ├── Message: [Matched Text]
│   ├── Via: iMessage
│   └── To: [Your Mac]
└── Delete Message (Optional)
```

**Pros:** Tamamen otomatik  
**Cons:** Regex biraz teknik

---

## 🎯 Seçenek 3: Telegram Format

**Kullanım:** Telegram kodunu formatla ve gönder

```
TRIGGER: Message received
├── Ask for Confirmation: "Telegram kodu gönder?"
│   ├── If Yes
│   │   ├── Ask for Text: "Kodu gir:"
│   │   ├── Send Message to Mac
│   │   └── Show: "Gönderildi!"
│   └── If No
│       └── Exit
```

**Örnek mesaj:**
```
Telegram: 
Doğrulama kodunuz: 123456
Geçerlilik süresi: 10 dakika
```

---

## 🔔 Seçenek 4: SMS + Bildirim

**Kullanım:** SMS ile token, aynı zamanda bildirim ver

```
TRIGGER: Message received (SMS)
├── Text: [Message Body]
├── Match Text Regex: \d{6}
├── Send Notification
│   ├── Title: "Token Yakalandı"
│   ├── Body: [Matched Text]
│   └── Sound: ON
├── Send Message to Mac
│   └── "TOKEN: [Matched]"
└── Delay: 2 seconds
```

**Pros:** Visual feedback  
**Cons:** Daha kompleks

---

## 🔐 Seçenek 5: Güvenli Clipboard

**Kullanım:** Token'ı clipboard'a kopyala + iMessage gönder

```
TRIGGER: Message received
├── Text: [Message Body]
├── Match Text: \d{6}
├── Copy to Clipboard: [Matched]
├── Send Message: "CODE COPIED" to Mac
├── Show Alert: "Token kopyalandı! ✅"
└── Auto-delete clipboard after: 60s
```

---

## 📧 Seçenek 6: Email Fallback

**Kullanım:** iMessage başarısız olursa email gönder

```
TRIGGER: Message received
├── Ask for Number: "Token?"
├── Try
│   └── Send Message (iMessage) to Mac
├── Catch Error
│   └── Send Email: token@example.com
└── Show Result
```

---

## 🚨 Seçenek 7: Koşullu Token

**Kullanım:** Sadece belirli gönderenden token al

```
TRIGGER: Message received
├── If [Sender] contains "Telegram"
│   ├── Extract Token (Regex)
│   ├── Send to Mac
│   └── Delete Message
├── Else If [Sender] contains "Telecom"
│   ├── Extract Token
│   ├── Send to Mac
│   └── Keep Message
└── Else
    └── Show Notification: "Unknown sender"
```

---

## 🎨 Seçenek 8: GUI ile Format

**Kullanım:** Hoş ve renkli arayüz ile

```
TRIGGER: Message received
├── Choose from List
│   ├── "🔐 Token Gönder"
│   ├── "📋 Ayrıntıları Gör"
│   └── "⛔ İptal"
├── If "Token Gönder"
│   └── Ask for Number + Send
└── If "Ayrıntıları Gör"
    └── Show Message Details
```

---

## 🔄 Seçenek 9: Multi-Step Validation

**Kullanım:** 2 kere doğrula (hata kontrolü)

```
TRIGGER: Message received
├── Ask for Number: "Token?"
├── Ask for Confirmation: "Doğrula: [Number]"
├── If Confirmed
│   ├── Send to Mac: [Number]
│   └── Show: "✅ Gönderildi!"
└── If Not Confirmed
    ├── Ask Again: "Token?"
    └── Loop back
```

---

## ⚡ Seçenek 10: Hızlı Shortcut (1 tıp)

**Kullanım:** Kısa yoldan Manuel gönder

```
Quick Action (Widget)
├── Ask for Number: "Token?"
├── Send to Mac
└── Show: "✅"
```

**Arayüz:** Home screen widget → 1 tıp → bitti!

---

## 🎯 TAVSIYE EDİLEN: Seçenek 2 + 4

**Neden?** Otomatik + feedback kombineye

```
⭐ Best Practice Setup

TRIGGER: Message received
├── Text: [Message Body]
├── If contains \d{6}
│   ├── Match Text Regex
│   ├── Send Notification: "Token: [X]"
│   ├── Send Message to Mac: [Token]
│   └── Delete Message
└── Log Timestamp (optional)
```

---

## 🛠️ Shortcut Exportlamak

### XML/Link Olarak Paylaş

1. Shortcuts app → Automation seç
2. **"Share" → iCloud Link**
3. Başka cihazda aç → Auto import

### QR Code

1. **"Share" → QR Code**
2. Telefon kamerası ile scan
3. Shortcuts app açılır → Import

---

## 📊 Karşılaştırma Tablosu

| Seçenek | Zorluk | Otomatik | Güvenli | Hız |
|---------|--------|----------|---------|-----|
| 1. Basit | ⭐ | ❌ | ✅ | 🚶 |
| 2. Regex | ⭐⭐ | ✅ | ✅ | 🚀 |
| 3. Telegram | ⭐⭐ | ✅ | ✅ | 🚀 |
| 4. Bildirim | ⭐⭐⭐ | ✅ | ⚠️ | 🚀 |
| 5. Clipboard | ⭐⭐⭐ | ✅ | ❌ | 🚀 |
| 10. Widget | ⭐ | ❌ | ✅ | ⚡ |

---

## 💡 Pro Tips

### Tip 1: Test Environment
```
Shortcuts → Automation → Edit
Tap "Test" → Manual test et
```

### Tip 2: Logging
```
Her adımdan sonra
Show Result: [Value]
Böylece debug edebilirsin
```

### Tip 3: Speed Up
```
Notification Settings → OFF
(Daha hızlı çalışır)
```

### Tip 4: Multiple Destinations
```
Seçenek 2 + Email fallback:

Try
  └── iMessage
On Error
  └── Email
```

---

## 🚀 Başlayış Kodu (Pseudo-code)

```swift
// iOS Shortcuts pseudo-code

automation MessageReceived {
    let message = getMessage()
    let token = extractToken(message, regex: \d{6})
    
    if token != nil {
        sendMessage(token, to: "Mac", via: "iMessage")
        deleteMessage(message)
        notify("Token gönderildi")
    } else {
        notify("Token bulunamadı")
    }
}
```

---

## 🎓 Adım Adım: Seçenek 2 (Önerilir)

### Shortcuts App'i Aç
1. **Tab:** Automation
2. **Button:** "+" (Yeni)
3. **Trigger:** Message

### Mesaj Alınca Yapılacaklar
1. **Add Action → Text**
   - Source: [Message Body]
2. **Add Action → Match Text**
   - Pattern: `\d{6}`
3. **Add Action → Send Message**
   - Message: [Matched Text]
   - Via: iMessage
   - To: Mac's Apple ID
4. **Save & Enable**

✅ **Bitti!**

---

## Bağlantı Sırası

```
📱 iPhone Shortcut (Token)
        ↓ iMessage
💻 Mac (Messages App)
        ↓ Python Script
🔐 FortiClient
        ↓
🌐 VPN Connected ✅
```

---

Hangisini seçmek istersen söyle! 📱
