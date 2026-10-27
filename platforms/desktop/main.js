/* واحة الرياضيات على ويندوز: نافذة واحدة تفتح صفحة التطبيق من القرص (app/index.html، ناتج البناء نفسه)، بلا خادم ولا إنترنت.
   البيانات تُحفظ على هذا الجهاز وحده (مجلد التطبيق في AppData). */
const { app, BrowserWindow, Menu, screen, session } = require('electron');
const path = require('path');

if (!app.requestSingleInstanceLock()) { app.quit(); }   // نافذة واحدة: نافذتان تكتبان التقدّم نفسه
app.setAppUserModelId('com.waha.math');

let win = null;
function createWindow() {
  Menu.setApplicationMenu(null);
  const wa = screen.getPrimaryDisplay().workAreaSize;
  const h = Math.min(920, wa.height - 40), w = Math.min(Math.max(560, Math.round(h * 0.66)), wa.width - 40);
  win = new BrowserWindow({
    width: w, height: h, minWidth: 360, minHeight: 560, center: true,
    title: 'واحة الرياضيات',
    backgroundColor: '#C2E3EE',
    icon: path.join(__dirname, 'app', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false }
  });
  // لا يحتاج التطبيق كاميرا ولا ميكروفوناً ولا إشعارات: كل طلب إذن مرفوض
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => callback(false));
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

// لا يغادر تطبيق الأطفال ملفاته: لا نافذة لموقع، ولا انتقال إلى عنوان خارجي
const LOCAL = url => /^(file:|blob:|data:|about:blank)/.test(String(url || ''));
app.on('web-contents-created', (e, wc) => {
  wc.setWindowOpenHandler(({ url }) => (LOCAL(url) ? { action: 'allow' } : { action: 'deny' }));
  wc.on('will-navigate', (ev, url) => { if (!LOCAL(url)) ev.preventDefault(); });
  wc.on('will-redirect', (ev, url) => { if (!LOCAL(url)) ev.preventDefault(); });
});

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
