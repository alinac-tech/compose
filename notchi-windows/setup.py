"""Setup script for Notchi Windows."""

from setuptools import setup, find_packages

setup(
    name="notchi-windows",
    version="1.0.0",
    description="Claude Code companion with animated sprites for Windows",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    author="Based on Notchi by sk-ruban",
    url="https://github.com/sk-ruban/notchi",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "Pillow>=10.0.0",
        "pystray>=0.19.5",
        "requests>=2.31.0",
    ],
    entry_points={
        "console_scripts": [
            "notchi=main:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Win32 (MS Windows)",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Utilities",
    ],
)
