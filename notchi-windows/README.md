# Notchi for Windows

Windows port of [Notchi](https://github.com/sk-ruban/notchi) - a visual companion for Claude Code that displays animated sprites reacting to your coding sessions in real-time.

![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

## How It Works

```
Claude Code → Hooks (PowerShell) → TCP Socket → Event Parser → State Machine → Animated Sprites
```

A floating overlay window sits at the top of your screen, showing pixel art characters that react to Claude Code events:
- **Idle** - Gently bobbing, waiting for action
- **Working** - Energetic bouncing with sparkle particles
- **Sleeping** - Peaceful with floating Z's (after 5 min inactivity)
- **Compacting** - Swirl effect during context compaction
- **Waiting** - Dot animation while waiting for user input

Sprites also show emotions (happy, sad, neutral) based on prompt sentiment analysis.

## Requirements

- Windows 10/11
- Python 3.10+
- Claude Code installed and configured

## Installation

```bash
# Clone or download this directory
cd notchi-windows

# Install dependencies
pip install -r requirements.txt

# Run Notchi (auto-installs Claude Code hooks on first run)
python main.py
```

## Usage

```bash
# Basic usage
python main.py

# With emotion analysis (requires Anthropic API key)
python main.py --api-key sk-ant-xxxxx

# Or set via environment variable
set ANTHROPIC_API_KEY=sk-ant-xxxxx
python main.py

# Custom port
python main.py --port 19020

# Manage hooks
python main.py --install-hooks
python main.py --uninstall
```

## Controls

- **Drag** the overlay window to reposition it
- **Double-click** to expand/collapse session details
- **Right-click** for context menu (minimize to tray, quit)
- Each Claude Code session gets its own sprite on the grass island
- Multiple concurrent sessions are supported

## Architecture

| macOS (Original)     | Windows (This Port)        |
|---------------------|---------------------------|
| Swift / SwiftUI     | Python / tkinter          |
| MacBook Notch       | Floating overlay window   |
| Unix domain socket  | TCP socket (localhost)    |
| Bash hook script    | PowerShell hook script    |
| Sparkle updates     | Manual update             |
| Keychain API keys   | Env var / CLI arg         |

## Project Structure

```
notchi-windows/
├── main.py                 # Entry point
├── notchi/
│   ├── __init__.py
│   ├── app.py              # Main application orchestrator
│   ├── models.py           # Data models (HookEvent, NotchiState, SessionData, etc.)
│   ├── services.py         # Socket server, hook installer, state machine, session store
│   ├── sprites.py          # Pixel art sprite generation
│   └── ui.py               # Overlay window and system tray
├── requirements.txt
├── setup.py
└── README.md
```

## License

MIT - Based on [Notchi](https://github.com/sk-ruban/notchi) by sk-ruban.
