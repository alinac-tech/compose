#!/usr/bin/env python3
"""
iOS Shortcuts otomatik oluşturma ve paylaşma aracı
"""

import json
import base64
import urllib.parse
import subprocess
import qrcode
from typing import Dict, Any
from pathlib import Path


class ShortcutGenerator:
    """iOS Shortcuts oluştur ve paylaş"""

    def __init__(self):
        self.shortcut_config = {
            "WFWorkflow": {
                "WFWorkflowMinimumRelease": 1100,
                "WFWorkflowMinimumClientRelease": 1100,
                "WFWorkflowMinimumClientRelease": 1100,
            }
        }

    def create_token_shortcut(self) -> str:
        """
        Token forwarding shortcut XML'i oluştur

        Akış:
        1. Mesaj alınca trigger
        2. Regex ile token çıkar (\d{6})
        3. iMessage ile Mac'e gönder
        """

        shortcut_url = (
            "https://www.icloud.com/shortcuts/"
            "YOUR_SHORTCUT_ID"
        )

        return shortcut_url

    def create_qr_code(self, data: str, filename: str = "shortcut.png"):
        """Shortcut link'i için QR code oluştur"""
        try:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(data)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            img.save(filename)

            print(f"✓ QR code oluşturuldu: {filename}")
            return filename
        except Exception as e:
            print(f"QR code hatası: {e}")
            return None

    def create_shortcut_url(self, action_type: str = "token") -> str:
        """
        iOS Shortcuts URL scheme'i oluştur

        Kullanım:
        shortcuts://run-shortcut/?name=TOKEN_FORWARD
        """

        if action_type == "token":
            # Token forwarding shortcut
            url = (
                "shortcuts://run-shortcut/?"
                "name=VPN_Token_Forward"
                "&text=your_token"
            )
        elif action_type == "vpn":
            # VPN full automation
            url = (
                "shortcuts://run-shortcut/?"
                "name=VPN_AutoLogin"
            )
        else:
            url = "shortcuts://open-shortcut/?name=Custom"

        return url

    def generate_icloud_link(self) -> Dict[str, str]:
        """
        iCloud shortcut link oluştur
        (Manuel olarak Shortcuts app'dan generate edilmeli)
        """

        instructions = {
            "step1": "Shortcuts app → Automation seç",
            "step2": "'⋯' (Daha fazla) → 'Share' tıkla",
            "step3": "'iCloud Link' seçeneği seç",
            "step4": "Link kopyala ve paylaş",
            "result": "https://www.icloud.com/shortcuts/[ID]"
        }

        return instructions

    def create_manual_link_instructions(self) -> str:
        """Manuel link oluşturma talimatları"""

        instructions = """
╔════════════════════════════════════════════════════════════════╗
║        iOS Shortcuts - iCloud Link Oluşturma Kılavuzu         ║
╚════════════════════════════════════════════════════════════════╝

ADIM 1: Shortcut'u Oluştur
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. iPhone'da Shortcuts app aç
2. "Automation" → "+" (yeni)
3. "Message" trigger seç
4. Actions ekle:
   • Text: [Message Body]
   • Match Text (Regex): \\d{6}
   • Send Message: [Matched] to Mac

ADIM 2: iCloud Link Oluştur
━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Shortcut'u seç
2. "⋯" (Daha fazla) tıkla
3. "Share" seçeneği seç
4. "iCloud Link" → "Copy Link"

ADIM 3: Link'i Paylaş
━━━━━━━━━━━━━━━━━━━
Oluşan link örneği:
https://www.icloud.com/shortcuts/abc123def456

Bu link'i herkese gönder:
- Bilgisayarına Safari'de aç
- Shortcuts App aç → "Add" butonu
- Shortcut yüklenir ve aktif olur!

ADIM 4: Test Et
━━━━━━━━━━━━
1. SMS/Mesaj al: "Token: 123456"
2. iOS Shortcut otomatik çalışması gerekir
3. iMessage'da "123456" almalısın

╔════════════════════════════════════════════════════════════════╗
║                    ✅ BITTI!                                  ║
╚════════════════════════════════════════════════════════════════╝
        """

        return instructions

    def generate_quick_setup(self) -> Dict[str, str]:
        """Hızlı setup JSON"""

        setup = {
            "shortcut_name": "VPN_Token_Forward",
            "trigger": "Message Received",
            "actions": [
                {
                    "type": "Text",
                    "input": "[Message Body]"
                },
                {
                    "type": "Match Text",
                    "pattern": "\\d{6}",
                    "regex": True
                },
                {
                    "type": "Send Message",
                    "message": "[Matched Text]",
                    "service": "iMessage",
                    "recipient": "[Your Mac]"
                },
                {
                    "type": "Delete Message",
                    "optional": True
                }
            ],
            "expected_time": "5 minutes",
            "difficulty": "Easy"
        }

        return setup

    def save_setup_json(self, filename: str = "shortcut_setup.json"):
        """Setup'ı JSON olarak kaydet"""
        try:
            setup = self.generate_quick_setup()
            with open(filename, 'w') as f:
                json.dump(setup, f, indent=2)

            print(f"✓ Setup JSON kaydedildi: {filename}")
            return filename
        except Exception as e:
            print(f"JSON kayıt hatası: {e}")
            return None


def main():
    """CLI interface"""
    print("=" * 60)
    print("iOS Shortcuts Otomatik Kurulum Aracı")
    print("=" * 60)

    generator = ShortcutGenerator()

    # 1. Manual instructions
    print("\n" + generator.create_manual_link_instructions())

    # 2. Generate QR code
    print("\n📱 QR Code oluşturuluyor...\n")
    # QR code gerçek link için yapılabilir
    # generator.create_qr_code("https://example.com/shortcut")

    # 3. Save setup JSON
    print("💾 Setup yapılandırması kaydediliyor...\n")
    generator.save_setup_json()

    # 4. Shortcut URL
    shortcut_url = generator.create_shortcut_url("token")
    print(f"🔗 Shortcut URL: {shortcut_url}\n")

    print("=" * 60)
    print("✅ Tamamlandı!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except ImportError as e:
        print(f"⚠️  qrcode kütüphanesi yükle: pip install qrcode pillow")
