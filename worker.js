const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="ブラウザから手軽に,美しく,リモートでPCを起動。静的サイトから直接自宅のPCへWake on LANパケットを中継送信するモダンなWebユーティリティ。">
    <title>CloudWaker - Web-based Wake on LAN</title>
    <!-- Google Fonts: Outfit & Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
    <!-- Lucide Icons CDN -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <!-- QRCode.js CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <!-- CryptoJS (AES Encryption) CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <style>
        /* ==========================================================================
           CloudWaker - CSS Design System (Neon Dark Mode / Glassmorphism)
           ========================================================================== */

        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(20, 26, 42, 0.6);
            --card-hover-bg: rgba(28, 37, 59, 0.7);
            --border-color: rgba(255, 255, 255, 0.06);
            --border-focus: rgba(139, 92, 246, 0.5);
            
            --text-primary: #f3f4f6;
            --text-secondary: #9ca3af;
            --text-muted: #6b7280;
            
            --primary: #8b5cf6;          /* Violet */
            --primary-glow: rgba(139, 92, 246, 0.3);
            --primary-hover: #7c3aed;
            
            --accent: #ec4899;           /* Pink / Magenta */
            --accent-glow: rgba(236, 72, 153, 0.3);
            
            --success: #10b981;          /* Emerald */
            --success-glow: rgba(16, 185, 129, 0.2);
            --danger: #ef4444;           /* Red */
            --danger-hover: #dc2626;

            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            --font-display: 'Outfit', var(--font-sans);
        }

        /* Base Reset & Styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow-x: hidden;
            line-height: 1.5;
        }

        /* Background Ambient Glows */
        .background-glow-1 {
            position: absolute;
            width: 600px;
            height: 600px;
            top: -200px;
            left: -200px;
            background: radial-gradient(circle, var(--primary-glow) 0%, rgba(0,0,0,0) 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(80px);
        }

        .background-glow-2 {
            position: absolute;
            width: 500px;
            height: 500px;
            bottom: -150px;
            right: -100px;
            background: radial-gradient(circle, var(--accent-glow) 0%, rgba(0,0,0,0) 70%);
            z-index: -1;
            pointer-events: none;
            filter: blur(80px);
        }

        /* Layout Container */
        .app-container {
            width: 100%;
            max-width: 1200px;
            padding: 2.5rem 1.5rem;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        /* Header */
        .app-header {
            text-align: center;
            margin-bottom: 1rem;
        }

        .logo {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
        }

        .logo-icon {
            width: 2.5rem;
            height: 2.5rem;
            color: var(--accent);
            filter: drop-shadow(0 0 8px var(--accent-glow));
        }

        .app-header h1 {
            font-family: var(--font-display);
            font-size: 2.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.05em;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        /* Main Grid Layout */
        .app-main {
            display: grid;
            grid-template-columns: 1fr 1.2fr;
            gap: 2rem;
            align-items: start;
        }

        @media (max-width: 900px) {
            .app-main {
                grid-template-columns: 1fr;
            }
        }

        /* Glassmorphism Cards */
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 24px;
            padding: 2rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.75rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
        }

        .card-header h2 {
            font-family: var(--font-display);
            font-size: 1.35rem;
            font-weight: 600;
        }

        .header-icon {
            width: 1.5rem;
            height: 1.5rem;
            color: var(--primary);
        }

        /* Form Styles */
        .device-form {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-group label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            letter-spacing: 0.02em;
        }

        .form-group-checkbox {
            margin: 0.25rem 0;
        }

        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-secondary);
            cursor: pointer;
            user-select: none;
            transition: color 0.2s ease;
        }

        .checkbox-label:hover {
            color: var(--text-primary);
        }

        .checkbox-label input {
            cursor: pointer;
            accent-color: var(--primary);
            width: 1.1rem;
            height: 1.1rem;
        }

        .input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .input-icon {
            position: absolute;
            left: 1rem;
            width: 1.1rem;
            height: 1.1rem;
            color: var(--text-muted);
            transition: color 0.3s ease;
        }

        .input-wrapper input {
            width: 100%;
            padding: 0.85rem 1rem 0.85rem 2.75rem;
            background-color: rgba(10, 15, 30, 0.5);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-family: var(--font-sans);
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }

        .input-wrapper input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
            background-color: rgba(10, 15, 30, 0.8);
        }

        .input-wrapper input:focus + .input-icon {
            color: var(--primary);
        }

        .help-text {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        /* Security Note */
        .security-note {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-top: 0.25rem;
            padding: 0.75rem 1rem;
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid rgba(16, 185, 129, 0.15);
            border-radius: 12px;
            font-size: 0.75rem;
            color: var(--success);
            line-height: 1.4;
        }

        .security-icon {
            width: 1.1rem;
            height: 1.1rem;
            color: var(--success);
            flex-shrink: 0;
            margin-top: 0.05rem;
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.9rem 1.5rem;
            border-radius: 12px;
            font-family: var(--font-display);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
            color: white;
            box-shadow: 0 4px 14px 0 var(--primary-glow);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(139, 92, 246, 0.5);
        }

        .btn-secondary {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
        }

        .btn-secondary:hover {
            background-color: var(--border-color);
            color: var(--text-primary);
        }

        .btn:active {
            transform: translateY(0);
        }

        .hidden {
            display: none !important;
        }

        /* Device List & Cards */
        .device-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-height: 480px;
            overflow-y: auto;
            padding-right: 0.25rem;
        }

        /* Custom Scrollbar */
        .device-list::-webkit-scrollbar {
            width: 6px;
        }
        .device-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .device-list::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 3px;
        }
        .device-list::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }

        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-muted);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .empty-icon {
            width: 3rem;
            height: 3rem;
            color: var(--border-color);
        }

        /* Individual Device Row Card */
        .device-item {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            transition: all 0.3s ease;
        }

        .device-item:hover {
            background: var(--card-hover-bg);
            border-color: rgba(255, 255, 255, 0.12);
            transform: translateX(4px);
        }

        .device-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            flex: 1;
        }

        .device-title-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .device-title {
            font-family: var(--font-display);
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        /* AutoWake Badge on List */
        .badge-autowake {
            background: rgba(236, 72, 153, 0.12);
            color: var(--accent);
            border: 1px solid rgba(236, 72, 153, 0.25);
            padding: 0.15rem 0.4rem;
            border-radius: 6px;
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            display: inline-flex;
            align-items: center;
            gap: 0.15rem;
            line-height: 1;
        }

        .device-details {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-family: monospace;
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
        }

        .device-actions {
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }

        /* Action Buttons inside row */
        .btn-action {
            width: 2.2rem;
            height: 2.2rem;
            padding: 0;
            border-radius: 8px;
        }

        .btn-wake {
            background: linear-gradient(135deg, var(--accent) 0%, #db2777 100%);
            color: white;
            box-shadow: 0 4px 10px 0 var(--accent-glow);
        }

        .btn-wake:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 15px 0 rgba(236, 72, 153, 0.5);
        }

        .btn-share {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
        }

        .btn-share:hover {
            background-color: var(--border-color);
            color: var(--text-primary);
            border-color: var(--text-primary);
        }

        .btn-edit {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
        }

        .btn-edit:hover {
            background-color: var(--border-color);
            color: var(--primary);
            border-color: var(--primary);
        }

        .btn-delete {
            background-color: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
        }

        .btn-delete:hover {
            background-color: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border-color: var(--danger);
        }

        /* Modal Styles (Glassmorphism & Overlay) */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(5, 7, 12, 0.8);
            backdrop-filter: blur(8px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .modal.show {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-content {
            width: 90%;
            max-width: 450px;
            position: relative;
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .modal.show .modal-content {
            transform: scale(1);
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1rem;
            margin-bottom: 1.5rem;
        }

        .modal-header h2 {
            font-family: var(--font-display);
            font-size: 1.25rem;
            margin: 0;
        }

        .btn-close {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 1.75rem;
            cursor: pointer;
            line-height: 1;
            transition: color 0.2s ease;
        }

        .btn-close:hover {
            color: var(--text-primary);
        }

        .modal-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 1.25rem;
            text-align: center;
        }

        .pin-input-group {
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }

        .pin-input-group label {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-weight: 600;
        }

        .pin-input-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(10, 15, 30, 0.8);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-primary);
            font-size: 0.95rem;
            outline: none;
            letter-spacing: 0.1em;
            transition: border-color 0.3s ease;
        }

        .pin-input-group input:focus {
            border-color: var(--primary);
        }

        .qrcode-container {
            display: flex;
            justify-content: center;
            align-items: center;
            background: white;
            padding: 1.5rem;
            border-radius: 16px;
            width: fit-content;
            margin: 0 auto 1.5rem auto;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
        }

        #qrcode img {
            display: block;
        }

        .share-url-wrapper {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }

        #share-url-input {
            flex: 1;
            padding: 0.75rem 1rem;
            background: rgba(10, 15, 30, 0.8);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 0.85rem;
            outline: none;
        }

        #copy-url-btn {
            padding: 0.75rem 1.25rem;
            font-size: 0.9rem;
        }

        /* Footer */
        .app-footer {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.8rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-top: 1rem;
        }

        .warning-text {
            color: var(--accent);
            opacity: 0.8;
        }

        /* Toast Notification */
        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: rgba(16, 185, 129, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-family: var(--font-display);
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3), 0 0 15px var(--success-glow);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 9999;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .toast.error {
            background: rgba(239, 68, 68, 0.9);
        }

        /* About & Prerequisites Cards */
        .about-card {
            background: rgba(20, 26, 42, 0.4);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.25rem 1.5rem;
            margin-bottom: 0.5rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.2);
            transition: border-color 0.3s ease;
        }
        
        .about-content {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
        }

        .about-icon {
            width: 1.5rem;
            height: 1.5rem;
            color: var(--success);
            flex-shrink: 0;
            margin-top: 0.15rem;
        }

        .about-text {
            font-size: 0.85rem;
            line-height: 1.6;
            color: var(--text-secondary);
        }

        .about-text strong {
            color: var(--text-primary);
            display: block;
            margin-bottom: 0.25rem;
            font-size: 0.95rem;
        }

        .about-text a, .prerequisites-list a {
            color: var(--primary);
            text-decoration: none;
            border-bottom: 1px dashed var(--primary);
            transition: color 0.2s ease, border-color 0.2s ease;
        }

        .about-text a:hover, .prerequisites-list a:hover {
            color: var(--accent);
            border-bottom-color: var(--accent);
        }

        .prerequisites-card {
            background: rgba(20, 26, 42, 0.4);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.5rem 2rem;
            margin-top: 1rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
        }

        .prerequisites-header {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
        }

        .prerequisites-header h3 {
            font-family: var(--font-display);
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .prerequisites-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }

        .prerequisites-list li {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
        }

        .prerequisites-list li strong {
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.35rem;
            font-weight: 600;
        }

        .prerequisites-list li strong span {
            color: var(--primary);
            font-weight: 700;
        }

        .prerequisites-list li span {
            padding-left: 1.25rem;
        }

        /* FAQ Section */
        .faq-card {
            background: rgba(20, 26, 42, 0.4);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.5rem 2rem;
            margin-top: 1rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
        }

        .faq-header {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.75rem;
            margin-bottom: 1.25rem;
        }

        .faq-header h3 {
            font-family: var(--font-display);
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .faq-list {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .faq-item {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }

        .faq-question {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--text-primary);
            display: flex;
            align-items: flex-start;
            gap: 0.4rem;
            line-height: 1.5;
        }

        .faq-question-badge {
            background: rgba(139, 92, 246, 0.2);
            color: var(--primary);
            padding: 0.1rem 0.4rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 800;
            flex-shrink: 0;
            margin-top: 0.1rem;
        }

        .faq-answer {
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.6;
            padding-left: 1.6rem;
        }

        .faq-answer strong {
            color: var(--text-primary);
        }

        /* AI Prompt Template Section */
        .ai-prompt-card {
            background: rgba(20, 26, 42, 0.4);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.25rem 1.75rem;
            margin-top: 1rem;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
        }

        .ai-prompt-details {
            cursor: pointer;
        }

        .ai-prompt-summary {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-family: var(--font-display);
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text-primary);
            list-style: none;
            user-select: none;
        }

        .ai-prompt-summary::-webkit-details-marker {
            display: none;
        }

        .ai-prompt-summary-title {
            display: flex;
            align-items: center;
            gap: 0.65rem;
        }

        .ai-prompt-content {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.6;
        }

        .prompt-box-wrapper {
            position: relative;
            margin: 0.75rem 0 1.25rem 0;
        }

        .prompt-box {
            background: rgba(10, 15, 30, 0.8);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem 1rem 1rem 1rem;
            font-family: monospace, var(--font-sans);
            font-size: 0.82rem;
            color: #e2e8f0;
            white-space: pre-wrap;
            word-break: break-word;
            line-height: 1.55;
        }

        .btn-copy-prompt {
            position: absolute;
            top: 0.6rem;
            right: 0.6rem;
            background: rgba(139, 92, 246, 0.25);
            border: 1px solid var(--primary);
            color: var(--text-primary);
            padding: 0.35rem 0.75rem;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            transition: all 0.2s ease;
            backdrop-filter: blur(4px);
        }

        .btn-copy-prompt:hover {
            background: var(--primary);
            color: white;
            box-shadow: 0 0 10px var(--primary-glow);
        }

        .ai-links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 0.65rem;
            margin-top: 0.75rem;
        }

        .ai-link-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            padding: 0.6rem 0.85rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            color: var(--text-primary);
            text-decoration: none;
            font-size: 0.8rem;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .ai-link-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--primary);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="background-glow-1"></div>
    <div class="background-glow-2"></div>

    <div class="app-container">
        <!-- ヘッダー -->
        <header class="app-header">
            <div class="logo">
                <i data-lucide="zap" class="logo-icon"></i>
                <h1>CloudWaker</h1>
            </div>
            <p class="subtitle">Cloud-triggered Wake on LAN client</p>
        </header>

        <!-- このサイトについて -->
        <section class="about-card">
            <div class="about-content">
                <i data-lucide="shield-check" class="about-icon"></i>
                <div class="about-text"><strong>🛡️ このサイトについて</strong>本サイトは、<strong>Cloudflare Workers 上に構築された完全サーバーレスの Wake on LAN (WoL) 操作パネル</strong>です。デバイスの起動リクエストは、外部WoL送信サービス（<a href="https://www.depicus.com" target="_blank" rel="noopener noreferrer">Depicus</a>）を経由して自宅へ送信されます。入力したデバイス情報や暗号化データは、すべてクライアント（ブラウザ）端末上と中継サービス間のみで処理され、サーバー側にはいかなるデータも保存・収集されません。</div>
            </div>
        </section>

        <!-- メイングリッド -->
        <main class="app-main">
            <!-- デバイス追加フォーム -->
            <section class="card form-card">
                <div class="card-header">
                    <i data-lucide="plus-circle" class="header-icon"></i>
                    <h2>デバイス登録</h2>
                </div>
                <form id="device-form" class="device-form">
                    <input type="hidden" id="edit-index" value="">
                    
                    <div class="form-group">
                        <label for="device-name">デバイス名</label>
                        <div class="input-wrapper">
                            <i data-lucide="laptop" class="input-icon"></i>
                            <input type="text" id="device-name" placeholder="例: 自宅のデスクトップPC" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="mac-address">MACアドレス</label>
                        <div class="input-wrapper">
                            <i data-lucide="cpu" class="input-icon"></i>
                            <input type="text" id="mac-address" placeholder="XX:XX:XX:XX:XX:XX" required>
                        </div>
                        <span class="help-text">16進数12桁（コロンかハイフン区切り、または区切りなし）</span>
                    </div>

                    <div class="form-group">
                        <label for="ddns-host">DDNS / IPアドレス</label>
                        <div class="input-wrapper">
                            <i data-lucide="globe" class="input-icon"></i>
                            <input type="text" id="ddns-host" placeholder="your-domain.ddns.net または IP" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="port-number">ポート番号</label>
                        <div class="input-wrapper">
                            <i data-lucide="hash" class="input-icon"></i>
                            <input type="text" id="port-number" value="9" required>
                        </div>
                    </div>

                    <div class="form-group-checkbox">
                        <label class="checkbox-label">
                            <input type="checkbox" id="show-raw-details-checkbox">
                            <span>登録情報を表示する（一時表示）</span>
                        </label>
                    </div>

                    <button type="submit" id="save-btn" class="btn btn-primary">
                        <i data-lucide="save"></i>
                        <span>保存する</span>
                    </button>
                    <button type="button" id="cancel-edit-btn" class="btn btn-secondary hidden">
                        <span>キャンセル</span>
                    </button>

                    <!-- セキュリティ注記 -->
                    <div class="security-note">
                        <i data-lucide="shield-check" class="security-icon"></i>
                        <span>入力されたデバイス情報はサーバーに送信されず、お使いのブラウザ（ローカル）にのみ安全に保存されます。</span>
                    </div>
                </form>
            </section>

            <!-- デバイス一覧 -->
            <section class="device-list-card card">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="list" class="header-icon"></i>
                        <h2>登録済みデバイス</h2>
                    </div>
                    <div style="display: flex; gap: 0.4rem; align-items: center;">
                        <button id="add-new-device-btn" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.3rem;">
                            <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                            <span>新規追加</span>
                        </button>
                        <button id="batch-share-btn" class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.3rem;">
                            <i data-lucide="share-2" style="width: 14px; height: 14px;"></i>
                            <span>選択共有</span>
                        </button>
                    </div>
                </div>
                <div id="device-list" class="device-list">
                    <!-- JavaScriptでデバイスカードを挿入 -->
                    <div class="empty-state">
                        <i data-lucide="server-off" class="empty-icon"></i>
                        <p>登録されたデバイスがありません。左のフォームから追加してください。</p>
                    </div>
                </div>
            </section>
        </main>

        <!-- 外部バックアップ送信サイト案内カード -->
        <section class="about-card" style="border-left-color: #38bdf8; margin-bottom: 1.5rem;">
            <div class="about-content">
                <i data-lucide="external-link" class="about-icon" style="color: #38bdf8;"></i>
                <div class="about-text">
                    <strong>🔗 外部バックアップWoL送信サイトのご案内</strong><br>
                    万が一本サイトやDepicusの障害で起動パケットが届かない場合は、以下の外部WoL中継ツールサイトへ直接アクセスし、MACアドレス・IP（DDNS）・ポート番号を入力して手動送信をお試しください。<br>
                    👉 <a href="https://wake-on-lan.samuraj-cz.com/" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; font-weight: 600; text-decoration: underline;">SAMURAJ-cz Wake On LAN ツール（外部サイト）</a>
                </div>
            </div>
        </section>

        <!-- 必須設定（前提条件） -->
        <section class="prerequisites-card">
            <div class="prerequisites-header">
                <i data-lucide="settings" class="header-icon"></i>
                <h3>⚙️ 自宅PCへのWoL送信を成立させるための必須設定</h3>
            </div>
            <ul class="prerequisites-list">
                <li>
                    <strong><span>①</span> 自宅PCの有線LAN接続 & OS(Ethernetアダプタ)でのWoL有効化</strong><span>PCをLANケーブルで直接ルーターに接続し、OSのデバイスマネージャー（Ethernetアダプタの詳細設定）から「Wake on Magic Packet」や「Wake on LAN」を有効にします。<span style="color: var(--danger); font-weight: 600; display: block; margin-top: 0.25rem;">※Wi-Fi（無線LAN）接続では本システムによるWoL起動は行えません。必ず有線LANケーブルでルーターと接続してください。</span></span>
                </li>
                <li>
                    <strong><span>②</span> マザーボード（BIOS/UEFI）でのWoL有効化</strong><span>PC起動時にBIOS/UEFI画面に入り、「Power On By PCI-E/LAN」や「Wake on LAN」などの遠隔起動設定を有効にします。</span>
                </li>
                <li>
                    <strong><span>③</span> 自宅PCのローカルIPアドレスの固定</strong><span>ルーターのDHCP固定割当機能などを使い、対象PCのプライベートIPアドレスを常に一定にします。</span>
                </li>
                <li>
                    <strong><span>④</span> 無料DDNSサービスの利用</strong><span>自宅のグローバルIPアドレスの変動に対応するため、ルーター付属のDDNS機能や、<a href="https://f5.si" target="_blank" rel="noopener noreferrer">f5.si</a> などの無料DDNSサービスを利用して固定のホスト名を設定します。</span>
                </li>
                <li>
                    <strong><span>⑤</span> ルーターでの「静的ARP」設定</strong><span>PCがスリープするとルーターの宛先対応表（ARPキャッシュ）が消えてパケットが届かなくなります。これを防ぐため、IPアドレスとMACアドレスの組み合わせをルーターに強固に記憶させます。<span style="color: var(--danger); font-weight: 600; display: block; margin-top: 0.25rem;">※一部の市販ルーター（特に国内メーカーのエントリーモデル等）にはこの設定がない機種もあり、その場合はスリープ後しばらく（数分〜数十分）経過すると外部からの起動ができなくなるため、本サービスを介した安定した運用が難しくなります。</span></span>
                </li>
                <li>
                    <strong><span>⑥</span> ポートフォワーディングの設定</strong><span>外部から届いた起動信号を対象PCへ転送します。セキュリティ確保のため、外部に公開するポートは一般的なWoLポート（9など）ではなく、任意のカスタムポート（例：通常使用されないランダムな高位ポート番号）に変更して設定することを推奨します。</span>
                </li>
            </ul>
        </section>

        <!-- AI質問用プロンプトテンプレート（折りたたみ式） -->
        <section class="ai-prompt-card">
            <details class="ai-prompt-details">
                <summary class="ai-prompt-summary">
                    <div class="ai-prompt-summary-title">
                        <i data-lucide="bot" class="header-icon" style="color: var(--primary);"></i>
                        <span>🤖 ルーター設定に困ったら？：AI質問用プロンプトテンプレート</span>
                    </div>
                    <i data-lucide="chevron-down" style="width: 1.2rem; height: 1.2rem; color: var(--text-secondary);"></i>
                </summary>
                <div class="ai-prompt-content">
                    <p>お使いのルーターの型番や設定項目がよく分からない場合は、以下のプロンプト（質問文）をコピーし、お好みのAIチャット（ChatGPTやGeminiなど）に貼り付けて質問してみてください。お使いの環境に合わせた手順をAIが教えてくれます。</p>
                    
                    <div class="prompt-box-wrapper">
                        <button id="copy-prompt-btn" class="btn-copy-prompt" type="button">
                            <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
                            <span>テンプレートをコピー</span>
                        </button>
                        <div id="prompt-text" class="prompt-box">私は「Depicus」などのWebサービスを利用して、外部から自宅LAN内のPCへWake on LAN (WoL) パケットを送信し遠隔起動させたいと考えています。
そのためには以下の6つの設定が必要なようです。

【必須設定一覧】
1. 自宅PCの有線LAN接続 & OS(Ethernetアダプタ)でのWoL有効化
2. マザーボード(BIOS/UEFI)でのWoL有効化
3. 自宅PCのローカルIPアドレスの固定 (ルーターのDHCP固定割当/MAC予約機能を使用)
4. 無料DDNSサービスの利用 (f5.si やルーター付属DDNS)
5. ルーターでの「静的ARP」設定 (IPとMACの組み合わせ記憶)
6. ルーターでの「ポートフォワーディング」設定 (セキュリティのためにカスタムポートを利用する方法含む)

私のルーターの型番は「【ここにルーターの型番を入力 例: WSR-3200AX4S / WRC-X3000GS など】」で、PCのOSは「【Windows 11 / 10 など】」、PC/マザーボード型番は「【型番/メーカー名など】」です。

特に「IPアドレスの固定」はPC側ではなくルーター側のDHCP固定割当（MACアドレスとIPの予約）機能を使って設定したいと考えています。
上記の設定を成立させるために、具体的になにをどのような順番で設定すれば良いか、初心者にも分かりやすく丁寧に教えてください。</div>
                    </div>

                    <strong style="color: var(--text-primary); font-size: 0.85rem; display: block; margin-top: 1rem;">🔗 主要AIサービス（クリックしてすぐに質問できます）</strong>
                    <div class="ai-links-grid">
                        <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" class="ai-link-btn">
                            <span>🟢 ChatGPT</span>
                        </a>
                        <a href="https://copilot.microsoft.com" target="_blank" rel="noopener noreferrer" class="ai-link-btn">
                            <span>🔵 Copilot</span>
                        </a>
                        <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" class="ai-link-btn">
                            <span>🔴 Gemini</span>
                        </a>
                        <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" class="ai-link-btn">
                            <span>🟣 Claude</span>
                        </a>
                    </div>
                </div>
            </details>
        </section>

        <!-- よくある質問 (Q&A) -->
        <section class="faq-card">
            <div class="faq-header">
                <i data-lucide="help-circle" class="header-icon"></i>
                <h3>❓ Q & A</h3>
            </div>
            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">
                        <span class="faq-question-badge">Q1</span>
                        <span>使ってみたいのですが、自分の環境で動作するか分かりません。最低限どこを確認すべきですか？</span>
                    </div>
                    <div class="faq-answer">
                        <strong>A. ハードウェア（機器・環境）面での必須条件は「①有線LAN接続」と「②ルーターの静的ARP機能」の2点のみです。</strong><br>
                        この2点さえクリアできていれば、残りの設定（IP固定やポートフォワーディングなど）は手順通りに進めていくことでほぼ確実に接続・遠隔起動が可能です。まずは「PCがLANケーブルでルーターに繋がれているか」と「お使いのルーターに静的ARP（IPとMACの固定記憶）機能があるか」の2点をご確認ください。
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span class="faq-question-badge">Q2</span>
                        <span>リンクアクセス時の自動起動（AutoWake）はスマホからでも使えますか？</span>
                    </div>
                    <div class="faq-answer">
                        <strong>A. はい、問題なく使えます。</strong><br>
                        スマホのホーム画面に自動起動用URLのショートカット（Webアイコン）を配置しておけば、アプリのように「タップするだけで自宅PCを即座に遠隔起動」することができます。
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span class="faq-question-badge">Q3</span>
                        <span>端末を登録した状態でこのサイトのURL（トップページ）を誰かに共有した場合、登録した端末情報も相手に見られてしまいますか？</span>
                    </div>
                    <div class="faq-answer">
                        <strong>A. いいえ、共有されません。</strong><br>
                        本サイトのトップページURL自体には、あなたが登録した端末情報は一切含まれていません。登録データはお使いのブラウザ（ローカルストレージ）内にのみ保存されるため、サイトのURLをそのまま誰かに教えても、あなたの登録端末が相手に見られることはありません。
                    </div>
                </div>

                 <div class="faq-item">
                    <div class="faq-question">
                        <span class="faq-question-badge">Q4</span>
                        <span>「共有」ボタンから発行した「共有URL」には、端末の情報が含まれますか？</span>
                    </div>
                    <div class="faq-answer">
                        <strong>A. はい、含まれます。そのため基本的には他人に共有しないことをお勧めします。</strong><br>
                        共有URLには、MACアドレスや接続先などのパラメータが暗号化された状態で埋め込まれています。URLを知っていれば誰でも起動信号を送信できる状態になるため、基本的には共有URLを第三者に教えないでください。やむを得ず共有する場合は、必ず手動ロックPIN（最大6桁）を設定するなど細心の注意を払ってください。
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span class="faq-question-badge">Q5</span>
                        <span>中継送信で利用している「Depicus」とはどういうサイトですか？</span>
                    </div>
                    <div class="faq-answer">
                        <strong>A. WebからWoLパケットを発信してくれる老舗の外部中継サービスです。</strong><br>
                        Depicus（<a href="https://www.depicus.com" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary);">www.depicus.com</a>）は、Web経由で指定したIP・MACアドレスへWake on LAN用パケットを中継発信してくれる歴史のある外部サービスです。本サイトはこの中継機能を利用してPCを遠隔起動しています。外部中継サービスを利用することに懸念や不安がある場合は、大変恐れ入りますが本サイトのご利用をお控えください。
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <span class="faq-question-badge">Q6</span>
                        <span>本サイトやDepicusが障害等で起動しない場合、他の代替手段はありますか？</span>
                    </div>
                    <div class="faq-answer">
                        <strong>A. 外部のバックアップWoL送信サイトから手動で起動リクエストを送信できます。</strong><br>
                        万が一Depicus側の障害やタイムアウトで本サイトから起動できない場合は、以下の実在する外部WoL中継ツールサイトへアクセスし、MACアドレス・IP（DDNS）・ポート番号を手動入力して送信をお試しください。<br>
                        ・<a href="https://wake-on-lan.samuraj-cz.com/" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: underline;">SAMURAJ-cz Wake On LAN ツール（外部サイト）</a>
                    </div>
                </div>
            </div>
        </section>

        <!-- フッター -->
        <footer class="app-footer">
            <p>&copy; 2026 CloudWaker. Power-controlled via Depicus WoL Engine.</p>
            <p style="margin-top: 0.5rem;"><a href="https://github.com/OKPN/cloudwaker" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary); text-decoration: none; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.35rem; transition: color 0.2s ease;"><i data-lucide="github" style="width: 14px; height: 14px;"></i> GitHub Repository</a></p>
        </footer>
    </div>

    <!-- 共有モーダル -->
    <div id="share-modal" class="modal hidden">
        <div class="modal-content card">
            <div class="modal-header">
<i data-lucide="share-2" class="header-icon"></i>
                <h2>デバイス設定の共有</h2>
                <button id="close-modal-btn" class="btn-close">&times;</button>
            </div>
            <div class="modal-body">
                <div id="share-device-selector" style="margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.4rem; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 8px;"></div>
                <div class="pin-input-group">
                    <label for="share-pin-input">個別の手動ロックPIN（最大6桁）:</label>
                    <input type="password" id="share-pin-input" maxlength="6" placeholder="空欄で自動暗号化">
                </div>
                <div style="margin: 0.5rem 0;">
                    <label class="checkbox-label" style="font-size: 0.85rem;">
                        <input type="checkbox" id="share-autowake-checkbox">
                        <span>インポート時に自動起動する</span>
                    </label>
                </div>
                <div class="qrcode-container">
                    <div id="qrcode"></div>
                </div>
                <div class="share-url-wrapper">
                    <input type="text" id="share-url-input" readonly>
                    <button id="copy-url-btn" class="btn btn-primary">
                        <i data-lucide="copy"></i>
                        <span>コピー</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- PIN解除（復号）モーダル -->
    <div id="pin-modal" class="modal hidden">
        <div class="modal-content card text-center">
            <div class="modal-header">
                <i data-lucide="lock" class="header-icon"></i>
                <h2>保護された共有リンク</h2>
            </div>
            <div class="modal-body" style="text-align: center;">
                <p class="modal-desc">この設定は手動PINで保護されています。送信者が設定したPINコードを入力してください。</p>
                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <input type="password" id="unlock-pin-input" placeholder="例: 114514" maxlength="6" style="text-align: center; font-size: 1.25rem; letter-spacing: 0.2em; padding: 0.75rem; background: rgba(10, 15, 30, 0.8); border: 1px solid var(--border-color); border-radius: 12px; color: white; width: 100%;">
                </div>
                <button id="unlock-btn" class="btn btn-primary" style="width: 100%;">
                    <i data-lucide="key"></i>
                    <span>復号して登録する</span>
                </button>
            </div>
        </div>
    </div>

    <!-- JavaScript の定義 -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const SYSTEM_SECRET_KEY = 'EtherWake_Default_Secret_2026';
            const deviceForm = document.getElementById('device-form');
            const deviceNameInput = document.getElementById('device-name');
            const macAddressInput = document.getElementById('mac-address');
            const ddnsHostInput = document.getElementById('ddns-host');
            const portNumberInput = document.getElementById('port-number');
            const showRawDetailsCheckbox = document.getElementById('show-raw-details-checkbox');
            const saveBtn = document.getElementById('save-btn');
            const cancelEditBtn = document.getElementById('cancel-edit-btn');
            const editIndexInput = document.getElementById('edit-index');
            const deviceListContainer = document.getElementById('device-list');
            const batchShareBtn = document.getElementById('batch-share-btn');

            const shareModal = document.getElementById('share-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const shareUrlInput = document.getElementById('share-url-input');
            const copyUrlBtn = document.getElementById('copy-url-btn');
            const qrcodeDiv = document.getElementById('qrcode');
            const sharePinInput = document.getElementById('share-pin-input');
            const shareAutoWakeCheckbox = document.getElementById('share-autowake-checkbox');
            const shareDeviceSelector = document.getElementById('share-device-selector');

            const pinModal = document.getElementById('pin-modal');
            const unlockPinInput = document.getElementById('unlock-pin-input');
            const unlockBtn = document.getElementById('unlock-btn');

            let devices = [];
            let selectedShareIndices = [];
            let pendingEncryptedData = null;
            let editingRawData = null;

            loadDevices();
            checkImport();
            renderDevices();
            toggleInputMasking();
            lucide.createIcons();

            const addNewDeviceBtn = document.getElementById('add-new-device-btn');

            function switchToNewDeviceMode() {
                exitEditMode();
                deviceNameInput.value = "";
                macAddressInput.value = "";
                ddnsHostInput.value = "";
                portNumberInput.value = "9";
                if (showRawDetailsCheckbox) showRawDetailsCheckbox.checked = false;
                showToast('新規登録フォームを開きました。');
                document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    deviceNameInput.focus();
                }, 100);
            }

            if (addNewDeviceBtn) addNewDeviceBtn.addEventListener('click', switchToNewDeviceMode);

            if (batchShareBtn) {
                batchShareBtn.addEventListener('click', () => {
                    openShareModal(null);
                });
            }

            closeModalBtn.addEventListener('click', closeShareModal);
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) closeShareModal();
            });

            sharePinInput.addEventListener('input', () => {
                updateShareUrl();
            });

            if (shareAutoWakeCheckbox) {
                shareAutoWakeCheckbox.addEventListener('change', () => {
                    updateShareUrl();
                });
            }

            copyUrlBtn.addEventListener('click', () => {
                shareUrlInput.select();
                try {
                    document.execCommand('copy');
                    showToast('共有URLをコピーしました！');
                } catch (err) {
                    showToast('コピー失敗', true);
                }
            });

            unlockBtn.addEventListener('click', () => {
                processUnlock();
            });

            const copyPromptBtn = document.getElementById('copy-prompt-btn');
            const promptText = document.getElementById('prompt-text');

            if (copyPromptBtn && promptText) {
                copyPromptBtn.addEventListener('click', () => {
                    const text = promptText.innerText || promptText.textContent;
                    if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(text).then(() => {
                            showToast('プロンプトテンプレートをコピーしました！');
                        }).catch(() => {
                            fallbackCopyText(text);
                        });
                    } else {
                        fallbackCopyText(text);
                    }
                });
            }

            function fallbackCopyText(text) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast('プロンプトテンプレートをコピーしました！');
                } catch (err) {
                    showToast('コピーに失敗しました。', true);
                }
                document.body.removeChild(textarea);
            }

            function toggleInputMasking() {
                const isShow = showRawDetailsCheckbox ? showRawDetailsCheckbox.checked : false;
                if (isShow) {
                    if (editingRawData) {
                        macAddressInput.value = editingRawData.mac;
                        ddnsHostInput.value = editingRawData.ddns;
                        portNumberInput.value = editingRawData.port;
                    }
                } else {
                    if (editingRawData) {
                        macAddressInput.value = "••••••••••••";
                        ddnsHostInput.value = "••••••••••••";
                        portNumberInput.value = "••••";
                    }
                }
            }

            function checkNameChangeUI() {
                const editIndex = editIndexInput.value;
                if (editIndex !== "") {
                    const originalDevice = devices[parseInt(editIndex, 10)];
                    const currentName = deviceNameInput.value.trim();
                    if (originalDevice && originalDevice.name !== currentName) {
                        saveBtn.querySelector('span').textContent = '保存する';
                        saveBtn.querySelector('i').setAttribute('data-lucide', 'save');
                    } else {
                        saveBtn.querySelector('span').textContent = '更新する';
                        saveBtn.querySelector('i').setAttribute('data-lucide', 'check');
                    }
                    lucide.createIcons();
                }
            }

            deviceNameInput.addEventListener('input', checkNameChangeUI);

            if (showRawDetailsCheckbox) {
                showRawDetailsCheckbox.addEventListener('change', toggleInputMasking);
            }

            deviceForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = deviceNameInput.value.trim();
                let rawMac = macAddressInput.value.trim();
                let ddns = ddnsHostInput.value.trim();
                let portStr = portNumberInput.value.trim();
                const editIndex = editIndexInput.value;

                if (editingRawData && rawMac.includes('•')) {
                    rawMac = editingRawData.mac;
                }
                if (editingRawData && ddns.includes('•')) {
                    ddns = editingRawData.ddns;
                }
                let port = (editingRawData && portStr.includes('•')) ? editingRawData.port : (parseInt(portStr, 10) || 9);

                const formattedMac = parseAndFormatMac(rawMac);
                if (!formattedMac) {
                    showToast('無効なMACアドレスの形式です。', true);
                    return;
                }

                const deviceData = { name, mac: formattedMac, ddns, port };

                if (editIndex !== "") {
                    const originalDevice = devices[parseInt(editIndex, 10)];
                    if (originalDevice && originalDevice.name === name) {
                        devices[parseInt(editIndex, 10)] = deviceData;
                        showToast('デバイス情報を更新しました。');
                    } else {
                        devices.push(deviceData);
                        showToast('「' + name + '」を新しいデバイスとして追加登録しました！');
                    }
                    exitEditMode();
                } else {
                    devices.push(deviceData);
                    showToast('新しいデバイスを登録しました。');
                }

                saveDevices();
                renderDevices();
                deviceForm.reset();
                portNumberInput.value = "9";
                if (showRawDetailsCheckbox) showRawDetailsCheckbox.checked = false;
                editingRawData = null;
                toggleInputMasking();
            });

            cancelEditBtn.addEventListener('click', () => {
                exitEditMode();
                deviceForm.reset();
                portNumberInput.value = "9";
                if (showRawDetailsCheckbox) showRawDetailsCheckbox.checked = false;
                editingRawData = null;
            });

            function loadDevices() {
                let stored = localStorage.getItem('cloudwaker_devices');
                if (stored) devices = JSON.parse(stored);
            }

            function saveDevices() {
                localStorage.setItem('cloudwaker_devices', JSON.stringify(devices));
            }

            function checkImport() {
                const params = new URLSearchParams(window.location.search);
                const encryptedData = params.get('data');
                const isProtected = params.get('protected') === 'true';

                if (encryptedData) {
                    if (!isProtected) {
                        try {
                            const bytes = CryptoJS.AES.decrypt(encryptedData, SYSTEM_SECRET_KEY);
                            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
                            if (decryptedText) {
                                importPayload(JSON.parse(decryptedText));
                                window.history.replaceState({}, document.title, window.location.pathname);
                                return;
                            }
                        } catch (e) { console.log('Decrypt failed', e); }
                    }
                    pendingEncryptedData = encryptedData;
                    openPinModal();
                }
            }

            function processUnlock() {
                const pin = unlockPinInput.value.trim();
                if (!pin) return;
                try {
                    const bytes = CryptoJS.AES.decrypt(pendingEncryptedData, pin);
                    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
                    if (!decryptedText) { showToast('PIN間違い', true); return; }
                    importPayload(JSON.parse(decryptedText));
                    closePinModal();
                    pendingEncryptedData = null;
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (e) { showToast('PIN間違い', true); }
            }

            function importPayload(payload) {
                let importedList = [];
                let shouldAutoWake = false;

                if (Array.isArray(payload)) {
                    importedList = payload;
                } else if (payload && Array.isArray(payload.devices)) {
                    importedList = payload.devices;
                    shouldAutoWake = !!payload.autoWake;
                }

                importedList.forEach(dev => {
                    let idx = devices.findIndex(d => d.mac === dev.mac && d.ddns === dev.ddns);
                    if (idx === -1) devices.push(dev);
                    else devices[idx] = dev;
                });

                saveDevices();
                renderDevices();
                if (shouldAutoWake) {
                    showToast('順次起動パケットを送信中...');
                    importedList.forEach((dev, i) => setTimeout(() => wakeDevice(dev), i * 1200));
                } else {
                    showToast('インポートしました！');
                }
            }

            function renderDevices() {
                deviceListContainer.innerHTML = '';
                devices.forEach((device, index) => {
                    const item = document.createElement('div');
                    item.className = 'device-item';
                    item.innerHTML = 
                        '<div class="device-info">' +
                            '<div class="device-title-row">' +
                                '<span class="device-title">' + escapeHtml(device.name) + '</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="device-actions">' +
                            '<button class="btn-action btn-wake" data-index="' + index + '" title="起動パケット送信"><i data-lucide="power"></i></button>' +
                            '<button class="btn-action btn-share" data-index="' + index + '" title="共有"><i data-lucide="share-2"></i></button>' +
                            '<button class="btn-action btn-edit" data-index="' + index + '" title="編集"><i data-lucide="pencil"></i></button>' +
                            '<button class="btn-action btn-delete" data-index="' + index + '" title="削除"><i data-lucide="trash-2"></i></button>' +
                        '</div>';
                    deviceListContainer.appendChild(item);
                });
                lucide.createIcons();
                bindActionEvents();
            }

            function bindActionEvents() {
                document.querySelectorAll('.btn-wake').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.currentTarget.dataset.index, 10);
                        wakeDevice(devices[index]);
                    });
                });

                document.querySelectorAll('.btn-share').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.currentTarget.dataset.index, 10);
                        openShareModal(index);
                    });
                });

                document.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.currentTarget.dataset.index, 10);
                        enterEditMode(index);
                    });
                });

                document.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.currentTarget.dataset.index, 10);
                        if (confirm('本当に「' + devices[index].name + '」を削除しますか？')) {
                            devices.splice(index, 1);
                            saveDevices();
                            renderDevices();
                            showToast('デバイスを削除しました。');
                            if (editIndexInput.value === index.toString()) {
                                exitEditMode();
                                deviceForm.reset();
                                portNumberInput.value = "9";
                                autoWakeCheckbox.checked = false;
                            }
                        }
                    });
                });
            }

            function enterEditMode(index) {
                const device = devices[index];
                deviceNameInput.value = device.name;
                
                editingRawData = {
                    mac: device.mac,
                    ddns: device.ddns,
                    port: device.port
                };

                if (showRawDetailsCheckbox) {
                    showRawDetailsCheckbox.checked = false;
                }

                macAddressInput.value = "••••••••••••";
                ddnsHostInput.value = "••••••••••••";
                portNumberInput.value = "••••";

                editIndexInput.value = index;

                saveBtn.querySelector('span').textContent = '更新する';
                saveBtn.querySelector('i').setAttribute('data-lucide', 'check');
                cancelEditBtn.classList.remove('hidden');
                
                document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
                lucide.createIcons();
            }

            function exitEditMode() {
                editingRawData = null;
                editIndexInput.value = "";
                deviceNameInput.value = "";
                macAddressInput.value = "";
                ddnsHostInput.value = "";
                portNumberInput.value = "9";
                saveBtn.querySelector('span').textContent = '保存する';
                saveBtn.querySelector('i').setAttribute('data-lucide', 'save');
                cancelEditBtn.classList.add('hidden');
                if (showRawDetailsCheckbox) {
                    showRawDetailsCheckbox.checked = false;
                }
                lucide.createIcons();
            }

            function wakeDevice(device) {
                if (!device || !device.mac || !device.ddns) {
                    showToast('デバイス情報が正しくありません。', true);
                    return;
                }

                const targetMac = device.mac;
                const targetDdns = device.ddns;
                const targetPort = device.port || 9;

                const depicusMac = targetMac.replace(/:/g, '-');
                const depicusUrl = 'https://www.depicus.com/wake-on-lan/woli?m=' + encodeURIComponent(depicusMac) + '&i=' + encodeURIComponent(targetDdns) + '&s=255.255.255.255&p=' + targetPort;
                
                showToast('「' + device.name + '」へWoLパケットを送信中...');

                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.src = depicusUrl;
                document.body.appendChild(iframe);

                iframe.onload = () => {
                    setTimeout(() => {
                        if (document.body.contains(iframe)) iframe.remove();
                        showToast('「' + device.name + '」へパケットを送信しました！');
                    }, 1000);
                };

                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        iframe.remove();
                        showToast('タイムアウトにより「' + device.name + '」へパケットを送信できませんでした。', true);
                    }
                }, 8000);
            }

            function openShareModal(targetIndex = null) {
                if (devices.length === 0) {
                    showToast('共有できるデバイスがありません。', true);
                    return;
                }

                if (targetIndex !== null && targetIndex !== undefined) {
                    selectedShareIndices = [targetIndex];
                } else {
                    selectedShareIndices = devices.map((_, i) => i);
                }

                renderShareDeviceSelector();

                sharePinInput.value = '';
                if (shareAutoWakeCheckbox) shareAutoWakeCheckbox.checked = false;

                updateShareUrl();

                shareModal.classList.remove('hidden');
                setTimeout(() => {
                    shareModal.classList.add('show');
                }, 10);
                lucide.createIcons();
            }

            function renderShareDeviceSelector() {
                if (!shareDeviceSelector) return;
                shareDeviceSelector.innerHTML = '';

                devices.forEach((device, index) => {
                    const isChecked = selectedShareIndices.includes(index);
                    const label = document.createElement('label');
                    label.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; cursor: pointer; color: #e2e8f0;';
                    label.innerHTML = 
                        '<input type="checkbox" class="share-device-checkbox" data-index="' + index + '" ' + (isChecked ? 'checked' : '') + '>' +
                        '<span>' + escapeHtml(device.name) + '</span>';
                    shareDeviceSelector.appendChild(label);
                });

                shareDeviceSelector.querySelectorAll('.share-device-checkbox').forEach(cb => {
                    cb.addEventListener('change', (e) => {
                        const idx = parseInt(e.target.dataset.index, 10);
                        if (e.target.checked) {
                            if (!selectedShareIndices.includes(idx)) selectedShareIndices.push(idx);
                        } else {
                            selectedShareIndices = selectedShareIndices.filter(i => i !== idx);
                        }
                        updateShareUrl();
                    });
                });
            }

            function updateShareUrl() {
                const baseUrl = window.location.origin + window.location.pathname;
                const pin = sharePinInput.value.trim();
                const autoWake = shareAutoWakeCheckbox ? shareAutoWakeCheckbox.checked : false;

                const exportDevices = selectedShareIndices.map(i => devices[i]).filter(Boolean);

                if (exportDevices.length === 0) {
                    shareUrlInput.value = '端末が選択されていません';
                    qrcodeDiv.innerHTML = '';
                    return;
                }

                const payload = {
                    devices: exportDevices,
                    autoWake: autoWake
                };

                const jsonStr = JSON.stringify(payload);
                let shareUrl = '';

                if (pin) {
                    const encrypted = CryptoJS.AES.encrypt(jsonStr, pin).toString();
                    shareUrl = baseUrl + '?data=' + encodeURIComponent(encrypted) + '&protected=true';
                } else {
                    const encrypted = CryptoJS.AES.encrypt(jsonStr, SYSTEM_SECRET_KEY).toString();
                    shareUrl = baseUrl + '?data=' + encodeURIComponent(encrypted);
                }

                shareUrlInput.value = shareUrl;

                qrcodeDiv.innerHTML = '';
                new QRCode(qrcodeDiv, {
                    text: shareUrl,
                    width: 180,
                    height: 180,
                    colorDark : "#0b0f19",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.M
                });
            }

            function closeShareModal() {
                shareModal.classList.remove('show');
                setTimeout(() => {
                    shareModal.classList.add('hidden');
                    currentShareDevice = null;
                }, 300);
            }

            function parseAndFormatMac(mac) {
                const clean = mac.replace(/[^0-9A-Fa-f]/g, '');
                if (clean.length !== 12) {
                    return null;
                }
                const parts = [];
                for (let i = 0; i < 12; i += 2) {
                    parts.push(clean.substr(i, 2).toUpperCase());
                }
                return parts.join(':');
            }

            function escapeHtml(str) {
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            function showToast(message, isError = false) {
                const existingToast = document.querySelector('.toast');
                if (existingToast) {
                    existingToast.remove();
                }

                const toast = document.createElement('div');
                toast.className = 'toast ' + (isError ? 'error' : '');
                
                const iconName = isError ? 'alert-triangle' : 'info';
                toast.innerHTML = 
                    '<i data-lucide="' + iconName + '"></i>' +
                    '<span>' + escapeHtml(message) + '</span>';
                document.body.appendChild(toast);
                lucide.createIcons();

                setTimeout(() => {
                    toast.classList.add('show');
                }, 10);

                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 400);
                }, 3500);
            }
        });
    </script>
</body>
</html>`;

export default {
    async fetch(request, env, ctx) {
        return new Response(htmlContent, {
            headers: {
                "content-type": "text/html;charset=UTF-8",
                "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
                "pragma": "no-cache",
                "x-robots-tag": "noindex"
            },
        });
    },
};
