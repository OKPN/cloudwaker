/* ==========================================================================
   EtherWake - JavaScript Logic (localStorage & Depicus WoL Integration)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const deviceForm = document.getElementById('device-form');
    const deviceNameInput = document.getElementById('device-name');
    const macAddressInput = document.getElementById('mac-address');
    const ddnsHostInput = document.getElementById('ddns-host');
    const portNumberInput = document.getElementById('port-number');
    const saveBtn = document.getElementById('save-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editIndexInput = document.getElementById('edit-index');
    const deviceListContainer = document.getElementById('device-list');

    // State
    let devices = [];

    // Initialize
    loadDevices();
    renderDevices();
    lucide.createIcons(); // Lucideアイコン初期化

    // Submit Form (Save / Edit)
    deviceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = deviceNameInput.value.trim();
        const rawMac = macAddressInput.value.trim();
        const ddns = ddnsHostInput.value.trim();
        const port = parseInt(portNumberInput.value.trim(), 10) || 9;
        const editIndex = editIndexInput.value;

        // MACアドレスのバリデーションと整形
        const formattedMac = parseAndFormatMac(rawMac);
        if (!formattedMac) {
            showToast('無効なMACアドレスの形式です。', true);
            return;
        }

        const deviceData = { name, mac: formattedMac, ddns, port };

        if (editIndex !== "") {
            // 編集の保存
            devices[parseInt(editIndex, 10)] = deviceData;
            showToast('デバイス情報を更新しました。');
            exitEditMode();
        } else {
            // 新規登録
            devices.push(deviceData);
            showToast('新しいデバイスを登録しました。');
        }

        saveDevices();
        renderDevices();
        deviceForm.reset();
        portNumberInput.value = "9"; // デフォルト値の再セット
    });

    // Cancel Edit
    cancelEditBtn.addEventListener('click', () => {
        exitEditMode();
        deviceForm.reset();
        portNumberInput.value = "9";
    });

    // Load devices from localStorage
    function loadDevices() {
        const stored = localStorage.getItem('etherwake_devices');
        if (stored) {
            try {
                devices = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored devices', e);
                devices = [];
            }
        }
    }

    // Save devices to localStorage
    function saveDevices() {
        localStorage.setItem('etherwake_devices', JSON.stringify(devices));
    }

    // Render device list UI
    function renderDevices() {
        deviceListContainer.innerHTML = '';

        if (devices.length === 0) {
            deviceListContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="server-off" class="empty-icon"></i>
                    <p>登録されたデバイスがありません。左のフォームから追加してください。</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        devices.forEach((device, index) => {
            const item = document.createElement('div');
            item.className = 'device-item';
            item.innerHTML = `
                <div class="device-info">
                    <div class="device-title-row">
                        <span class="device-title">${escapeHtml(device.name)}</span>
                    </div>
                    <div class="device-details">
                        <span><strong style="color: var(--primary);">MAC:</strong> ${device.mac}</span>
                        <span><strong style="color: var(--accent);">HOST:</strong> ${escapeHtml(device.ddns)}:${device.port}</span>
                    </div>
                </div>
                <div class="device-actions">
                    <button class="btn btn-action btn-wake" data-index="${index}" title="起動パケットを送信">
                        <i data-lucide="power"></i>
                    </button>
                    <button class="btn btn-action btn-edit" data-index="${index}" title="編集">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn btn-action btn-delete" data-index="${index}" title="削除">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            deviceListContainer.appendChild(item);
        });

        // 描画後にアイコンを再度バインド
        lucide.createIcons();

        // アクションイベントのバインド
        bindActionEvents();
    }

    // Bind events to action buttons inside list
    function bindActionEvents() {
        // Wake button
        document.querySelectorAll('.btn-wake').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index, 10);
                wakeDevice(devices[index]);
            });
        });

        // Edit button
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index, 10);
                enterEditMode(index);
            });
        });

        // Delete button
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index, 10);
                if (confirm(`本当に「${devices[index].name}」を削除しますか？`)) {
                    devices.splice(index, 1);
                    saveDevices();
                    renderDevices();
                    showToast('デバイスを削除しました。');
                    if (editIndexInput.value === index.toString()) {
                        exitEditMode();
                        deviceForm.reset();
                        portNumberInput.value = "9";
                    }
                }
            });
        });
    }

    // Enter Edit Mode
    function enterEditMode(index) {
        const device = devices[index];
        deviceNameInput.value = device.name;
        macAddressInput.value = device.mac;
        ddnsHostInput.value = device.ddns;
        portNumberInput.value = device.port;
        editIndexInput.value = index;

        saveBtn.querySelector('span').textContent = '更新する';
        saveBtn.querySelector('i').setAttribute('data-lucide', 'check');
        cancelEditBtn.classList.remove('hidden');
        
        // フォームのあるカードにスクロール（モバイル用）
        document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth' });
        lucide.createIcons();
    }

    // Exit Edit Mode
    function exitEditMode() {
        editIndexInput.value = "";
        saveBtn.querySelector('span').textContent = '保存する';
        saveBtn.querySelector('i').setAttribute('data-lucide', 'save');
        cancelEditBtn.classList.add('hidden');
        lucide.createIcons();
    }

    // Trigger WoL request via Depicus (using a hidden iframe to send in background)
    function wakeDevice(device) {
        // Depicus用のMACアドレス整形（ハイフン区切り大文字: XX-XX-XX-XX-XX-XX）
        const depicusMac = device.mac.replace(/:/g, '-');
        
        // パラメータ：
        // m = MACアドレス
        // i = 自宅のグローバルIP または DDNSホスト
        // s = サブネットマスク (ブロードキャストのため通常 255.255.255.255)
        // p = ポート番号
        const depicusUrl = `https://www.depicus.com/wake-on-lan/woli?m=${encodeURIComponent(depicusMac)}&i=${encodeURIComponent(device.ddns)}&s=255.255.255.255&p=${device.port}`;
        
        // ユーザーに確認トーストを表示
        showToast(`「${device.name}」へWoLパケットを送信します...`);

        // 非表示の iframe を作成してリクエストをバックグラウンドで投げる
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = depicusUrl;
        document.body.appendChild(iframe);

        // 読み込み完了後に iframe を自動で削除
        iframe.onload = () => {
            setTimeout(() => {
                iframe.remove();
                showToast(`「${device.name}」へパケットを送信しました！`);
            }, 1000);
        };

        // 万が一読み込みが遅い・タイムアウトした場合の安全対策
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                iframe.remove();
                showToast(`「${device.name}」へパケットを送信しました（T/O）`);
            }
        }, 8000);
    }

    // Helper: Validate and Standardize MAC address (formats into XX:XX:XX:XX:XX:XX)
    function parseAndFormatMac(mac) {
        // 記号を排除した純粋な16進数を抽出
        const clean = mac.replace(/[^0-9A-Fa-f]/g, '');
        if (clean.length !== 12) {
            return null;
        }
        // 2桁ずつコロンで区切る
        const parts = [];
        for (let i = 0; i < 12; i += 2) {
            parts.push(clean.substr(i, 2).toUpperCase());
        }
        return parts.join(':');
    }

    // Helper: Escape HTML for security
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Helper: Show Toast Notification
    function showToast(message, isError = false) {
        // 既存のトーストがあれば削除
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        
        const iconName = isError ? 'alert-triangle' : 'info';
        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span>${escapeHtml(message)}</span>
        `;
        document.body.appendChild(toast);
        lucide.createIcons();

        // アニメーション表示用クラス追加
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // 3.5秒後に非表示にして消去
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3500);
    }
});
