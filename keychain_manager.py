#!/usr/bin/env python3
"""
macOS Keychain ile güvenli credential yönetimi
"""

import subprocess
import sys
from typing import Optional


class KeychainManager:
    """macOS Keychain'de credentials sakla ve oku"""

    SERVICE_NAME = "HBYS-MCP-VPN"

    @staticmethod
    def save_credentials(username: str, password: str) -> bool:
        """Username ve password'ü Keychain'e sakla"""
        try:
            # Username'i sakla
            cmd_user = [
                'security', 'add-generic-password',
                '-a', username,
                '-s', KeychainManager.SERVICE_NAME,
                '-w', username,
                '-U'  # Update if exists
            ]
            subprocess.run(cmd_user, check=True, capture_output=True)

            # Password'ü sakla
            cmd_pass = [
                'security', 'add-generic-password',
                '-a', 'password',
                '-s', KeychainManager.SERVICE_NAME,
                '-w', password,
                '-U'  # Update if exists
            ]
            subprocess.run(cmd_pass, check=True, capture_output=True)

            print("✓ Credentials Keychain'e kaydedildi")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Keychain kayıt hatası: {e}")
            return False

    @staticmethod
    def get_username() -> Optional[str]:
        """Keychain'den username'i oku"""
        try:
            cmd = [
                'security', 'find-generic-password',
                '-a', 'USERNAME',
                '-s', KeychainManager.SERVICE_NAME,
                '-w'
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                return result.stdout.strip()
            return None
        except Exception as e:
            print(f"Username okuma hatası: {e}")
            return None

    @staticmethod
    def get_password() -> Optional[str]:
        """Keychain'den password'ü oku"""
        try:
            cmd = [
                'security', 'find-generic-password',
                '-a', 'password',
                '-s', KeychainManager.SERVICE_NAME,
                '-w'
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                return result.stdout.strip()
            return None
        except Exception as e:
            print(f"Password okuma hatası: {e}")
            return None

    @staticmethod
    def get_credentials() -> tuple[Optional[str], Optional[str]]:
        """Keychain'den hem username hem password'ü oku"""
        username = KeychainManager.get_username()
        password = KeychainManager.get_password()
        return username, password

    @staticmethod
    def delete_credentials() -> bool:
        """Keychain'den credentials'ı sil"""
        try:
            cmd = [
                'security', 'delete-generic-password',
                '-a', 'PASSWORD',
                '-s', KeychainManager.SERVICE_NAME
            ]
            subprocess.run(cmd, capture_output=True)
            print("✓ Credentials silindi")
            return True
        except Exception as e:
            print(f"Silme hatası: {e}")
            return False

    @staticmethod
    def credentials_exist() -> bool:
        """Keychain'de credentials var mı kontrol et"""
        try:
            cmd = [
                'security', 'find-generic-password',
                '-a', 'password',
                '-s', KeychainManager.SERVICE_NAME
            ]
            result = subprocess.run(cmd, capture_output=True)
            return result.returncode == 0
        except Exception:
            return False


def main():
    """Keychain yönetim CLI"""
    if len(sys.argv) < 2:
        print("Kullanım:")
        print("  python keychain_manager.py save <username> <password>")
        print("  python keychain_manager.py get")
        print("  python keychain_manager.py delete")
        print("  python keychain_manager.py exists")
        return

    command = sys.argv[1]

    if command == "save" and len(sys.argv) == 4:
        username = sys.argv[2]
        password = sys.argv[3]
        KeychainManager.save_credentials(username, password)

    elif command == "get":
        username, password = KeychainManager.get_credentials()
        if username and password:
            print(f"Username: {username}")
            print(f"Password: {'*' * len(password)}")
        else:
            print("❌ Credentials bulunamadı")

    elif command == "delete":
        KeychainManager.delete_credentials()

    elif command == "exists":
        if KeychainManager.credentials_exist():
            print("✓ Credentials mevcut")
        else:
            print("❌ Credentials bulunamadı")

    else:
        print("❌ Geçersiz komut")


if __name__ == "__main__":
    main()
