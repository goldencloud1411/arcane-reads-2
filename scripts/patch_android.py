# Se ejecuta después de "npx cap add android": pantalla completa real, barras que se camuflan con la app e ícono
import re, shutil, pathlib
root = pathlib.Path("android/app/src/main")
res = root / "res"

# ---- estilos: barras transparentes ----
styles = res / "values/styles.xml"
s = styles.read_text(encoding="utf-8")
extra = """
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowBackground">@color/arcane_bg</item>
"""
s = re.sub(r'(<style name="AppTheme\.NoActionBar"[^>]*>)', lambda m: m.group(1) + extra, s, count=1)
styles.write_text(s, encoding="utf-8")
(res / "values/arcane_colors.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="arcane_bg">#101528</color></resources>\n', encoding="utf-8")

# ---- MainActivity ----
JAVA = """package __PKG__;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.graphics.ColorUtils;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private int topDp = 0;
  private boolean running = false;
  private final Handler handler = new Handler(Looper.getMainLooper());
  private final Runnable tick = new Runnable() {
    @Override
    public void run() {
      sync();
      if (running) handler.postDelayed(this, 2000);
    }
  };

  /* Pasa a la web la altura de la barra superior (--sat) y lee el color de fondo (--bg) para camuflar las barras */
  private void sync() {
    if (getBridge() == null || getBridge().getWebView() == null) return;
    WebView wv = getBridge().getWebView();
    wv.evaluateJavascript(
      "document.documentElement.style.setProperty('--sat','" + topDp + "px');"
        + "getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()",
      value -> {
        if (value == null) return;
        String c = value.replace("\\"", "").trim();
        try {
          applyColor(Color.parseColor(c));
        } catch (Exception e) {
          /* color no reconocido: se deja el anterior */
        }
      });
  }

  private void applyColor(int color) {
    getWindow().getDecorView().setBackgroundColor(color);
    boolean light = ColorUtils.calculateLuminance(color) > 0.5;
    WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    c.setAppearanceLightStatusBars(light);
    c.setAppearanceLightNavigationBars(light);
  }

  /* Guarda archivos (copias de seguridad) en Descargas/ArcaneReads, visible en la app Archivos */
  public class ArcaneNative {
    @JavascriptInterface
    public String save(String name, String b64, String mime) {
      try {
        byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
        if (Build.VERSION.SDK_INT >= 29) {
          ContentValues v = new ContentValues();
          v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
          v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
          v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/ArcaneReads");
          Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
          if (uri == null) return "ERR:sin destino";
          OutputStream os = getContentResolver().openOutputStream(uri);
          if (os == null) return "ERR:sin salida";
          os.write(bytes);
          os.close();
        } else {
          File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "ArcaneReads");
          dir.mkdirs();
          FileOutputStream os = new FileOutputStream(new File(dir, name));
          os.write(bytes);
          os.close();
        }
        return "OK:Descargas/ArcaneReads/" + name;
      } catch (Exception e) {
        return "ERR:" + e.getMessage();
      }
    }
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (getBridge() != null && getBridge().getWebView() != null) {
      getBridge().getWebView().addJavascriptInterface(new ArcaneNative(), "ArcaneNative");
    }
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    if (Build.VERSION.SDK_INT >= 28) {
      WindowManager.LayoutParams lp = getWindow().getAttributes();
      lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
      getWindow().setAttributes(lp);
    }
    getWindow().getDecorView().setBackgroundColor(Color.parseColor("#101528"));
    View content = findViewById(android.R.id.content);
    ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
      Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
      Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
      v.setPadding(bars.left, 0, bars.right, Math.max(bars.bottom, ime.bottom));
      topDp = Math.round(bars.top / getResources().getDisplayMetrics().density);
      sync();
      return WindowInsetsCompat.CONSUMED;
    });
  }

  @Override
  public void onResume() {
    super.onResume();
    running = true;
    handler.post(tick);
  }

  @Override
  public void onPause() {
    running = false;
    handler.removeCallbacks(tick);
    super.onPause();
  }
}
"""
java = next(root.rglob("MainActivity.java"))
pkg = re.search(r"package\s+([\w.]+);", java.read_text(encoding="utf-8")).group(1)
java.write_text(JAVA.replace("__PKG__", pkg), encoding="utf-8")
print("parche aplicado a", java)

# ---- Ícono de la app (usa los íconos de www/) ----
(res / "drawable-nodpi").mkdir(parents=True, exist_ok=True)
shutil.copy("www/icon-maskable-512.png", res / "drawable-nodpi" / "arcane_icon.png")
adaptive = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/arcane_bg"/>
    <foreground>
        <inset android:drawable="@drawable/arcane_icon" android:inset="16.67%"/>
    </foreground>
</adaptive-icon>
"""
(res / "mipmap-anydpi-v26").mkdir(parents=True, exist_ok=True)
for n in ("ic_launcher.xml", "ic_launcher_round.xml"):
    (res / "mipmap-anydpi-v26" / n).write_text(adaptive, encoding="utf-8")
for d in res.glob("mipmap-*dpi"):
    for n in ("ic_launcher.png", "ic_launcher_round.png"):
        shutil.copy("www/icon-192.png", d / n)
print("ícono aplicado")

# ---- Firma fija: todas las versiones se firman con la misma clave, así que se pueden instalar ENCIMA sin perder datos ----
gradle = pathlib.Path("android/app/build.gradle")
ks = pathlib.Path("scripts/arcane-debug.keystore")
if gradle.exists() and ks.exists():
    shutil.copy(ks, "android/app/arcane-debug.keystore")
    g = gradle.read_text(encoding="utf-8")
    if "arcane-debug.keystore" not in g:
        block = """
    signingConfigs {
        debug {
            storeFile file('arcane-debug.keystore')
            storeType 'pkcs12'
            storePassword 'arcanereads'
            keyAlias 'arcane'
            keyPassword 'arcanereads'
        }
    }
"""
        if "signingConfigs {" in g:
            print("AVISO: build.gradle ya tenía signingConfigs; no se tocó la firma")
        else:
            g, n = re.subn(r"(\nandroid\s*\{)", lambda m: m.group(1) + block, g, count=1)
            gradle.write_text(g, encoding="utf-8")
            print("firma fija aplicada" if n else "AVISO: no encontré el bloque android{} en build.gradle")
else:
    print("AVISO: no se encontró build.gradle o la clave; la firma no se fijó")
