# ⚡ CloudWaker

🌐 **Live Application:** [https://cloudwaker.k7m.f5.si](https://cloudwaker.k7m.f5.si) *(Workers Mirror: [https://cloudwaker.okpn.workers.dev](https://cloudwaker.okpn.workers.dev))*

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**CloudWaker** is a modern, fully serverless, and stateless Wake on LAN (WoL) web dashboard designed to trigger remote power-on for home computers from any web browser.

Powered by Cloudflare Workers and utilizing the trusted [Depicus](https://www.depicus.com) WoL relay engine, CloudWaker offers a secure, aesthetic, and privacy-first solution with zero server-side data retention.

---

## 💡 Key Architectural Concepts

### 1. Stateless "URL-as-a-Database" Architecture
CloudWaker operates on a strict **zero-server-storage** model. There is no database, session, or backend storage on Cloudflare Workers. 
* All device configurations are either encrypted and stored locally in the user's browser (`localStorage`) or encoded directly into self-contained, encrypted share URLs (`?data=AES256(...)`).
* The Web application itself acts purely as a stateless UI renderer and packet-dispatching execution engine.

### 2. Privacy-First Masking & Local AES Encryption
* Sensitive connection parameters (MAC address, DDNS host, custom port) can be encrypted client-side using AES-256 before being stored.
* On-screen displays mask sensitive details (e.g., `●●:●●:●●:●●:●●:●●` & `●●●●●●●● (Protected)`), preventing shoulder surfing while editing or viewing.

### 3. Protected Share Links (6-Digit PIN)
* Shared URLs can be locked with a 6-digit passcode (PIN). The encrypted payload remains unreadable until the recipient enters the correct PIN.

### 4. One-Tap AutoWake & Notification Integration
* URLs containing the `&autowake=true` parameter automatically fire the WoL magic packet 0.6 seconds after page load. This enables seamless one-tap power-on from mobile home screen shortcuts or push notifications (e.g., via Telegram bot integrations like *Dual Sleeper*).

### 5. Built-in AI Prompt Assistant
* Includes an interactive, collapsible AI prompt template designed to help non-technical users instantly query AI tools (ChatGPT, Copilot, Gemini, Claude) for their specific router configuration steps (DHCP static IP, Static ARP, Port Forwarding).

---

## 🏗️ System Workflow

```text
[ Home PC (Dual Sleeper) ]
       │ 
       ├─ Monitors idle state & GPU protection -> Auto sleep
       └─ On sleep transition: Sends Telegram notification with AutoWake URL
                                 │
                                 ▼ (Tap notification link on smartphone)
[ CloudWaker (Cloudflare Workers / Web UI) ]
       │ 
       └─ Decrypts parameters & dispatches magic packet via Depicus engine
                                 │
                                 ▼
                    [ Home Router ➔ Target PC Wakes Up ]
```

---

## ⚙️ Mandatory Infrastructure Prerequisites

To successfully wake a home computer over the Internet via WoL, the target network must fulfill:

1. **Wired Ethernet Connection** (Wi-Fi is NOT supported for WoL wake-up)
2. **Motherboard (BIOS/UEFI) WoL Enablement** ("Power On By PCI-E/LAN")
3. **OS / Network Adapter Configuration** ("Wake on Magic Packet" enabled)
4. **Router Static IP Reservation** (DHCP MAC-to-IP binding)
5. **Router Static ARP Table Entry** (Binding IP & MAC in the router's ARP cache)
6. **Router Port Forwarding / Custom Port Public Binding**

---

## 📄 License

Distributed under the MIT License.
