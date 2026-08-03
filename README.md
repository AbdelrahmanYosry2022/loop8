# Loop8

برنامج Mac خفيف لمعاينة ملفات Mixamo FBX وتصدير الحركة من ثماني زوايا بفارق 45 درجة.

## التشغيل

```bash
npm install
npm run tauri dev
```

لتشغيل الواجهة فقط داخل المتصفح:

```bash
npm run dev
```

## التصدير

- الصيغة المفضلة من Mixamo: `FBX Binary` مع `Skin` وبدون Keyframe Reduction.
- الحركة الأفقية لعظمة `Hips` تُثبّت تلقائيًا للحصول على حركة في مكانها.
- التطبيق يفضّل MP4/H.264 عندما يدعمه WebView، ويستخدم WebM كبديل.
- الزوايا: `0, 45, 90, 135, 180, 225, 270, 315`.

## الفحوص

```bash
npm test
npm run build
npm run tauri build
```
