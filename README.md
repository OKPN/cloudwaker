# ⚡ CloudWaker

🌐 **Live Application:** [https://okpn.github.io/cloudwaker/](https://okpn.github.io/cloudwaker/)

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222222?logo=github&logoColor=white)](https://okpn.github.io/cloudwaker/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**CloudWaker** is a modern, static, fully client-side Wake on LAN (WoL) web dashboard designed to trigger remote power-on for home computers directly from any web browser.

Built with a privacy-first philosophy, CloudWaker is **100% serverless and stateless**. It requires no backend server or database—all configurations stay securely in your browser or within encrypted self-contained URLs.

---

## 💡 Key Architectural & Privacy Features

### 1. 100% Client-Side & Pure Static Architecture
* **Zero Backend Storage:** No databases, sessions, or backend servers. The app consists purely of static HTML, CSS, and JavaScript.
* **Depicus Engine Relay:** Dispatches WoL magic packets directly from the client browser via an invisible background frame powered by the trusted [Depicus](https://www.depicus.com) WoL relay engine.

### 2. Privacy-First UI & Local AES-256 Encryption
* **Clean & Private UI:** Registered device lists conceal sensitive details (MAC address & DDNS host) to prevent shoulder surfing.
* **Client-Side Storage:** All registered devices are saved locally in the browser's `localStorage`.

### 3. Protected Share Links & QR Code Generator (6-Digit PIN)
* Generate self-contained share links (`?data=AES256(...)`) or QR codes.
* Secure share links with a custom 6-digit PIN code. The encrypted payload remains unreadable until the correct PIN is entered.

### 4. One-Tap AutoWake & Integration with Dual Sleeper
* URLs containing `autoWake` parameter automatically fire WoL magic packets upon page load.
* Enables seamless one-tap power-on from mobile home screen shortcuts or push notifications sent by PC power management apps like **[Dual Sleeper](https://github.com/OKPN/dual-sleeper)**.

### 5. Interactive AI Router Setup Assistant
* Built-in collapsible AI prompt template designed to assist users in querying AI tools (ChatGPT, Copilot, Gemini, Claude) for router-specific setup steps (Static IP, Static ARP, Port Forwarding).

---

## 🏗️ System Workflow

```text
[ Home PC (Dual Sleeper) ]
       │ 
       ├─ Monitors idle state & GPU protection -> Auto sleep
       └─ On sleep transition: Sends push notification with AutoWake URL
                                  │
                                  ▼ (Tap notification link on smartphone)
[ CloudWaker (GitHub Pages / Web UI) ]
       │ 
       └─ Decrypts parameters & dispatches magic packet via Depicus engine
                                  │
                                  ▼
                     [ Home Router ➔ Target PC Wakes Up ]
```

---

## ⚙️ Mandatory Infrastructure Prerequisites

To successfully wake a home computer over the Internet via WoL, your home network must fulfill:

1. **Wired Ethernet Connection** (Wi-Fi is NOT supported for WoL packet reception)
2. **Motherboard (BIOS/UEFI) WoL Enablement** ("Power On By PCI-E/LAN")
3. **OS / Network Adapter Configuration** ("Wake on Magic Packet" enabled)
4. **Router Static IP Reservation** (DHCP MAC-to-IP binding)
5. **Router Static ARP Table Entry** (Binding IP & MAC in the router's ARP cache)
6. **Router Port Forwarding / Custom Port Public Binding**

---

## 🚀 Deployment

Since CloudWaker is a pure static web application, it can be hosted anywhere for free:

* **GitHub Pages:** Push to the `main` or `experiment` branch and enable GitHub Pages in Repository Settings.
* **Cloudflare Pages:** Connect your GitHub repository and deploy as a static site (No build command required, output directory: `/`).
* **Local Use:** Simply download `index.html`, `style.css`, and `app.js` to your device and double-click `index.html` to open it in any browser.

---

## 📄 License

Distributed under the MIT License.
