# ⚡ CloudWaker (Web-based Wake on LAN Client)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**CloudWaker** は、Cloudflare Workers 上で動作する完全サーバーレス・無状態（Stateless）な Wake on LAN (WoL) 操作パネルです。

信頼性の高い外部WoL中継エンジン（[Depicus](https://www.depicus.com)）を経由し、スマートフォンやPCのブラウザからワンタップで自宅のPCを遠隔起動します。

---

## 🌟 主な特徴

* 🛡️ **無状態（Stateless）アーキテクチャ**
  * サーバー側にはデータベースもストレージも一切存在しません。すべてのデータはクライアント端末（ローカルストレージ）および暗号化されたURL内にのみ保存されます。
* 🔐 **ローカルAES-256暗号化 & プライバシー保護登録**
  * 登録デバイスのMACアドレス、DDNSホスト名、ポート番号をローカル端末側でAES暗号化し、画面上では `●●:●●:●●...` と完全に伏せ字表示（マスク）できます。
* 🔒 **6桁PINコードによる共有リンク保護**
  * 暗号化URLを第三者に送る際、6桁のパスコード（PIN）をかけた保護共有が可能です。正しいPINを入力するまで復号されません。
* ⚡ **ワンタップ自動起動 (AutoWake)**
  * `&autowake=true` フラグが付いたURLをタップするだけで、ページ開画後 0.6 秒でWoLマジックパケットを中継送信します。
* 🤖 **AI質問用プロンプトテンプレート標準搭載**
  * 初心者がルーターの環境設定（IP固定・静的ARP・ポート開放等）に迷った際、自分のルーター型番を入力して各種AI（ChatGPT, Copilot, Gemini, Claude）に丸投げできるテンプレートを内蔵しています。
* 💎 **モダンな Neon Dark Glassmorphism UI**
  * モバイルファーストで軽量かつ視覚的に美しいデザインを採用。

---

## 🏗️ 全体アーキテクチャ

```text
[ Dual Sleeper (自宅PC) ]
       │ 
       ├─ PC起動中: 無操作監視・GPU保護・自動スリープ
       └─ スリープ移行時: Telegramへ「AutoWake起動リンク」を送信
                                 │
                                 ▼ (スマホで通知リンクをタップ)
[ CloudWaker (Cloudflare Workers / Web UI) ]
       │ 
       └─ 暗号化パラメータ(?data=...)を復号し、Depicus経由でWoLパケット発行
                                 │
                                 ▼
                   [ 自宅ルーター ➔ 自宅PCが遠隔復帰 ]
```

---

## 🚀 デプロイ方法

### 前提条件
* [Node.js](https://nodejs.org/) (v18以上推奨)
* [Cloudflare アカウント](https://dash.cloudflare.com/)

### 1. リポジトリのクローン
```bash
git clone https://github.com/YOUR_USERNAME/cloudwaker.git
cd cloudwaker
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. Wrangler CLIでのデプロイ
```bash
npx wrangler deploy
```

---

## ⚙️ 自宅PCへのWoL送信を成立させるための必須設定

本サービスを介して外部から自宅PCを安定起動するには、以下の設定が必要です。

1. **自宅PCの有線LAN接続 & OS(Ethernetアダプタ)でのWoL有効化** （※Wi-Fi不可）
2. **マザーボード（BIOS/UEFI）でのWoL有効化**
3. **自宅PCのローカルIPアドレスの固定** （ルーターのDHCP固定割当/MAC予約機能を使用）
4. **無料DDNSサービスの利用** ([f5.si](https://f5.si) やルーター付属DDNS)
5. **ルーターでの「静的ARP」設定** (IPとMACの組み合わせ記憶)
6. **ルーターでの「ポートフォワーディング」設定**

---

## 📄 ライセンス

[MIT License](LICENSE)
