package com.waha.studio;

import android.net.Uri;
import android.speech.tts.TextToSpeech;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;

/** ما لا يوفّره WebView لصفحة الاستوديو (window.AndroidBridge):
 *  النطق بمحرك الجهاز («اسمع ما قبلها» قبل أن تُسجَّل)، ومشاركة دفعة العودة، وحفظ ملف الأصل للأرشيف. */
public class NativeBridge {
    private final MainActivity act;
    private final WebView web;
    private TextToSpeech tts;
    private volatile boolean ready = false, dead = false;
    private byte[] pendingSave;

    public NativeBridge(MainActivity act, WebView web) {
        this.act = act;
        this.web = web;
        tts = new TextToSpeech(act, status -> act.runOnUiThread(() -> {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                int r = tts.setLanguage(new Locale("ar"));
                ready = !(r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED);
            }
        }));
    }

    @JavascriptInterface
    public void speak(String id, String text, double rate, double pitch) {
        act.runOnUiThread(() -> {
            if (tts == null || !ready) { toast(text); return; }   // لا صوت عربي في الجهاز: تُعرض الجملة مكتوبة
            tts.setSpeechRate((float) Math.max(0.3, Math.min(2.0, rate)));
            tts.setPitch((float) Math.max(0.5, Math.min(2.0, pitch)));
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, id);
        });
    }

    @JavascriptInterface
    public void cancel() {
        act.runOnUiThread(() -> { if (tts != null) tts.stop(); });
    }

    private static String safe(String name) {
        return (name == null || name.isEmpty() ? "file" : name).replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    /** دفعة العودة: تُكتب في ذاكرة التطبيق المؤقتة (shared/) وتُفتح قائمة المشاركة */
    @JavascriptInterface
    public void shareFile(String name, String mime, String base64) {
        final String n = safe(name);
        try {
            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            File d = new File(act.getCacheDir(), FilesProvider.SHARED);
            if (!d.exists()) d.mkdirs();
            try (FileOutputStream o = new FileOutputStream(new File(d, n))) { o.write(data); }
        } catch (Exception e) {
            toast("تعذّر تجهيز الملف للإرسال");
            return;
        }
        act.runOnUiThread(() -> {
            try { act.share(FilesProvider.uriFor(FilesProvider.SHARED, n), n); }
            catch (Exception e) { toast("لا تطبيق للمشاركة في هذا الجهاز"); }
        });
    }

    /** حفظ ملف (أصل WAV للأرشيف): نافذة الحفظ في النظام */
    @JavascriptInterface
    public void saveFile(String name, String mime, String base64) {
        try {
            pendingSave = Base64.decode(base64, Base64.DEFAULT);
        } catch (Exception e) {
            pendingSave = null;
            toast("تعذّر تجهيز الملف");
            return;
        }
        final String n = safe(name);
        act.runOnUiThread(() -> act.saveAs(n, mime));
    }

    void saved(Uri uri) {
        byte[] data = pendingSave;
        pendingSave = null;
        if (uri == null || data == null) return;
        try (OutputStream o = act.getContentResolver().openOutputStream(uri, "wt")) {
            if (o == null) throw new Exception("no stream");
            o.write(data);
            toast("حُفظ الملف");
        } catch (Exception e) {
            toast("تعذّر حفظ الملف");
        }
    }

    private void toast(String msg) {
        act.runOnUiThread(() -> Toast.makeText(act, msg, Toast.LENGTH_LONG).show());
    }

    public void shutdown() {
        dead = true;
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
    }
}
