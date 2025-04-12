# دليل نشر تطبيق SyriaFoodApp على Netlify

هذا الدليل يشرح خطوات نشر تطبيق SyriaFoodApp على منصة Netlify بشكل تفصيلي.

## المتطلبات المسبقة

قبل البدء، تأكد من توفر ما يلي:

1. حساب على [Netlify](https://www.netlify.com/)
2. [Git](https://git-scm.com/) مثبت على جهازك
3. [Node.js](https://nodejs.org/) (الإصدار 14 أو أحدث) و npm مثبتان على جهازك
4. مفاتيح API اللازمة (Google Maps، Supabase)

## خطوات النشر

### 1. إعداد المشروع محليًا

1. قم بفك ضغط ملف المشروع الذي تم تسليمه إليك.
2. افتح نافذة الطرفية (Terminal) وانتقل إلى مجلد المشروع:

```bash
cd path/to/SyriaFoodApp_Netlify
```

3. قم بتثبيت التبعيات:

```bash
npm install
```

4. قم بإنشاء ملف `.env.local` بناءً على ملف `.env.development` وأضف مفاتيح API الخاصة بك:

```bash
cp .env.development .env.local
```

5. افتح ملف `.env.local` وقم بتحديث القيم بمفاتيح API الخاصة بك.

6. اختبر المشروع محليًا:

```bash
npm run dev
```

7. تأكد من أن التطبيق يعمل بشكل صحيح على `http://localhost:3000`.

### 2. إعداد مستودع Git

1. قم بإنشاء مستودع Git جديد:

```bash
git init
```

2. أضف الملفات إلى مستودع Git:

```bash
git add .
```

3. قم بعمل commit أولي:

```bash
git commit -m "Initial commit"
```

4. قم بإنشاء مستودع جديد على GitHub أو أي منصة استضافة Git أخرى.

5. قم بربط المستودع المحلي بالمستودع البعيد:

```bash
git remote add origin https://github.com/username/syria-food-app.git
```

6. قم بدفع الكود إلى المستودع البعيد:

```bash
git push -u origin main
```

### 3. نشر المشروع على Netlify

#### الطريقة الأولى: النشر من واجهة Netlify

1. قم بتسجيل الدخول إلى حسابك على [Netlify](https://app.netlify.com/).

2. انقر على زر "New site from Git".

3. اختر مزود Git الخاص بك (GitHub، GitLab، أو Bitbucket).

4. اختر المستودع الذي أنشأته للمشروع.

5. في صفحة إعدادات النشر:
   - **فرع البناء**: `main`
   - **أمر البناء**: `npm run build`
   - **مجلد النشر**: `client/dist`

6. انقر على زر "Show advanced" وأضف متغيرات البيئة من ملف `.env.production`:
   - `VITE_GOOGLE_MAPS_API_KEY`: أضف مفتاح Google Maps API الخاص بك
   - `VITE_SUPABASE_URL`: أضف URL الخاص بـ Supabase
   - `VITE_SUPABASE_ANON_KEY`: أضف المفتاح المجهول لـ Supabase
   - `NODE_ENV`: `production`
   - `VITE_API_BASE_URL`: `/.netlify/functions`

7. انقر على زر "Deploy site".

8. انتظر حتى يكتمل النشر. ستحصل على رابط للموقع المنشور (مثل `https://syria-food-app.netlify.app`).

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

4. اتبع التعليمات لإنشاء موقع جديد أو ربط المشروع بموقع موجود.

5. قم بإعداد متغيرات البيئة:

```bash
netlify env:set VITE_GOOGLE_MAPS_API_KEY "your_google_maps_api_key"
netlify env:set VITE_SUPABASE_URL "your_supabase_url"
netlify env:set VITE_SUPABASE_ANON_KEY "your_supabase_anon_key"
netlify env:set NODE_ENV "production"
netlify env:set VITE_API_BASE_URL "/.netlify/functions"
```

6. قم ببناء ونشر المشروع:

```bash
netlify deploy --prod
```

7. بعد اكتمال النشر، ستحصل على رابط للموقع المنشور.

### 4. التحقق من النشر

1. قم بزيارة رابط الموقع المنشور للتأكد من أن التطبيق يعمل بشكل صحيح.

2. تحقق من أن جميع الميزات تعمل كما هو متوقع:
   - تسجيل الدخول
   - عرض المطاعم والقوائم
   - إنشاء الطلبات
   - تتبع الطلبات
   - وظائف عامل التوصيل
   - وظائف صاحب المطعم

### 5. إعداد مجال مخصص (اختياري)

1. في لوحة تحكم Netlify، انتقل إلى "Domain settings".

2. انقر على "Add custom domain".

3. أدخل اسم المجال الخاص بك (مثل `syriafoodapp.com`).

4. اتبع التعليمات لإعداد DNS وتأكيد ملكية المجال.

## استكشاف الأخطاء وإصلاحها

إذا واجهت أي مشاكل أثناء النشر، يمكنك التحقق من:

1. **سجلات البناء**: في لوحة تحكم Netlify، انتقل إلى "Deploys" وانقر على النشر الأخير لعرض سجلات البناء.

2. **متغيرات البيئة**: تأكد من إعداد جميع متغيرات البيئة المطلوبة بشكل صحيح.

3. **ملف netlify.toml**: تأكد من أن الإعدادات في ملف `netlify.toml` صحيحة.

4. **إعادة التوجيه**: إذا كانت هناك مشاكل في التنقل، تأكد من إعداد إعادة التوجيه بشكل صحيح في ملف `netlify.toml`.

## موارد إضافية

- [وثائق Netlify](https://docs.netlify.com/)
- [وثائق Vite](https://vitejs.dev/guide/)
- [وثائق React](https://reactjs.org/docs/getting-started.html)
- [وثائق Supabase](https://supabase.io/docs)

## الدعم

إذا كنت بحاجة إلى مساعدة إضافية، يمكنك:

1. مراجعة [منتدى مجتمع Netlify](https://answers.netlify.com/)
2. التواصل مع فريق الدعم الخاص بنا عبر البريد الإلكتروني
