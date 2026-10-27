package com.waha.math;

import android.app.Activity;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;

/**
 * واحة الرياضيات على أندرويد: صفحة التطبيق الواحدة من داخل الـAPK على عنوان https داخلي
 * (فيعمل التخزين وIndexedDB)، ولا يُطلب أي موقع خارجي، ولا إذن إنترنت أصلاً.
 */
public class MainActivity extends Activity {
    static final String HOST = "appassets.androidplatform.net";
    static final int REQ_FILE = 102;
    static final int REQ_SAVE = 103;

    private WebView web;
    private NativeBridge bridge;
    private ValueCallback<Uri[]> fileCallback;
    private Uri cameraUri;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // نسخة الفحص وحدها (debuggable): يقرأ الفحص الآلي الصفحة. النسخة الموزَّعة غير debuggable
        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        web = new WebView(this);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);          // الصورة التي يختارها الطفل أو يلتقطها تصل عنواناً content://
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setTextZoom(100);                     // حجم الخط في إعدادات الجهاز لا يكسر تخطيط الشاشة (المسرح والفقاعة بقياسهما)

        File shared = new File(getCacheDir(), FilesProvider.SHARED);
        FilesProvider.clean(shared);
        FilesProvider.clean(new File(getCacheDir(), FilesProvider.CAMERA));
        bridge = new NativeBridge(this, web);
        web.addJavascriptInterface(bridge, "AndroidBridge");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serve(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !HOST.equals(request.getUrl().getHost());   // لا مغادرة إلى موقع خارجي
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                request.deny();                     // لا كاميرا ولا ميكروفون من الصفحة
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try {
                    startActivityForResult(chooserIntent(params), REQ_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        web.loadUrl("https://" + HOST + "/index.html");
    }

    /** ملفات التطبيق من assets/www وحدها، وكل ما عداها مرفوض */
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
            return new WebResourceResponse(mimeFor(path), "UTF-8", in);
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", headers, new ByteArrayInputStream(new byte[0]));
        }
    }

    private static String mimeFor(String path) {
        String p = path.toLowerCase();
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "text/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".svg")) return "image/svg+xml";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".woff")) return "font/woff";
        return "application/octet-stream";
    }

    /** نافذة اختيار الملف:
     *  - صورة بالتقاط (capture، «صيد الأشكال»): تطبيق الكاميرا مباشرة، والصورة تُكتب في ذاكرة التطبيق المؤقتة لا في معرض الجهاز.
     *  - صورة بلا التقاط (صورة ملف الطفل): اختيار صورة، ومعه الكاميرا.
     *  - غير ذلك (حزمة الصوت، النسخة الاحتياطية): كل الملفات، لأن أكثر مديري الملفات لا يعرفون نوع json وzip فيُخفونه. */
    private Intent chooserIntent(WebChromeClient.FileChooserParams params) {
        String[] acc = params.getAcceptTypes();
        boolean image = false;
        if (acc != null) for (String a : acc) if (a != null && a.startsWith("image/")) image = true;
        cameraUri = null;
        if (image) {
            Intent cam = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (cam.resolveActivity(getPackageManager()) != null) {
                String name = "cam_" + System.currentTimeMillis() + ".jpg";
                cameraUri = FilesProvider.uriFor(FilesProvider.CAMERA, name);
                cam.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                cam.setClipData(ClipData.newRawUri(name, cameraUri));
                cam.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } else {
                cam = null;
            }
            if (cam != null && params.isCaptureEnabled()) return cam;
            Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
            pick.addCategory(Intent.CATEGORY_OPENABLE);
            pick.setType("image/*");
            Intent chooser = Intent.createChooser(pick, "اختر صورة أو التقطها");
            if (cam != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[]{cam});
            return chooser;
        }
        Intent i = new Intent(Intent.ACTION_GET_CONTENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*");
        if (params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
            i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        }
        return i;
    }

    /** حفظ ملف (النسخة الاحتياطية): نافذة الحفظ في النظام، فيختار الكبير مكانه */
    void saveAs(String name, String mime) {
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
        i.putExtra(Intent.EXTRA_TITLE, name);
        startActivityForResult(i, REQ_SAVE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_FILE && fileCallback != null) {
            Uri[] picked = pickedUris(resultCode, data);
            if (picked == null && resultCode == Activity.RESULT_OK && cameraUri != null && FilesProvider.hasData(this, cameraUri)) {
                picked = new Uri[]{cameraUri};      // الكاميرا تكتب في العنوان الذي أعطيناها ولا تعيد بيانات
            }
            fileCallback.onReceiveValue(picked);
            fileCallback = null;
            cameraUri = null;
        } else if (requestCode == REQ_SAVE) {
            bridge.saved(resultCode == Activity.RESULT_OK && data != null ? data.getData() : null);
        }
    }

    /** ملف واحد أو عدة ملفات (ClipData)، أو لا شيء عند الإلغاء */
    static Uri[] pickedUris(int resultCode, Intent data) {
        if (resultCode != Activity.RESULT_OK || data == null) return null;
        ClipData clip = data.getClipData();
        if (clip != null && clip.getItemCount() > 0) {
            Uri[] out = new Uri[clip.getItemCount()];
            for (int k = 0; k < out.length; k++) out[k] = clip.getItemAt(k).getUri();
            if (out.length == 1 && out[0] != null && "content".equals(out[0].getScheme()) && FilesProvider.AUTH.equals(out[0].getAuthority())) return null;   // صدى عنوان الكاميرا نفسه
            return out;
        }
        Uri one = data.getData();
        return one == null ? null : new Uri[]{one};
    }

    /** زر الرجوع: يفعل ما يفعله الطفل بالأزرار (غطاء الخروج من الدرس، و«رجوع» في اللوحة والمعرض)، وفي الشاشة الرئيسية يُصغَّر التطبيق ولا يُغلق */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(function(){try{return window.__androidBack?window.__androidBack():0;}catch(e){return 0;}})()", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if ("1".equals(value)) return;
                moveTaskToBack(true);
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        bridge.stopSpeech();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        bridge.shutdown();
        web.destroy();
        super.onDestroy();
    }
}
