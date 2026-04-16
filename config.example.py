# FortiClient VPN Credentials
# Bu dosyayı config.py olarak kaydet ve credentials'ı doldur

VPN_CONFIG = {
    "username": "your_username",
    "password": "your_password",
    "timeout": 120,  # Saniye cinsinden (2 dakika)
    "imessage_polling_interval": 2,  # iMessage kontrol süresi (saniye)
}

# Opsiyonel: Telegram bildirimi
TELEGRAM_CONFIG = {
    "enabled": False,
    "bot_token": "",
    "chat_id": "",
}

# Opsiyonel: Log ayarları
LOG_CONFIG = {
    "enabled": True,
    "file": "vpn_automation.log",
    "level": "INFO",
}
