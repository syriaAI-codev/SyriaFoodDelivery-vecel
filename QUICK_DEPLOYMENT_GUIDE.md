# دليل نشر تطبيق SyriaFoodApp على Netlify

هذا الدليل المختصر يشرح كيفية نشر تطبيق SyriaFoodApp على منصة Netlify بشكل سريع.

## الخطوات السريعة للنشر

### 1. تحضير المشروع

1. قم بفك ضغط ملف `SyriaFoodApp_Netlify_Ready.zip` على جهازك.
2. افتح نافذة الطرفية (Terminal) وانتقل إلى مجلد المشروع:
   ```bash
   cd path/to/SyriaFoodApp_Netlify
   ```
3. قم بتثبيت التبعيات:
   ```bash
   npm install
   ```

### 2. النشر على Netlify

#### الطريقة الأولى: النشر من واجهة Netlify

1. قم بتسجيل الدخول إلى حسابك على [Netlify](https://app.netlify.com/).
2. انقر على زر "New site from Git".
3. اختر مزود Git الخاص بك (GitHub، GitLab، أو Bitbucket).
4. اختر المستودع الذي أنشأته للمشروع.
5. في صفحة إعدادات النشر:
   - **فرع البناء**: `main`
   - **أمر البناء**: `npm run build`
   - **مجلد النشر**: `client/dist`
6. أضف متغيرات البيئة التالية:
   - `VITE_GOOGLE_MAPS_API_KEY`: مفتاح Google Maps API
   - `VITE_SUPABASE_URL`: رابط Supabase
   - `VITE_SUPABASE_ANON_KEY`: مفتاح Supabase المجهول
   - `NODE_ENV`: `production`
   - `VITE_API_BASE_URL`: `/.netlify/functions`
7. انقر على زر "Deploy site".

#### الطريقة الثانية: النشر باستخدام Netlify CLI

1. قم بتثبيت Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. قم بتسجيل الدخول إلى حسابك على Netlify:
   ```bash
   netlify login
   ```
3. قم بربط المشروع بموقع Netlify:
   ```bash
   netlify init
   ```
4. قم ببناء ونشر المشروع:
   ```bash
   netlify deploy --prod
   ```

## ملاحظات هامة

- تأكد من إعداد متغيرات البيئة بشكل صحيح في لوحة تحكم Netlify.
- يمكنك تخصيص مجال من خلال إعدادات المجال في لوحة تحكم Netlify.
- للحصول على تعليمات أكثر تفصيلاً، راجع ملف `DEPLOYMENT_GUIDE.md` المرفق مع المشروع.

## الدعم

إذا واجهت أي مشاكل، يمكنك الرجوع إلى [وثائق Netlify](https://docs.netlify.com/) أو التواصل معنا للحصول على المساعدة.
