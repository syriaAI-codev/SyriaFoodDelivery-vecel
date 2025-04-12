import { Link } from 'wouter';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center text-2xl font-bold text-primary">
              <span>توصيل</span>
            </Link>
            <p className="mt-4 text-gray-600">
              خدمة توصيل الطعام الأسرع والأسهل لطلب وجباتك المفضلة من أفضل المطاعم في سوريا.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-primary">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/restaurants" className="text-gray-600 hover:text-primary">
                  المطاعم
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 hover:text-primary">
                  حسابي
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">اتصل بنا</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                دمشق، سوريا
              </li>
              <li className="text-gray-600">
                البريد الإلكتروني: info@tawseel.com
              </li>
              <li className="text-gray-600">
                هاتف: +963 987-654-321
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">النشرة الإخبارية</h3>
            <p className="mb-4 text-gray-600">
              اشترك للحصول على آخر العروض والتحديثات
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="w-full rounded-r-md border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-l-md bg-primary px-4 py-2 text-white"
              >
                اشتراك
              </button>
            </form>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-600">
            &copy; {currentYear} توصيل. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;