package com.waha.math;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/** ملفات التطبيق المؤقتة بلا مكتبات خارجية: صورة الكاميرا تُكتب هنا (camera/) فلا تدخل معرض الجهاز،
 *  وتُقرأ منها الصفحة. العنوان: content://com.waha.math.files/camera/<الاسم> */
public class FilesProvider extends ContentProvider {
    public static final String AUTH = "com.waha.math.files";
    public static final String CAMERA = "camera";
    public static final String SHARED = "shared";

    static Uri uriFor(String dir, String name) {
        return Uri.parse("content://" + AUTH + "/" + dir + "/" + Uri.encode(name));
    }

    private File fileFor(Uri uri, boolean create) throws FileNotFoundException {
        java.util.List<String> seg = uri.getPathSegments();
        if (seg == null || seg.size() != 2) throw new FileNotFoundException();
        String dir = seg.get(0), name = seg.get(1);
        if (!(CAMERA.equals(dir) || SHARED.equals(dir))) throw new FileNotFoundException();
        if (name == null || name.isEmpty() || name.contains("/") || name.contains("..")) throw new FileNotFoundException();
        File d = new File(getContext().getCacheDir(), dir);
        if (create && !d.exists()) d.mkdirs();
        File f = new File(d, name);
        if (!create && !f.exists()) throw new FileNotFoundException();
        return f;
    }

    /** هل كتبت الكاميرا صورة في هذا العنوان؟ */
    static boolean hasData(Context ctx, Uri uri) {
        java.util.List<String> seg = uri.getPathSegments();
        if (seg == null || seg.size() != 2) return false;
        File f = new File(new File(ctx.getCacheDir(), seg.get(0)), seg.get(1));
        return f.isFile() && f.length() > 0;
    }

    /** يحذف ما مضى عليه يوم، فلا تتراكم الصور في ذاكرة الجهاز (الصورة المختارة تُحفظ مصغّرة داخل الصفحة) */
    static void clean(File dir) {
        File[] old = dir.listFiles();
        if (old == null) return;
        long cutoff = System.currentTimeMillis() - 24L * 60L * 60L * 1000L;
        for (File f : old) { if (f.isFile() && f.lastModified() < cutoff) f.delete(); }
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        boolean write = mode != null && mode.contains("w");
        java.util.List<String> seg = uri.getPathSegments();
        if (write && (seg == null || seg.isEmpty() || !CAMERA.equals(seg.get(0)))) throw new FileNotFoundException();   // الكتابة للكاميرا وحدها
        File f = fileFor(uri, write);
        int m = write ? (ParcelFileDescriptor.MODE_READ_WRITE | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE)
                      : ParcelFileDescriptor.MODE_READ_ONLY;
        return ParcelFileDescriptor.open(f, m);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        try {
            File f = fileFor(uri, false);
            MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
            c.addRow(new Object[]{f.getName(), f.length()});
            return c;
        } catch (FileNotFoundException e) {
            return null;
        }
    }

    @Override
    public String getType(Uri uri) {
        String n = String.valueOf(uri.getLastPathSegment()).toLowerCase();
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".png")) return "image/png";
        if (n.endsWith(".json")) return "application/json";
        return "application/octet-stream";
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        throw new UnsupportedOperationException();
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }
}
