/* ==========================================================================
   CloudWaker - Pure Static JavaScript Logic (localStorage & Depicus WoL)
   ========================================================================== */

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

    const closePinModalBtn = document.getElementById('close-pin-modal-btn');
    if (closePinModalBtn) closePinModalBtn.addEventListener('click', closePinModal);
    if (pinModal) {
        pinModal.addEventListener('click', (e) => {
            if (e.target === pinModal) closePinModal();
        });
    }
    if (unlockPinInput) {
        unlockPinInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') processUnlock();
        });
    }

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

    if (showRawDetailsCheckbox) {
        showRawDetailsCheckbox.addEventListener('change', toggleInputMasking);
    }

    deviceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = deviceNameInput.value.trim();
        let rawMac = macAddressInput.value.trim();
        let ddns = ddnsHostInput.value.trim();
        let portStr = portNumberInput.value.trim();
        const rawEditIndex = editIndexInput.value.trim();

        let editIdx = (!isNaN(parseInt(rawEditIndex, 10)) && rawEditIndex !== "") ? parseInt(rawEditIndex, 10) : -1;
        let targetDevice = (editIdx >= 0 && editIdx < devices.length) ? devices[editIdx] : null;

        if (rawMac.includes('•') || rawMac === "") {
            if (editingRawData && editingRawData.mac) rawMac = editingRawData.mac;
            else if (targetDevice && targetDevice.mac) rawMac = targetDevice.mac;
        }

        if (ddns.includes('•') || ddns === "") {
            if (editingRawData && editingRawData.ddns) ddns = editingRawData.ddns;
            else if (targetDevice && targetDevice.ddns) ddns = targetDevice.ddns;
        }

        let port = 9;
        if (portStr.includes('•') || portStr === "") {
            if (editingRawData && editingRawData.port) port = editingRawData.port;
            else if (targetDevice && targetDevice.port) port = targetDevice.port;
        } else {
            port = parseInt(portStr, 10) || 9;
        }

        const formattedMac = parseAndFormatMac(rawMac);
        if (!formattedMac) {
            showToast('MACアドレスを入力または表示確認してください。', true);
            return;
        }

        if (!ddns) {
            showToast('DDNS / IPアドレスを入力してください。', true);
            return;
        }

        const deviceData = { name: name || '名称未設定', mac: formattedMac, ddns, port };

        let targetIndex = -1;

        if (editIdx >= 0 && editIdx < devices.length) {
            targetIndex = editIdx;
        } else if (editingRawData) {
            targetIndex = devices.findIndex(d => d.mac === editingRawData.mac && d.ddns === editingRawData.ddns);
        }

        if (targetIndex >= 0 && targetIndex < devices.length) {
            devices[targetIndex] = deviceData;
            showToast('「' + deviceData.name + '」の端末情報を更新しました！');
            exitEditMode();
        } else {
            const matchIdx = devices.findIndex(d => d.name === deviceData.name || (d.mac === formattedMac && d.ddns === ddns));
            if (matchIdx !== -1) {
                devices[matchIdx] = deviceData;
                showToast('「' + deviceData.name + '」の端末情報を更新しました！');
            } else {
                devices.push(deviceData);
                showToast('「' + deviceData.name + '」を新規デバイスとして登録しました。');
            }
        }

        saveDevices();
        renderDevices();
        deviceForm.reset();
        portNumberInput.value = "9";
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
        if (stored) {
            try {
                devices = JSON.parse(stored);
            } catch(e) {
                devices = [];
            }
        }
    }

    function saveDevices() {
        localStorage.setItem('cloudwaker_devices', JSON.stringify(devices));
        try {
            if (window.location.search.includes('data=')) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch(e) {}
    }

    function openPinModal() {
        unlockPinInput.value = '';
        pinModal.classList.remove('hidden');
        setTimeout(() => {
            pinModal.classList.add('show');
            unlockPinInput.focus();
        }, 10);
    }

    function closePinModal() {
        pinModal.classList.remove('show');
        setTimeout(() => {
            pinModal.classList.add('hidden');
        }, 300);
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
        if (!pin) {
            showToast('PINコードを入力してください。', true);
            return;
        }
        try {
            const bytes = CryptoJS.AES.decrypt(pendingEncryptedData, pin);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedText) { showToast('PINコードが正しくありません。', true); return; }
            importPayload(JSON.parse(decryptedText));
            closePinModal();
            pendingEncryptedData = null;
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) { showToast('PINコードが正しくありません。', true); }
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
                </div>
                <div class="device-actions">
                    <button class="btn-action btn-wake" data-index="${index}" title="起動パケット送信"><i data-lucide="power"></i></button>
                    <button class="btn-action btn-share" data-index="${index}" title="共有"><i data-lucide="share-2"></i></button>
                    <button class="btn-action btn-edit" data-index="${index}" title="編集"><i data-lucide="pencil"></i></button>
                    <button class="btn-action btn-delete" data-index="${index}" title="削除"><i data-lucide="trash-2"></i></button>
                </div>
            `;
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

    let activeWakingDevices = new Set();

    function wakeDevice(device) {
        if (!device || !device.mac || !device.ddns) {
            showToast('デバイス情報が正しくありません。', true);
            return;
        }

        const deviceKey = device.mac + '_' + device.ddns;
        if (activeWakingDevices.has(deviceKey)) {
            showToast('連打防止: 連送は5秒以上空けて送信してください。', true);
            return;
        }

        activeWakingDevices.add(deviceKey);
        setTimeout(() => {
            activeWakingDevices.delete(deviceKey);
        }, 5000);

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
