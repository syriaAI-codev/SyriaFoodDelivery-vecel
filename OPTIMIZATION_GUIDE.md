# تحسينات مشروع SyriaFoodApp للنشر على Vercel

هذا المستند يشرح التحسينات التي تم إجراؤها على مشروع SyriaFoodApp لحل مشكلة "npm code 137" أثناء النشر على Netlify، وتحسين توافق المشروع مع منصة Vercel.

## المشكلة

كان المشروع يواجه مشكلة "npm code 137" أثناء النشر على Netlify، وهي مشكلة تحدث عادة بسبب نفاد الذاكرة أثناء عملية البناء.

## التحسينات المنفذة

### 1. تحسين ملف package.json

- **زيادة الذاكرة المخصصة لـ Node.js**: تم تعديل سكريبت البناء لاستخدام `NODE_OPTIONS=--max_old_space_size=4096` لزيادة الذاكرة المخصصة لـ Node.js أثناء البناء.
- **تحسين سكريبت postinstall**: تم تقسيم سكريبت postinstall إلى سكريبتات منفصلة واستخدام `npm ci` بدلاً من `npm install` للتثبيت الأسرع والأكثر استقرارًا.
- **إضافة قسم engines**: تم تحديد إصدار Node.js المطلوب للمشروع.

```json
"scripts": {
  "build": "NODE_OPTIONS=--max_old_space_size=4096 vite build",
  "install:client": "cd client && npm ci",
  "install:server": "cd server && npm ci",
  "postinstall": "npm run install:client && npm run install:server"
},
"engines": {
  "node": ">=16.0.0"
}
```

### 2. تحسين ملف index.html

- **إزالة سكريبت Replit badge**: تمت إزالة سكريبت Replit badge غير الضروري لتقليل الموارد.
- **إضافة خط Cairo**: تمت إضافة خط Cairo كخط إضافي لتحسين دعم اللغة العربية.
- **تحسين وصف الصفحة**: تمت إضافة وصف للصفحة وتحديد لون السمة.

### 3. تحسين عملية البناء (vite.config.ts)

- **تقسيم الشيفرة**: تم استخدام `splitVendorChunkPlugin` لتقسيم الشيفرة وتحسين الأداء.
- **تعطيل خرائط المصدر في الإنتاج**: تم تعطيل خرائط المصدر في الإنتاج لتقليل حجم الملفات.
- **استخدام terser للضغط**: تم استخدام terser للضغط الأفضل وإزالة سجلات وحدة التحكم.
- **تكوين manualChunks**: تم تقسيم التبعيات إلى حزم منفصلة (vendor, ui-lib, animations, utils).
- **زيادة حد التحذير لحجم الحزمة**: تم زيادة حد التحذير لحجم الحزمة لتجنب التحذيرات غير الضرورية.

```javascript
build: {
  outDir: 'client/dist',
  emptyOutDir: true,
  sourcemap: false,
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  },
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'ui-lib': ['@radix-ui/react-alert-dialog', /* ... */],
        'animations': ['framer-motion'],
        'utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority']
      }
    }
  },
  chunkSizeWarningLimit: 1000
}
```

### 4. إعداد ملفات التكوين لـ Vercel

- **إنشاء ملف vercel.json**: تم إنشاء ملف vercel.json لتكوين النشر على Vercel، بما في ذلك أوامر البناء والمخرجات وإعادة التوجيه وإعدادات الرأس.
- **إعداد ملفات البيئة**: تم إنشاء ملفات `.env.production` و `.env.development` لتحديد متغيرات البيئة للإنتاج والتطوير.

## كيفية نشر المشروع على Vercel

### 1. إعداد المشروع

1. قم بفك ضغط ملف `SyriaFoodApp_Vercel_Ready.zip` على جهازك.
2. قم بإنشاء مستودع Git جديد ورفع الملفات إليه:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/syria-food-app.git
git push -u origin main
```

### 2. النشر على Vercel

1. قم بتسجيل الدخول إلى حسابك على [Vercel](https://vercel.com/).
2. انقر على "New Project".
3. اختر مستودع GitHub الخاص بمشروعك.
4. في صفحة إعدادات النشر، ستلاحظ أن Vercel سيكتشف تلقائيًا إعدادات المشروع من ملف `vercel.json`.
5. أضف متغيرات البيئة التالية:
   - `VITE_GOOGLE_MAPS_API_KEY`: مفتاح Google Maps API الخاص بك
   - `VITE_SUPABASE_URL`: رابط Supabase الخاص بك
   - `VITE_SUPABASE_ANON_KEY`: المفتاح المجهول لـ Supabase
   - `NODE_ENV`: `production`
   - `VITE_API_BASE_URL`: `/api`
6. انقر على "Deploy".

### 3. التحقق من النشر

بعد اكتمال النشر، ستحصل على رابط للموقع المنشور (مثل `https://syria-food-app.vercel.app`). قم بزيارة هذا الرابط للتأكد من أن التطبيق يعمل بشكل صحيح.

## ملاحظات إضافية

- **تحسين الأداء**: التحسينات المنفذة ستساعد في تقليل استهلاك الذاكرة أثناء البناء وتحسين أداء التطبيق في الإنتاج.
- **تقسيم الشيفرة**: تقسيم الشيفرة سيساعد في تحسين زمن التحميل الأولي للتطبيق.
- **متغيرات البيئة**: تأكد من إعداد متغيرات البيئة بشكل صحيح في لوحة تحكم Vercel.

## استكشاف الأخطاء وإصلاحها

إذا واجهت أي مشاكل أثناء النشر، يمكنك التحقق من:

1. **سجلات البناء**: في لوحة تحكم Vercel، انتقل إلى "Deployments" وانقر على النشر الأخير لعرض سجلات البناء.
2. **متغيرات البيئة**: تأكد من إعداد جميع متغيرات البيئة المطلوبة بشكل صحيح.
3. **إعادة التوجيه**: إذا كانت هناك مشاكل في التنقل، تأكد من إعداد إعادة التوجيه بشكل صحيح في ملف `vercel.json`.

إذا استمرت المشكلات، يمكنك تجربة:

1. زيادة قيمة `max_old_space_size` في سكريبت البناء (مثلاً إلى 6144 أو 8192).
2. تقليل عدد التبعيات غير الضرورية في المشروع.
3. تحسين استيراد المكونات باستخدام الاستيراد الديناميكي.
