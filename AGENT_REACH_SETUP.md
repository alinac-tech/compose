# 🌐 Agent-Reach Setup Guide - Sosyal Medya Trendleri

> Agent-Reach: AI ajanlarına internet "gözü" veren CLI tool  
> Twitter, Reddit, YouTube, GitHub, Bilibili'de sıfır API ücreti ile arama

---

## 📌 Agent-Reach Nedir?

**Repository:** `Panniantong/Agent-Reach` (17.4K ⭐)

**Amaç:** AI ajanlarının sosyal medyada trend taraması yapması

**Desteklenen Platformlar:**
```
✅ Twitter (X) — Tweet'ler, trendler, konuşmalar
✅ Reddit — Subreddit'ler, discussions
✅ YouTube — Video transcript'leri, açıklamalar
✅ GitHub — Repository'ler, issues, discussions
✅ Bilibili — Chinese video platform
✅ XiaoHongShu (小红书) — Chinese social commerce
✅ Web Scraping — Jina Reader entegrasyonu
```

**Avantajlar:**
```
✓ Sıfır API ücreti (web scraping)
✓ Tek CLI command
✓ Claude Code entegrasyonu
✓ MCP server desteği
✓ Python-based
✓ Offline çalışabilir
```

---

## 🛠️ KURULUM ADIMLARI

### **Adım 1: Prerequisites**

```bash
# Gerekli paketler
Python 3.8+
pip (Python package manager)
Git

# Kontrol et
python --version
pip --version
```

### **Adım 2: Agent-Reach Klonla**

```bash
# İlk olarak, klonlama yeri seç
cd ~  # Veya /opt, /usr/local, istediğin yer

# Clone
git clone https://github.com/Panniantong/Agent-Reach.git
cd Agent-Reach

# Veya ZIP indir (network sorunu varsa)
wget https://github.com/Panniantong/Agent-Reach/archive/refs/heads/main.zip
unzip main.zip
cd Agent-Reach-main
```

### **Adım 3: Dependencies Kur**

```bash
# Virtual environment oluştur (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# VEYA
venv\Scripts\activate  # Windows

# Install requirements
pip install -r requirements.txt

# VEYA manual
pip install requests beautifulsoup4 selenium playwright aiohttp
pip install pydantic click colorama
```

### **Adım 4: Configuration**

```bash
# Config dosyası oluştur
cp config.example.yaml config.yaml

# Editöründe aç ve ayarla
nano config.yaml  # veya vi, vim, vscode

# Minimal config:
SOCIAL_MEDIA:
  twitter:
    enabled: true
    keywords: ["research", "academic", "AI"]
  
  reddit:
    enabled: true
    subreddits: ["science", "research", "MachineLearning"]
  
  youtube:
    enabled: true
    search_terms: ["academic research", "paper review"]
```

### **Adım 5: Test Et**

```bash
# Basit test
python -m agent_reach --help

# Twitter'da trend ara
python -m agent_reach search --platform twitter --query "research paper"

# Reddit'te discussion ara
python -m agent_reach search --platform reddit --query "machine learning"

# Sonuçları JSON'a kaydet
python -m agent_reach search --platform twitter --query "AI research" --output results.json
```

---

## 📊 SOSYAL MEDYA TREND TARAMASİ - KULLANIM ÖRNEKLERİ

### **Örnek 1: Günlük Trend Kontrolü**

```bash
# Sabah çıktısı kontrol et
python -m agent_reach search \
  --platform twitter \
  --query "academic writing" \
  --time-range "1d" \
  --sort-by popularity \
  --output daily_trends.json
```

**Output:**
```json
{
  "platform": "twitter",
  "query": "academic writing",
  "results": [
    {
      "author": "@user1",
      "text": "Just published my paper on...",
      "likes": 245,
      "retweets": 89,
      "timestamp": "2026-04-14T10:30:00Z"
    },
    {
      "author": "@user2",
      "text": "Tips for academic writing...",
      "likes": 512,
      "retweets": 234,
      "timestamp": "2026-04-14T09:15:00Z"
    }
  ]
}
```

### **Örnek 2: Araştırma Konusu Trend Analizi**

```bash
# Araştırman konusu hakkında ne konuşuluyor?
python -m agent_reach search \
  --platform reddit \
  --subreddit "science,MachineLearning" \
  --query "kidney injury biomarker" \
  --time-range "7d" \
  --output research_trends.json
```

### **Örnek 3: Competitor Paper Monitoring**

```bash
# Benzer çalışmalar ne zaman yayınlanıyor?
python -m agent_reach search \
  --platform github \
  --query "AKI prediction algorithm" \
  --language python \
  --sort-by stars \
  --output competitor_repos.json
```

### **Örnek 4: YouTube Akademik Konuşmalar**

```bash
# Çeşitli akademik presentations ara
python -m agent_reach search \
  --platform youtube \
  --query "acute kidney injury CABG surgery" \
  --channel-type educational \
  --output academic_videos.json
```

---

## 🤖 OTOMASYONU - Cron Job Olarak Çalıştır

### **Linux/Mac - Günlük Otomatik Trend**

```bash
# Crontab dosyasını aç
crontab -e

# Şu satırı ekle (her gün saat 9:00'da)
0 9 * * * cd ~/Agent-Reach && python -m agent_reach search --platform twitter --query "research paper" --output trends/$(date +\%Y-\%m-\%d).json

# VEYA saatlik
0 * * * * cd ~/Agent-Reach && python -m agent_reach search --platform reddit --query "academic writing" --append
```

### **Python - Scheduler Olarak**

```python
# schedule_trends.py
import schedule
import time
import subprocess
import json
from datetime import datetime

def run_trend_search():
    """Sosyal medya trendlerini tara"""
    result = subprocess.run([
        'python', '-m', 'agent_reach', 'search',
        '--platform', 'twitter',
        '--query', 'research paper',
        '--output', f'trends/{datetime.now().strftime("%Y-%m-%d_%H-%M")}.json'
    ])
    print(f"✓ Trend taraması tamamlandı: {datetime.now()}")

# Schedule
schedule.every().hour.do(run_trend_search)
schedule.every().day.at("09:00").do(run_trend_search)

# Run
while True:
    schedule.run_pending()
    time.sleep(60)
```

```bash
# Çalıştır
python schedule_trends.py
```

---

## 📈 TREND ANALİZİ - Sonuçlar Nasıl Kullanılır?

### **Adım 1: JSON Sonuçları Topla**

```bash
# Tüm sonuçları birleştir
cat trends/*.json | jq -s 'add' > all_trends.json
```

### **Adım 2: Analiz Et**

```python
import json
from collections import Counter

with open('all_trends.json', 'r') as f:
    data = json.load(f)

# En popüler konular
platforms = [item['platform'] for item in data['results']]
popular = Counter(platforms).most_common(5)

print("🔥 En Sıcak Trendler:")
for platform, count in popular:
    print(f"  {platform}: {count} mention")
```

### **Adım 3: Rapor Yap**

```bash
# Markdown rapor oluştur
cat > TREND_REPORT.md << 'EOF'
# Sosyal Medya Trend Raporu

## Bu Hafta En Çok Konuşulanlar
1. Research methodology (34 mentions)
2. Academic publishing (28 mentions)
3. Peer review process (21 mentions)

## Platform Dağılımı
- Twitter: 45%
- Reddit: 35%
- GitHub: 20%

## Öneriler
- Twitter'da trend çiziliyor: "Research methodology"
- Reddit'te detaylı diskusyon var
- GitHub'da 5 yeni repo bu konuda
EOF
```

---

## ⚙️ ADVANSEd KONFİGURASYON

### **.env Dosyası (Opsiyonel API Keys)**

```env
# Agent-Reach/.env
TWITTER_BEARER_TOKEN=your_token_here  # (opsiyonel, scraperla çalışır)
REDDIT_CLIENT_ID=your_id_here         # (opsiyonel)
GITHUB_TOKEN=your_token_here          # (public repos için gerekli değil)

# Proxy (gerekirse)
PROXY_URL=http://proxy:8080
USE_PROXY=true

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/agent_reach.log
```

### **MCP Integration (Opsiyonel)**

```yaml
# ~/.claude/config.yaml
mcp:
  agent-reach:
    command: python -m agent_reach
    port: 8000
    env:
      CONFIG_PATH: ~/Agent-Reach/config.yaml
```

---

## 🚀 HIZLI START - 5 DAKİKA

```bash
# 1. Clone
git clone https://github.com/Panniantong/Agent-Reach.git
cd Agent-Reach

# 2. Install
pip install -r requirements.txt

# 3. Test
python -m agent_reach search --platform twitter --query "test"

# 4. Configure
cp config.example.yaml config.yaml
# Editöründe keywords ayarla

# 5. Run
python -m agent_reach search --platform reddit --query "your research topic"
```

---

## 🎯 BEST PRACTICES

```
✓ Trend raporları günlük tara
✓ Aynı query'leri karşılaştır (haftalık)
✓ JSON dosyaları arşivle
✓ API rate limits'e dikkat et
✓ Proxy kullan (gerekirse)
✓ Log dosyalarını kontrol et

❌ Spam query'ler gönderme
❌ Aşırı sıklıkla tarama
❌ API keys'i public repo'ya koy
❌ Bot olarak tanıdır
```

---

## 🆘 SORUN ÇÖZME

### **"No module named 'agent_reach'"**
```bash
pip install --upgrade agent-reach
# VEYA
python -m pip install -e ~/Agent-Reach
```

### **"Rate limit exceeded"**
```bash
# Tarama aralığını arttır
python -m agent_reach search --delay 2  # 2 saniye ara
```

### **"Connection timeout"**
```bash
# Proxy kullan
python -m agent_reach search --proxy http://proxy:8080
```

---

## 📚 İLGİLİ KOMUTLAR

```bash
# Yardım
python -m agent_reach --help
python -m agent_reach search --help

# Spesifik platform yardımı
python -m agent_reach search --platform twitter --help

# Verbose mode (debug)
python -m agent_reach search -vv --platform reddit --query "test"

# Dry run (gerçekten arama yapmaz)
python -m agent_reach search --dry-run --platform twitter --query "test"
```

---

## 📊 OUTPUT FORMATLARı

### JSON
```bash
python -m agent_reach search ... --format json
```

### CSV
```bash
python -m agent_reach search ... --format csv --output results.csv
```

### Markdown Table
```bash
python -m agent_reach search ... --format markdown
```

---

## 🔗 KAYNAKLAR

- **GitHub:** https://github.com/Panniantong/Agent-Reach
- **Docs:** https://github.com/Panniantong/Agent-Reach/wiki
- **Issues:** https://github.com/Panniantong/Agent-Reach/issues
- **Discussions:** https://github.com/Panniantong/Agent-Reach/discussions

---

## ✅ KONTROL LİSTESİ

```
[ ] Python 3.8+ kurulu
[ ] Git kurulu
[ ] Agent-Reach klonlandı
[ ] Requirements install edildi
[ ] Config ayarlandı
[ ] İlk test yapıldı
[ ] Cron/scheduler kuruldu (opsiyonel)
[ ] Daily trends alınmaya başlandı
```

---

**Son Güncelleme:** 14 Nisan 2026  
**Durum:** Hazır ve kullanıma açık
