package com.waha.math;

import android.net.Uri;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Locale;

/** ما لا يوفّره WebView، للصفحة باسم window.AndroidBridge (يستعمله platforms/android/shim.js):
 *  النطق بمحرك الجهاز بطابور كالمتصفح، وحفظ ملف النسخة الاحتياطية، وطباعة تقرير الأسبوع. */
public class NativeBridge {
    private final MainActivity act;
    private final WebView web;
    private TextToSpeech tts;
    /** 0 يُجهَّز، 1 جاهز بالعربية، 2 لا محرك نطق أو لا صوت عربي (فتُقرأ الجمل صامتةً بزمن القراءة) */
    private volatile int state = 0;
    private final ArrayList<Object[]> waiting = new ArrayList<Object[]>();
    private byte[] pendingSave;

    public NativeBridge(MainActivity act, WebView web) {
        this.act = act;
        this.web = web;
        tts = new TextToSpeech(act, status -> act.runOnUiThread(() -> {
            if (status == TextToSpeech.SUCCESS && tts != null) {
                int r = tts.setLanguage(new Locale("ar"));
                state = (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) ? 2 : 1;
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { event("start", id); }
                    @Override public void onDone(String id) { event("end", id); }
                    @Override public void onError(String id) { event("error", id); }
                    @Override public void onStop(String id, boolean interrupted) { event("error", id); }
                });
            } else {
                state = 2;
            }
            ArrayList<Object[]> w = new ArrayList<Object[]>(waiting);
            waiting.clear();
            for (Object[] a : w) doSpeak((String) a[0], (String) a[1], (Double) a[2], (Double) a[3]);
        }));
    }

    private void event(String type, String id) {
        String js = "window.__ttsEvent&&window.__ttsEvent(" + JSONObject.quote(type) + "," + JSONObject.quote(id) + ")";
        web.post(() -> web.evaluateJavascript(js, null));
    }

    // ---------- النطق ----------
    /** 0 يُجهَّز، 1 جاهز، 2 لا صوت عربي */
    @JavascriptInterface
    public int ttsState() { return state; }

    /** كالمتصفح: الجمل تنتظر دورها (QUEUE_ADD)، و cancel يوقفها كلها */
    @JavascriptInterface
    public void speak(String id, String text, double rate, double pitch) {
        act.runOnUiThread(() -> {
            if (state == 0) { waiting.add(new Object[]{id, text, rate, pitch}); return; }
            doSpeak(id, text, rate, pitch);
        });
    }

    private void doSpeak(String id, String text, double rate, double pitch) {
        if (tts == null || state != 1) { event("error", id); return; }   // قبل أن تبدأ: الصفحة تقرأ الجملة صامتة
        tts.setSpeechRate((float) Math.max(0.3, Math.min(2.0, rate)));
        tts.setPitch((float) Math.max(0.5, Math.min(2.0, pitch)));
        tts.speak(text, TextToSpeech.QUEUE_ADD, null, id);
    }

    @JavascriptInterface
    public void cancel() {
        act.runOnUiThread(() -> { waiting.clear(); if (tts != null) tts.stop(); });
    }

    public void stopSpeech() { cancel(); }

    // ---------- حفظ ملف (النسخة الاحتياطية) ----------
    @JavascriptInterface
    public void saveFile(String name, String mime, String base64) {
        try {
            pendingSave = Base64.decode(base64, Base64.DEFAULT);
        } catch (Exception e) {
            pendingSave = null;
            toast("تعذّر تجهيز الملف");
            return;
        }
        String safe = (name == null || name.isEmpty() ? "file" : name).replaceAll("[\\\\/:*?\"<>|]", "_");
        act.runOnUiThread(() -> act.saveAs(safe, mime));
    }

    /** نتيجة نافذة الحفظ: يُكتب الملف في المكان الذي اختاره الكبير */
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

    // ---------- الطباعة (تقرير الأسبوع) ----------
    @JavascriptInterface
    public void printPage() {
        act.runOnUiThread(() -> {
            PrintManager pm = (PrintManager) act.getSystemService(android.content.Context.PRINT_SERVICE);
            if (pm != null) pm.print("واحة الرياضيات", web.createPrintDocumentAdapter("waha-math"), new PrintAttributes.Builder().build());
        });
    }

    private void toast(String msg) {
        act.runOnUiThread(() -> Toast.makeText(act, msg, Toast.LENGTH_LONG).show());
    }

    public void shutdown() {
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
    }
}
