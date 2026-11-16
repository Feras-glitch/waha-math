package com.waha.studio;

import android.Manifest;
import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.database.Cursor;
import android.util.Base64;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

/**
 * استوديو الواحة على أندرويد (docs/مواصفة_استوديو_الواحة.md): صفحة الاستوديو الواحدة من داخل الـAPK على عنوان https داخلي
 * (فيعمل التخزين وIndexedDB والميكروفون في سياق آمن)، ولا يُطلب أي موقع خارجي، ولا إذن إنترنت.
 * الميكروفون يُعطى للصفحة وحدها وللصوت وحده (لا كاميرا)، بعد إذن المستخدم في أندرويد.
 */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final int REQ_FILE = 102;
    static final int REQ_SAVE = 103;
    static final int REQ_MIC = 104;
    static final long MAX_OPEN = 64L * 1024 * 1024;   // حزمة عمل أكبر من هذا ليست حزمة عمل

    private WebView web;
    private NativeBridge bridge;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingMic;
    private Uri pendingOpen;
    private boolean pageReady;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);   // لا تنطفئ الشاشة في منتصف جلسة تسجيل
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);

        FilesProvider.clean(new File(getCacheDir(), FilesProvider.SHARED));
        bridge = new NativeBridge(this, web);
        web.addJavascriptInterface(bridge, "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serve(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String sch = request.getUrl().getScheme();
                if ("blob".equals(sch)) return false;                     // نسخة الدرس في «شاهد المشهد»
                return !HOST.equals(request.getUrl().getHost());
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (url != null && url.startsWith("https://" + HOST)) { pageReady = true; deliverOpen(); }
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (view == web) {
                    ViewGroup parent = (ViewGroup) view.getParent();
                    if (parent != null) parent.removeView(view);
                    view.destroy();
                    web = null;
                    recreate();
                }
                return true;
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean audioOnly = true;
                    for (String r : request.getResources()) if (!PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) audioOnly = false;
                    if (!audioOnly || request.getOrigin() == null || !HOST.equals(request.getOrigin().getHost())) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    } else {
                        if (pendingMic != null) pendingMic.deny();
                        pendingMic = request;
                        requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                    }
                });
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");   // أكثر مديري الملفات لا يعرفون نوع .wahawork
                try {
                    startActivityForResult(i, REQ_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        handleIntent(getIntent());
        web.loadUrl("https://" + HOST + "/index.html");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    /** «افتح بـ» أو «مشاركة» من واتساب أو مدير الملفات: الملف يُسلَّم للصفحة لتستورده */
    private void handleIntent(Intent intent) {
        if (intent == null) return;
        Uri u = null;
        if (Intent.ACTION_VIEW.equals(intent.getAction())) u = intent.getData();
        else if (Intent.ACTION_SEND.equals(intent.getAction())) u = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (u == null) return;
        pendingOpen = u;
        deliverOpen();
    }

    private void deliverOpen() {
        if (!pageReady || pendingOpen == null || web == null) return;
        Uri u = pendingOpen;
        pendingOpen = null;
        new Thread(() -> {
            String name = displayName(u), js;
            try (InputStream in = getContentResolver().openInputStream(u)) {
                if (in == null) throw new IOException("no stream");
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                byte[] buf = new byte[65536];
                int n;
                long total = 0;
                while ((n = in.read(buf)) > 0) { total += n; if (total > MAX_OPEN) throw new IOException("too big"); bo.write(buf, 0, n); }
                js = "window.__openPack&&window.__openPack(" + JSONObject.quote(name) + "," + JSONObject.quote(Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP)) + ")";
            } catch (Exception e) {
                js = "window.__openPack&&window.__openPack(" + JSONObject.quote(name) + ",null)";
            }
            final String call = js;
            runOnUiThread(() -> { if (web != null) web.evaluateJavascript(call, null); });
        }).start();
    }

    private String displayName(Uri u) {
        try (Cursor c = getContentResolver().query(u, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) { String n = c.getString(0); if (n != null) return n; }
        } catch (Exception e) { /* بلا اسم */ }
        String last = u.getLastPathSegment();
        return last == null ? "pack" : last;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode != REQ_MIC || pendingMic == null) return;
        if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) pendingMic.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        else pendingMic.deny();
        pendingMic = null;
    }

    /** ملفات الاستوديو من assets/www وحدها */
    private WebResourceResponse serve(Uri uri) {
        HashMap<String, String> headers = new HashMap<String, String>();
        if (!HOST.equals(uri.getHost())) {
            return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", headers, new ByteArrayInputStream(new byte[0]));
        }
        String path = uri.getPath();
        if (path == null || path.equals("/")) path = "/index.html";
        path = path.substring(1);
        if (path.contains("..")) {
            return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", headers, new ByteArrayInputStream(new byte[0]));
        }
        try {
            InputStream in = getAssets().open("www/" + path);
            String mime = path.endsWith(".html") ? "text/html" : path.endsWith(".js") ? "text/javascript" : "application/octet-stream";
            return new WebResourceResponse(mime, "UTF-8", in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", headers, new ByteArrayInputStream(new byte[0]));
        }
    }

    void saveAs(String name, String mime) {
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
        i.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(i, REQ_SAVE);
    }

    /** مشاركة ملف (دفعة العودة): قائمة المشاركة في أندرويد، فيختار المعلّق واتساب أو Drive أو البريد */
    void share(Uri uri, String name) {
        Intent s = new Intent(Intent.ACTION_SEND);
        s.setType("application/octet-stream");
        s.putExtra(Intent.EXTRA_STREAM, uri);
        s.putExtra(Intent.EXTRA_SUBJECT, name);
        s.setClipData(ClipData.newRawUri(name, uri));
        s.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        startActivity(Intent.createChooser(s, "أرسل الدفعة إلى المنسّق"));
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE) {
            Uri[] picked = null;
            if (resultCode == Activity.RESULT_OK && data != null && data.getData() != null) picked = new Uri[]{data.getData()};
            if (fileCallback != null) fileCallback.onReceiveValue(picked);
            fileCallback = null;
        } else if (requestCode == REQ_SAVE) {
            bridge.saved(resultCode == Activity.RESULT_OK && data != null ? data.getData() : null);
        }
    }

    @Override
    public void onBackPressed() {
        if (web == null) { moveTaskToBack(true); return; }
        web.evaluateJavascript("(function(){try{return window.__androidBack?window.__androidBack():0;}catch(e){return 0;}})()", value -> {
            if ("1".equals(value)) return;
            moveTaskToBack(true);
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        bridge.cancel();
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        bridge.shutdown();
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
