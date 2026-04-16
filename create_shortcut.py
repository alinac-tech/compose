#!/usr/bin/env python3
"""
iOS Shortcuts otomatik oluşturucu
VPN Token Forwarding Shortcut dosyası oluştur
"""

import json
import base64
import uuid
from pathlib import Path


def create_token_forwarding_shortcut():
    """
    iOS Shortcuts JSON yapısı oluştur

    Akış:
    1. Message trigger
    2. Text çıkar: [Message Body]
    3. Regex match: \d{6}
    4. iMessage gönder: [Matched Text]
    """

    # Shortcut yapısı (iOS Shortcuts format)
    shortcut = {
        "WFWorkflow": {
            "WFWorkflowActions": [
                # Action 0: Text (Message Body)
                {
                    "WFSerializationType": "WFAppStore",
                    "WFWorkflowActionIdentifier": "is.workflow.actions.text",
                    "WFWorkflowActionUUID": str(uuid.uuid4()),
                    "WFInput": {
                        "Type": "ActionInput",
                        "OutputName": "Text",
                        "OutputUUID": str(uuid.uuid4()),
                    }
                },
                # Action 1: Match Text (Regex \d{6})
                {
                    "WFSerializationType": "WFAppStore",
                    "WFWorkflowActionIdentifier": "is.workflow.actions.matchtext",
                    "WFWorkflowActionUUID": str(uuid.uuid4()),
                    "WFInput": {
                        "Type": "ActionInput",
                        "Pattern": "\\d{6}",
                        "MatchType": "Regex",
                    }
                },
                # Action 2: Send Message (iMessage)
                {
                    "WFSerializationType": "WFAppStore",
                    "WFWorkflowActionIdentifier": "is.workflow.actions.sendsms",
                    "WFWorkflowActionUUID": str(uuid.uuid4()),
                    "WFInput": {
                        "Type": "ActionInput",
                        "ShowWhenRun": True,
                        "SendMethod": "iMessage",
                    }
                },
                # Action 3: Delete Message (Optional)
                {
                    "WFSerializationType": "WFAppStore",
                    "WFWorkflowActionIdentifier": "is.workflow.actions.delete",
                    "WFWorkflowActionUUID": str(uuid.uuid4()),
                    "WFInput": {
                        "Type": "ActionInput",
                    }
                }
            ],
            "WFWorkflowClientVersion": {
                "BuildNumber": 1100,
                "MinimumBuildNumber": 1100,
                "ReleaseNumber": "1100.0"
            },
            "WFWorkflowClientRelease": "11.0",
            "WFWorkflowMinimumClientRelease": 1100.0,
            "WFWorkflowMinimumClientRelease": 1100.0,
            "WFWorkflowTypes": ["NCWidget", "WatchKit"],
            "WFWorkflowInputParameters": [],
            "WFWorkflowOutputParameters": [],
            "WFWorkflowDescription": "VPN Token Forwarding - Mesajdan token çıkar ve iMessage gönder",
            "WFWorkflowName": "VPN_Token_Forward",
            "WFWorkflowImportQuestions": [],
        }
    }

    return shortcut


def create_shortcut_text_format():
    """
    İnsan tarafından okunabilir Shortcut format'ı oluştur
    (Copy-paste için)
    """

    shortcut_text = """
╔═══════════════════════════════════════════════════════════════════════════╗
║                    📱 iOS SHORTCUTS - VPN TOKEN FORWARD                   ║
║                                                                           ║
║  Bu dosyayı iPhone'da Shortcuts app'ta kopyala-yapıştır                  ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 SHORTCUT METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:           VPN_Token_Forward
Type:           Automation (Message Trigger)
Difficulty:     Easy ⭐
Time to setup:  < 5 minutes

🔧 TRIGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type:           Received Message
From:           Anyone
Filter:         (Empty - all messages)
Notification:   OFF (Silent)

📝 ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACTION 1️⃣ : TEXT
─────────────────────────────────────
Name:           Extract Message Text
Input:          [Message Body]
Output:         Text

ACTION 2️⃣ : MATCH TEXT (REGEX)
─────────────────────────────────────
Name:           Extract 6-digit Token
Text Input:     [Text from Action 1]
Pattern:        \\d{6}
Regex:          ON ✓
Full Match:     ON ✓
Output:         Matched Text

ACTION 3️⃣ : SEND MESSAGE
─────────────────────────────────────
Name:           Send to Mac via iMessage
Message:        [Matched Text]
Service:        iMessage ⭐
Recipient:      Your Mac (Apple ID or iMessage email)
Examples:       sena@icloud.com, you@mac.com

ACTION 4️⃣ : DELETE MESSAGE (OPTIONAL)
─────────────────────────────────────
Name:           Clean up
Delete:         ON ✓

✅ SETUP CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☐ Shortcut app açık
☐ "Automation" sekmesi
☐ "+" tıkla (New Automation)
☐ "Message" trigger seç
☐ Aşağıdaki 4 action ekle (sırayla)
☐ "Done" tıkla
☐ Automation açık (blue/green) ✓
☐ iMessage for Mac adresini gir
☐ Test: Mesaj gönder → Token alınıyor mu?

🔗 MAC RECIPIENT BULMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mac'te Messages app aç
2. Sağ üst: Menü (⋯) → Preferences
3. Accounts sekmesi
4. iMessage email'ini kopyala
5. iPhone Shortcut'ta "To:" kısmına yapıştır

⏱️ EXPECTED TIMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Setup Time:     < 5 minutes
Test Time:      < 1 minute
Total:          < 10 minutes

📊 AUTOMATION FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📱 SMS/Message Received
            ↓
    🔍 Extract Token (Regex: \\d{6})
            ↓
    ✅ Token found? → YES
            ↓
    📨 Send via iMessage to Mac
            ↓
    💻 Mac receives: "123456"
            ↓
    🐍 Python script processes
            ↓
    🔐 FortiClient gets token
            ↓
    ✅ VPN Connected!

═══════════════════════════════════════════════════════════════════════════════

🎯 QUICK START (Kopyala-Yapıştır)

1. iPhone'da Shortcuts app aç
2. "Automation" → "+" → "Message"
3. Settings: "Anyone", no filter → "Next"
4. Aşağıdaki 4 action'ı ekle:

   ACTION 1: Text
   ├─ Input: [Message Body]

   ACTION 2: Match Text
   ├─ Text: [Text from Action 1]
   ├─ Pattern: \\d{6}
   ├─ Regex: ON

   ACTION 3: Send Message
   ├─ Message: [Matched Text]
   ├─ Via: iMessage
   ├─ To: YOUR_MAC_EMAIL

   ACTION 4: Delete Message
   ├─ Delete: ON

5. "Done" → Name: VPN_Token_Forward → "Done"

6. Test:
   ├─ SMS gönder: "Code: 654321"
   ├─ Shortcut çalışıyor mu?
   ├─ iMessage'da token aldı mı?

✅ BİTTİ!

═══════════════════════════════════════════════════════════════════════════════

ℹ️ NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• iPhone + Mac aynı Apple ID'de olmalı
• iMessage açık olmalı (Settings → Messages)
• Regex pattern: \\d{6} (tam 6 haneli sayılar)
• Delete Message: Optional ama tavsiyeli
• Notification kapalı: Sessiz çalışması için

🚀 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ iMessage göndermiyor?
   → Mac email doğru mu?
   → iMessage açık mı?

❌ Token bulunmuyor?
   → Regex: \\d{6} yazılı mı?
   → Mesaj tam 6 hane mi?

❌ Shortcut çalışmıyor?
   → Automation mavi mi? (ON)
   → Message trigger doğru mu?

═══════════════════════════════════════════════════════════════════════════════
Hazır mısın? Başlamaya! 🚀
═══════════════════════════════════════════════════════════════════════════════
    """

    return shortcut_text


def save_shortcut_instructions():
    """Shortcut kurulum talimatlarını dosya olarak kaydet"""

    text = create_shortcut_text_format()

    output_file = Path("/home/user/compose/INSTALL_SHORTCUT.txt")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f"✅ Shortcut talimatları kaydedildi: {output_file}")
    print("\n" + text)

    return output_file


if __name__ == "__main__":
    print("=" * 80)
    print("📱 iOS SHORTCUTS - VPN TOKEN FORWARD OLUŞTURUCU")
    print("=" * 80)
    print()

    # Talimatları kaydet ve göster
    save_shortcut_instructions()

    print("\n" + "=" * 80)
    print("✅ Tamamlandı!")
    print("=" * 80)
    print("\n📋 SONRAKI ADIMLAR:")
    print("1. INSTALL_SHORTCUT.txt dosyasını aç")
    print("2. iPhone'a git ve Shortcuts app açık")
    print("3. Adımları takip et (< 5 dakika)")
    print("4. Test et!")
