# Se ejecuta después de "npx cap add android": pantalla completa real (barras transparentes, sin tapar la app)
import re, pathlib
root = pathlib.Path("android/app/src/main")
styles = root / "res/values/styles.xml"
s = styles.read_text(encoding="utf-8")
extra = """
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowBackground">@color/arcane_bg</item>
"""
s = re.sub(r'(<style name="AppTheme\.NoActionBar"[^>]*>)', lambda m: m.group(1) + extra, s, count=1)
styles.write_text(s, encoding="utf-8")
(root / "res/values/arcane_colors.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="arcane_bg">#101528</color></resources>\n', encoding="utf-8")
java = next(root.rglob("MainActivity.java"))
pkg = re.search(r"package\s+([\w.]+);", java.read_text(encoding="utf-8")).group(1)
java.write_text(f"""package {pkg};

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {{
  @Override
  public void onCreate(Bundle savedInstanceState) {{
    super.onCreate(savedInstanceState);
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    if (Build.VERSION.SDK_INT >= 28) {{
      WindowManager.LayoutParams lp = getWindow().getAttributes();
      lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
      getWindow().setAttributes(lp);
    }}
    getWindow().getDecorView().setBackgroundColor(Color.parseColor("#101528"));
    View content = findViewById(android.R.id.content);
    ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {{
      Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
      Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
      v.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
      return WindowInsetsCompat.CONSUMED;
    }});
  }}
}}
""", encoding="utf-8")
print("parche aplicado a", java)
