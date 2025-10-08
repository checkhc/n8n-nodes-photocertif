#!/usr/bin/env python3
"""
Create example XLSX file for PhotoCertif batch certification
"""
import csv
from datetime import datetime

# Create comprehensive example data
headers = [
    "fileUrl",
    "title", 
    "description",
    "cert_name",
    "cert_symbol",
    "cert_description",
    "cert_owner",
    "external_url",
    "twitter_url",
    "discord_url",
    "instagram_url",
    "telegram_url",
    "medium_url",
    "wiki_url",
    "youtube_url"
]

examples = [
    {
        "fileUrl": "https://drive.google.com/uc?id=1abc123def456&export=download",
        "title": "My Artwork 2025",
        "description": "Digital art certified on blockchain",
        "cert_name": "MyArt2025",
        "cert_symbol": "MYART",
        "cert_description": "Original digital artwork certified with AI authenticity analysis",
        "cert_owner": "John Doe Artist",
        "external_url": "https://myartportfolio.com",
        "twitter_url": "https://x.com/johnartist",
        "discord_url": "https://discord.gg/myartcommunity",
        "instagram_url": "https://instagram.com/johnartist",
        "telegram_url": "https://t.me/johnartistchannel",
        "medium_url": "https://medium.com/@johnartist",
        "wiki_url": "https://docs.myartproject.com",
        "youtube_url": "https://youtube.com/@johnartist"
    },
    {
        "fileUrl": "https://www.dropbox.com/s/xyz789/contract.pdf?dl=1",
        "title": "Legal Contract Q1 2025",
        "description": "Important legal document certified",
        "cert_name": "LegalDoc2025",
        "cert_symbol": "LEGAL",
        "cert_description": "Official contract document with timestamp certification",
        "cert_owner": "Acme Corporation",
        "external_url": "https://acmecorp.com",
        "twitter_url": "",
        "discord_url": "",
        "instagram_url": "",
        "telegram_url": "",
        "medium_url": "",
        "wiki_url": "",
        "youtube_url": ""
    },
    {
        "fileUrl": "https://cdn.example.com/photos/sunset.jpg",
        "title": "Sunset Photography",
        "description": "Professional photography work",
        "cert_name": "Sunset2025",
        "cert_symbol": "PHOTO",
        "cert_description": "Original photograph captured on location",
        "cert_owner": "Jane Smith Photo",
        "external_url": "https://janesmithphotography.com",
        "twitter_url": "https://x.com/janesmith",
        "discord_url": "",
        "instagram_url": "",
        "telegram_url": "https://t.me/janesmithphoto",
        "medium_url": "",
        "wiki_url": "https://wiki.janesmith.com",
        "youtube_url": ""
    }
]

# Write CSV (compatible with Excel and Google Sheets)
with open('photocertif-batch-example.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    for example in examples:
        writer.writerow(example)

print("✅ Created: photocertif-batch-example.csv")
print(f"   - {len(headers)} columns")
print(f"   - {len(examples)} example rows")
print(f"   - Compatible with Excel, Google Sheets, and n8n")
