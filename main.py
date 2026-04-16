#!/usr/bin/env python3
"""
HBYS MCP - VPN Token Automation
FortiClient VPN ile 2FA token otomasyonu
"""

import os
import sys
import subprocess
import time
import re
from typing import Optional
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

# Load .env file if it exists
if load_dotenv:
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        load_dotenv(env_file)

class FortiClientAutomation:
    """FortiClient VPN token otomasyonu"""

    def __init__(self, username: str = "", password: str = ""):
        self.token_pattern = r'\b\d{6}\b'  # 6 haneli token
        self.forticlient_app = "/Applications/FortiClient.app"
        self.username = username
        self.password = password

    def is_forticlient_running(self) -> bool:
        """FortiClient uygulaması açık mı kontrol et"""
        try:
            result = subprocess.run(
                ['pgrep', '-f', 'FortiClient'],
                capture_output=True
            )
            return result.returncode == 0
        except Exception as e:
            print(f"Hata: {e}")
            return False

    def extract_token(self, text: str) -> Optional[str]:
        """Metinden 6 haneli tokeni çıkar"""
        match = re.search(self.token_pattern, text)
        if match:
            return match.group(0)
        return None

    def bring_forticlient_to_front(self):
        """FortiClient penceresini ön plana getir"""
        try:
            script = """
            tell application "FortiClient"
                activate
            end tell
            """
            subprocess.run(['osascript', '-e', script], check=True)
            time.sleep(0.5)
            return True
        except Exception as e:
            print(f"FortiClient ön plana getirme hatası: {e}")
            return False

    def enter_credentials(self) -> bool:
        """Username ve password'ü gir"""
        try:
            import pyautogui

            self.bring_forticlient_to_front()
            time.sleep(1)

            # Username alanına tıkla ve gir
            print(f"Username giriliyor: {self.username}")
            pyautogui.typewrite(self.username, interval=0.05)
            pyautogui.press('tab')  # Sonraki alana geç (password)
            time.sleep(0.3)

            # Password alanına gir
            print(f"Password giriliyor...")
            pyautogui.typewrite(self.password, interval=0.05)
            pyautogui.press('tab')  # Sonraki alana geç (token)
            time.sleep(0.3)

            print("✓ Credentials girildi, token bekleniyor...")
            return True
        except Exception as e:
            print(f"Credentials girme hatası: {e}")
            return False

    def enter_token_via_keyboard(self, token: str):
        """Token'ı keyboard ile FortiClient'a gir"""
        try:
            # PyAutoGUI kullanarak keyboard simulation
            import pyautogui

            self.bring_forticlient_to_front()
            time.sleep(0.5)

            pyautogui.typewrite(token, interval=0.1)
            pyautogui.press('enter')

            print(f"✓ Token girildi: {token}")
            return True
        except Exception as e:
            print(f"Token girme hatası: {e}")
            return False

    def listen_for_imessage(self):
        """iMessage'ları dinle ve token'ı yakala"""
        try:
            # macOS iMessage database'den son mesajları oku
            messages_db = os.path.expanduser(
                "~/Library/Messages/chat.db"
            )

            if not os.path.exists(messages_db):
                print("iMessage database bulunamadı")
                return None

            # AppleScript ile en son mesajı al
            script = """
            tell application "Messages"
                set recent_message to text of item 1 of (get paragraphs of (get content of front window))
                return recent_message
            end tell
            """

            result = subprocess.run(
                ['osascript', '-e', script],
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                message_text = result.stdout.strip()
                token = self.extract_token(message_text)

                if token:
                    print(f"Token bulundu: {token}")
                    return token

        except Exception as e:
            print(f"iMessage dinleme hatası: {e}")

        return None

def get_credentials_from_sources() -> tuple[Optional[str], Optional[str]]:
    """Credentials'ı farklı kaynaklardan al (öncelik sırası)"""

    username = None
    password = None

    # 1. Command-line arguments
    if len(sys.argv) > 2:
        return sys.argv[1], sys.argv[2]

    # 2. Environment variables
    username = os.getenv("VPN_USERNAME")
    password = os.getenv("VPN_PASSWORD")

    if username and password:
        print("✓ Environment variables'dan credentials yüklendi")
        return username, password

    # 3. macOS Keychain
    try:
        from keychain_manager import KeychainManager

        if KeychainManager.credentials_exist():
            username, password = KeychainManager.get_credentials()
            if username and password:
                print("✓ Keychain'den credentials yüklendi")
                return username, password
    except ImportError:
        pass

    # 4. İnteraktif input
    print("\n⚠️  Credentials bulunmadı. Lütfen girin:")
    print("   (Secure storage için sonra 'python keychain_manager.py save <user> <pass>' çalıştır)\n")

    username = input("Username: ").strip()
    password = input("Password: ").strip()

    # Keychain'e kaydetme teklifi
    if username and password:
        try:
            from keychain_manager import KeychainManager
            save_choice = input("\nKeychain'e kaydetmek ister misiniz? (y/n): ").strip().lower()
            if save_choice == 'y':
                KeychainManager.save_credentials(username, password)
        except ImportError:
            pass

    return username, password


def main():
    """Ana fonksiyon"""
    print("=" * 50)
    print("HBYS MCP - FortiClient VPN Otomasyonu")
    print("=" * 50)

    # Credentials'ı al
    username, password = get_credentials_from_sources()

    if not username or not password:
        print("❌ Credentials alınamadı")
        sys.exit(1)

    automation = FortiClientAutomation(username=username, password=password)

    # FortiClient'ın açık olup olmadığını kontrol et
    if not automation.is_forticlient_running():
        print("❌ FortiClient uygulaması açık değil")
        print("Lütfen FortiClient'ı başlatınız...")
        sys.exit(1)

    print("✓ FortiClient açık")

    # Credentials'ı gir
    print("\n🔐 Credentials otomatik olarak girilecek...")
    if not automation.enter_credentials():
        print("❌ Credentials girilirken hata oluştu")
        sys.exit(1)

    print("⏳ iMessage'ları dinleniyor (Token bekleniyor)...")
    print("   CTRL+C ile çıkış yapabilirsiniz\n")

    try:
        max_wait_time = 120  # 2 dakika timeout
        start_time = time.time()

        while True:
            elapsed = time.time() - start_time

            if elapsed > max_wait_time:
                print("⏱️ Timeout: Token 2 dakika içinde alınamadı")
                break

            token = automation.listen_for_imessage()

            if token:
                print(f"\n✅ Token yakalandı: {token}")
                time.sleep(0.5)

                # Token'ı FortiClient'a gir
                if automation.enter_token_via_keyboard(token):
                    print("🎉 2FA tamamlandı! VPN bağlantısı kurulmakta...\n")
                    time.sleep(2)
                    break

            time.sleep(2)  # Her 2 saniyede kontrol et

    except KeyboardInterrupt:
        print("\n\n⛔ Program durduruldu")

    print("=" * 50)

if __name__ == "__main__":
    main()
