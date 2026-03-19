#!/usr/bin/env python3
"""
Notchi for Windows - Claude Code Companion

A Windows port of Notchi (https://github.com/sk-ruban/notchi).
Displays animated sprites that react to Claude Code activity in real-time.

Usage:
    python main.py [--api-key YOUR_ANTHROPIC_API_KEY] [--uninstall] [--install-hooks]

The app will:
1. Auto-install Claude Code hooks on first run
2. Listen for events on TCP port 19019
3. Show a floating overlay window with animated sprites
4. Optionally analyze prompt sentiment via Anthropic API
"""

import argparse
import logging
import sys
import os


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )


def main():
    parser = argparse.ArgumentParser(
        description="Notchi for Windows - Claude Code Companion",
    )
    parser.add_argument(
        "--api-key",
        help="Anthropic API key for emotion analysis (optional)",
        default=os.environ.get("ANTHROPIC_API_KEY"),
    )
    parser.add_argument(
        "--uninstall",
        action="store_true",
        help="Uninstall Claude Code hooks and exit",
    )
    parser.add_argument(
        "--install-hooks",
        action="store_true",
        help="Install Claude Code hooks and exit",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=19019,
        help="TCP port to listen on (default: 19019)",
    )

    args = parser.parse_args()

    setup_logging()
    logger = logging.getLogger("notchi")

    # Handle hook management commands
    if args.uninstall:
        from notchi.services import HookInstaller
        HookInstaller.uninstall()
        logger.info("Notchi hooks uninstalled.")
        return

    if args.install_hooks:
        from notchi.services import HookInstaller
        if HookInstaller.install():
            logger.info("Notchi hooks installed successfully.")
        else:
            logger.error("Failed to install hooks.")
            sys.exit(1)
        return

    # Update port if specified
    if args.port != 19019:
        from notchi import services
        services.SOCKET_PORT = args.port

    # Run the app
    from notchi.app import NotchiApp

    app = NotchiApp(api_key=args.api_key)
    app.run()


if __name__ == "__main__":
    main()
