/**
 * Translation HTML Export Plugin
 * API v3.0 - Export chat as HTML with cached translations
 * Uses risuai.searchTranslationCache / getTranslationCache API
 */

// ============================================================================
// Translation Cache Logic
// ============================================================================

function extractLongestPlainChunk(text: string): string {
    const chunks = text
        .split(/\[.*?\]|<[^>]*>|\{\{.*?\}\}/gs)
        .map(s => s.trim())
        .filter(s => s.length > 30);

    return chunks.sort((a, b) => b.length - a.length)[0] || '';
}

async function findTranslation(originalText: string): Promise<{ found: boolean; translation?: string }> {
    const exactMatch = await Risuai.getTranslationCache(originalText);
    if (exactMatch) {
        return { found: true, translation: exactMatch };
    }

    const chunk = extractLongestPlainChunk(originalText);
    if (!chunk) {
        return { found: false };
    }

    const entries = await Risuai.searchTranslationCache(chunk);

    const minLength = originalText.length * 0.5;
    const maxLength = originalText.length * 1.5;

    const matches = entries.filter(e => e.key.length >= minLength && e.key.length <= maxLength);

    if (matches.length === 0) {
        return { found: false };
    }

    if (matches.length > 1) {
        const originalLength = originalText.length;
        matches.sort((a, b) =>
            Math.abs(a.key.length - originalLength) - Math.abs(b.key.length - originalLength)
        );
    }

    return { found: true, translation: matches[0].value };
}

// ============================================================================
// Text Utilities
// ============================================================================

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function simpleMarkdown(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/&quot;(.+?)&quot;/g, '<mark class="quote2">&quot;$1&quot;</mark>')
        .replace(/\u201C(.+?)\u201D/g, '<mark class="quote2">\u201C$1\u201D</mark>')
        .replace(/\u2018(.+?)\u2019/g, '<mark class="quote1">\u2018$1\u2019</mark>')
        .replace(/\n/g, '<br>');
}

// ============================================================================
// UI Styles
// ============================================================================

const STYLES = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: #1a1a2e;
        color: #e0e0e0;
        display: flex;
        justify-content: center;
        padding: 24px;
    }
    .wrap { max-width: 600px; width: 100%; }
    h1 { font-size: 20px; margin-bottom: 20px; }
    .progress-box {
        background: #16213e;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 16px;
    }
    .progress-bar-bg {
        width: 100%;
        height: 8px;
        background: #333;
        border-radius: 4px;
        overflow: hidden;
        margin: 12px 0;
    }
    .progress-bar {
        height: 100%;
        background: #3b82f6;
        border-radius: 4px;
        transition: width 0.2s;
        width: 0%;
    }
    .status { font-size: 13px; color: #888; }
    .stats {
        display: flex;
        gap: 16px;
        margin-top: 12px;
    }
    .stat {
        background: #1a1a3e;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        flex: 1;
        text-align: center;
    }
    .stat .num { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
    .stat.found .num { color: #34d399; }
    .stat.missed .num { color: #f59e0b; }
    .btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        cursor: pointer;
        margin-right: 8px;
    }
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:disabled { background: #333; color: #666; cursor: default; }
    .btn-secondary { background: none; border: 1px solid #555; color: #e0e0e0; }
    .actions { margin-top: 16px; display: flex; gap: 8px; }
    .error { color: #f87171; padding: 20px; text-align: center; }
`;

// ============================================================================
// UI Rendering
// ============================================================================

function renderInitialUI(charName: string, totalMessages: number) {
    document.body.innerHTML = `
        <style>${STYLES}</style>
        <div class="wrap">
            <h1>Export: ${escapeHtml(charName)}</h1>
            <div class="progress-box">
                <div class="status" id="statusText">Preparing...</div>
                <div class="progress-bar-bg"><div class="progress-bar" id="progressBar"></div></div>
                <div class="status" id="progressText">0 / ${totalMessages}</div>
            </div>
            <div class="stats">
                <div class="stat found">
                    <div class="num" id="foundCount">0</div>
                    <div>Cached</div>
                </div>
                <div class="stat missed">
                    <div class="num" id="missedCount">0</div>
                    <div>No cache</div>
                </div>
            </div>
            <div class="actions">
                <button class="btn btn-primary" id="downloadBtn" disabled>Download</button>
                <button class="btn btn-secondary" id="closeBtn">Close</button>
            </div>
        </div>
    `;

    document.getElementById('closeBtn')!.addEventListener('click', async () => {
        await Risuai.hideContainer();
    });
}

function updateProgress(current: number, total: number, found: number, missed: number) {
    const pct = Math.round((current / total) * 100);
    (document.getElementById('progressBar') as HTMLElement).style.width = `${pct}%`;
    document.getElementById('progressText')!.textContent = `${current} / ${total}`;
    document.getElementById('statusText')!.textContent = `Processing messages...`;
    document.getElementById('foundCount')!.textContent = String(found);
    document.getElementById('missedCount')!.textContent = String(missed);
}

function showComplete(found: number, missed: number, filename: string, htmlContent: string) {
    document.getElementById('statusText')!.textContent = 'Done!';
    (document.getElementById('progressBar') as HTMLElement).style.width = '100%';
    document.getElementById('foundCount')!.textContent = String(found);
    document.getElementById('missedCount')!.textContent = String(missed);

    const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
    downloadBtn.disabled = false;
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    });
}

function showError(message: string) {
    document.body.innerHTML = `
        <style>${STYLES}</style>
        <div class="wrap">
            <div class="error">${escapeHtml(message)}</div>
            <div class="actions">
                <button class="btn btn-secondary" id="closeBtn">Close</button>
            </div>
        </div>
    `;
    document.getElementById('closeBtn')!.addEventListener('click', async () => {
        await Risuai.hideContainer();
    });
}

// ============================================================================
// HTML Generation
// ============================================================================

function generateExportHTML(
    charName: string,
    results: { name: string; original: string; translated?: string; found: boolean }[],
    foundCount: number
): string {
    let chatContentHTML = '';

    for (const result of results) {
        const content = result.translated || result.original;
        const displayContent = simpleMarkdown(escapeHtml(content));
        const notFoundBadge = !result.found
            ? '<span style="color: #f59e0b; font-size: 0.75rem; margin-left: 8px;">[No cache]</span>'
            : '';

        chatContentHTML += `
            <div class="chat">
                <h2>${escapeHtml(result.name)}${notFoundBadge}</h2>
                <div>${displayContent}</div>
            </div>`;
    }

    const date = new Date().toISOString().split('T')[0];
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(charName)} Chat - ${date}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            color: #e0e0e0;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
        }
        .container {
            max-width: 800px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .header {
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid #333;
            margin-bottom: 10px;
        }
        .header h1 { margin: 0; color: #fff; }
        .header p { margin: 8px 0 0 0; color: #888; font-size: 0.9rem; }
        .chat {
            background: #2a2a2a;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #333;
        }
        h2 { margin: 0 0 12px 0; font-size: 1rem; color: #60a5fa; }
        .chat div { line-height: 1.7; word-break: break-word; }
        strong { color: #fff; }
        em { color: #a5b4fc; }
        mark.quote1 { background: transparent; color: #8BE9FD; }
        mark.quote2 { background: transparent; color: #FFB86C; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(charName)}</h1>
            <p>Exported on ${date} | ${results.length} messages | Translated: ${foundCount}</p>
        </div>
        ${chatContentHTML}
    </div>
</body>
</html>`;
}

// ============================================================================
// Main Export
// ============================================================================

async function getPersonaName(): Promise<string> {
    try {
        const db = await Risuai.getDatabase();
        if (db?.personas && db?.selectedPersona) {
            const persona = db.personas.find((p: any) => p.id === db.selectedPersona);
            if (persona?.name) return persona.name;
        }
    } catch (e) {}
    return 'User';
}

async function exportChatWithTranslation() {
    // Fetch data before showing container (permission popups need to be clickable)
    let char: any;
    try {
        char = await Risuai.getCharacter();
    } catch (e) {
        await Risuai.showContainer('fullscreen');
        showError('Failed to get character data.');
        return;
    }

    if (!char?.chats?.length) {
        await Risuai.showContainer('fullscreen');
        showError('No chat found.');
        return;
    }

    const currentChat = char.chats[char.chatPage || 0];
    if (!currentChat?.message) {
        await Risuai.showContainer('fullscreen');
        showError('No messages in current chat.');
        return;
    }

    const userName = await getPersonaName();

    await Risuai.showContainer('fullscreen');
    const messages = currentChat.message;
    const totalMessages = messages.length + 1;

    renderInitialUI(char.name, totalMessages);

    const results: { name: string; original: string; translated?: string; found: boolean }[] = [];
    let foundCount = 0;
    let notFoundCount = 0;

    // 1. First Message
    const fmIndex = currentChat.fmIndex ?? -1;
    const firstMessage = fmIndex === -1
        ? char.firstMessage
        : (char.alternateGreetings?.[fmIndex] || char.firstMessage);

    const fmResult = await findTranslation(firstMessage);
    results.push({ name: char.name, original: firstMessage, translated: fmResult.translation, found: fmResult.found });
    if (fmResult.found) foundCount++; else notFoundCount++;
    updateProgress(1, totalMessages, foundCount, notFoundCount);

    // 2. Chat messages
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const name = msg.role === 'user' ? userName : char.name;

        const translationResult = await findTranslation(msg.data);
        results.push({ name, original: msg.data, translated: translationResult.translation, found: translationResult.found });

        if (translationResult.found) foundCount++; else notFoundCount++;

        if (i % 5 === 0) {
            updateProgress(i + 2, totalMessages, foundCount, notFoundCount);
        }
    }

    // 3. Generate & show download
    const date = new Date().toISOString().split('T')[0];
    const filename = `${char.name}_${date}_chat`.replace(/[<>:"/\\|?*.,]/g, '') + '.html';
    const htmlContent = generateExportHTML(char.name, results, foundCount);

    showComplete(foundCount, notFoundCount, filename, htmlContent);
}

// ============================================================================
// Plugin Initialization
// ============================================================================

(async () => {
    await Risuai.registerButton(
        {
            name: 'Export HTML (Cache)',
            icon: '📄',
            iconType: 'html',
            location: 'chat'
        },
        async () => {
            await exportChatWithTranslation();
        }
    );

    await Risuai.onUnload(async () => {
        console.log('[HTMLExport] Unloading...');
    });

    console.log('[HTMLExport] Ready!');
})();
