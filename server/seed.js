// بسم الله الرحمن الرحيم
// سكريبت إنشاء البيانات الأولية لتطبيق توصيل الطعام في سوريا

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { 
  users, 
  restaurants, 
  categories, 
  menuItems, 
  addresses,
  deliveryPersons
} from '../shared/schema.js';

// تكوين الاتصال بقاعدة البيانات
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const db = drizzle(pool);

// تشغيل السكريبت
async function seed() {
  console.log('بدء عملية إنشاء البيانات الأولية...');

  try {
    // إنشاء الفئات (التصنيفات)
    console.log('إنشاء الفئات...');
    const categoriesData = [
      { id: 1, name: 'شاورما', icon: '🥙' },
      { id: 2, name: 'بيتزا', icon: '🍕' },
      { id: 3, name: 'برغر', icon: '🍔' },
      { id: 4, name: 'مشاوي', icon: '🍖' },
      { id: 5, name: 'حلويات', icon: '🍰' },
      { id: 6, name: 'مشروبات', icon: '🥤' },
      { id: 7, name: 'فطور', icon: '🍳' },
      { id: 8, name: 'وجبات سريعة', icon: '🌮' },
      { id: 9, name: 'مأكولات بحرية', icon: '🦞' },
      { id: 10, name: 'مأكولات شرقية', icon: '🥘' },
    ];

    for (const category of categoriesData) {
      await db.insert(categories).values(category).onConflictDoNothing();
    }
    console.log(`تم إنشاء ${categoriesData.length} فئة بنجاح`);

    // إنشاء المستخدمين (مدراء، أصحاب مطاعم، عمال توصيل، زبائن)
    console.log('إنشاء المستخدمين...');
    
    // تشفير كلمة المرور الافتراضية
    const defaultPassword = await bcrypt.hash('Password123!', 10);
    
    const usersData = [
      // المدير
      { 
        id: 1, 
        name: 'مدير النظام', 
        email: 'admin@syriafood.com', 
        password: defaultPassword, 
        phone: '+963912345678', 
        address: 'دمشق، سوريا', 
        username: 'admin', 
        role: 'admin' 
      },
      
      // أصحاب المطاعم
      { 
        id: 2, 
        name: 'محمد الشامي', 
        email: 'shami@restaurant.com', 
        password: defaultPassword, 
        phone: '+963923456789', 
        address: 'شارع بغداد، دمشق', 
        username: 'shami_rest', 
        role: 'restaurant',
        restaurantId: 1
      },
      { 
        id: 3, 
        name: 'أحمد الحلبي', 
        email: 'halabi@restaurant.com', 
        password: defaultPassword, 
        phone: '+963934567890', 
        address: 'شارع الجامعة، حلب', 
        username: 'halabi_rest', 
        role: 'restaurant',
        restaurantId: 2
      },
      { 
        id: 4, 
        name: 'سمير الساحلي', 
        email: 'sahili@restaurant.com', 
        password: defaultPassword, 
        phone: '+963945678901', 
        address: 'شارع الكورنيش، اللاذقية', 
        username: 'sahili_rest', 
        role: 'restaurant',
        restaurantId: 3
      },
      
      // عمال التوصيل
      { 
        id: 5, 
        name: 'خالد المحمد', 
        email: 'khaled@delivery.com', 
        password: defaultPassword, 
        phone: '+963956789012', 
        address: 'المزة، دمشق', 
        username: 'khaled_delivery', 
        role: 'delivery' 
      },
      { 
        id: 6, 
        name: 'عمر السليمان', 
        email: 'omar@delivery.com', 
        password: defaultPassword, 
        phone: '+963967890123', 
        address: 'الميدان، دمشق', 
        username: 'omar_delivery', 
        role: 'delivery' 
      },
      
      // الزبائن
      { 
        id: 7, 
        name: 'ليلى الأحمد', 
        email: 'layla@customer.com', 
        password: defaultPassword, 
        phone: '+963978901234', 
        address: 'المالكي، دمشق', 
        username: 'layla_customer', 
        role: 'customer' 
      },
      { 
        id: 8, 
        name: 'سامر الخطيب', 
        email: 'samer@customer.com', 
        password: defaultPassword, 
        phone: '+963989012345', 
        address: 'أبو رمانة، دمشق', 
        username: 'samer_customer', 
        role: 'customer' 
      },
      { 
        id: 9, 
        name: 'رنا العلي', 
        email: 'rana@customer.com', 
        password: defaultPassword, 
        phone: '+963990123456', 
        address: 'الشعلان، دمشق', 
        username: 'rana_customer', 
        role: 'customer' 
      },
      { 
        id: 10, 
        name: 'فادي الحسن', 
        email: 'fadi@customer.com', 
        password: defaultPassword, 
        phone: '+963901234567', 
        address: 'الروضة، دمشق', 
        username: 'fadi_customer', 
        role: 'customer' 
      }
    ];

    for (const user of usersData) {
      await db.insert(users).values(user).onConflictDoNothing();
    }
    console.log(`تم إنشاء ${usersData.length} مستخدم بنجاح`);

    // إنشاء عناوين للزبائن
    console.log('إنشاء عناوين الزبائن...');
    const addressesData = [
      {
        id: 1,
        userId: 7, // ليلى
        title: 'المنزل',
        address: 'شارع عبد المنعم رياض، المالكي، دمشق',
        lat: 33.513,
        lng: 36.276,
        isDefault: true
      },
      {
        id: 2,
        userId: 7, // ليلى
        title: 'العمل',
        address: 'شارع الفردوس، وسط دمشق',
        lat: 33.516,
        lng: 36.312,
        isDefault: false
      },
      {
        id: 3,
        userId: 8, // سامر
        title: 'المنزل',
        address: 'شارع الجلاء، أبو رمانة، دمشق',
        lat: 33.517,
        lng: 36.281,
        isDefault: true
      },
      {
        id: 4,
        userId: 9, // رنا
        title: 'المنزل',
        address: 'شارع بغداد، الشعلان، دمشق',
        lat: 33.521,
        lng: 36.289,
        isDefault: true
      },
      {
        id: 5,
        userId: 10, // فادي
        title: 'المنزل',
        address: 'شارع فارس الخوري، الروضة، دمشق',
        lat: 33.508,
        lng: 36.301,
        isDefault: true
      }
    ];

    for (const address of addressesData) {
      await db.insert(addresses).values(address).onConflictDoNothing();
    }
    console.log(`تم إنشاء ${addressesData.length} عنوان بنجاح`);

    // إنشاء المطاعم
    console.log('إنشاء المطاعم...');
    const restaurantsData = [
      {
        id: 1,
        name: 'مطعم الشامي',
        description: 'أشهى المأكولات الشامية التقليدية',
        phone: '+963112345678',
        address: 'شارع بغداد، دمشق، سوريا',
        lat: 33.5138,
        lng: 36.3159,
        logo: 'https://example.com/logos/shami.jpg',
        coverImage: 'https://example.com/covers/shami.jpg',
        cuisineType: ['مأكولات شرقية', 'شاورما', 'مشاوي'],
        rating: 4.7,
        reviewCount: 120,
        minOrderAmount: 5000,
        deliveryFee: 1000,
        deliveryTime: '30-45 دقيقة',
        isOpen: true,
        hasPromo: true,
        discount: 10
      },
      {
        id: 2,
        name: 'مطعم الحلبي',
        description: 'أشهى المأكولات الحلبية الأصيلة',
        phone: '+963212345678',
        address: 'شارع الجامعة، حلب، سوريا',
        lat: 36.2021,
        lng: 37.1343,
        logo: 'https://example.com/logos/halabi.jpg',
        coverImage: 'https://example.com/covers/halabi.jpg',
        cuisineType: ['مأكولات شرقية', 'كباب', 'مشاوي'],
        rating: 4.8,
        reviewCount: 150,
        minOrderAmount: 6000,
        deliveryFee: 1200,
        deliveryTime: '25-40 دقيقة',
        isOpen: true,
        hasPromo: false,
        discount: 0
      },
      {
        id: 3,
        name: 'مطعم الساحلي',
        description: 'أشهى المأكولات البحرية الطازجة',
        phone: '+963412345678',
        address: 'شارع الكورنيش، اللاذقية، سوريا',
        lat: 35.5352,
        lng: 35.7915,
        logo: 'https://example.com/logos/sahili.jpg',
        coverImage: 'https://example.com/covers/sahili.jpg',
        cuisineType: ['مأكولات بحرية', 'أسماك', 'مقبلات'],
        rating: 4.6,
        reviewCount: 90,
        minOrderAmount: 8000,
        deliveryFee: 1500,
        deliveryTime: '35-50 دقيقة',
        isOpen: true,
        hasPromo: true,
        discount: 15
      },
      {
        id: 4,
        name: 'بيتزا دمشق',
        description: 'ألذ أنواع البيتزا الإيطالية والأمريكية',
        phone: '+963112345679',
        address: 'شارع الحمراء، دمشق، سوريا',
        lat: 33.5132,
        lng: 36.2988,
        logo: 'https://example.com/logos/damascus_pizza.jpg',
        coverImage: 'https://example.com/covers/damascus_pizza.jpg',
        cuisineType: ['بيتزا', 'وجبات سريعة', 'مشروبات'],
        rating: 4.5,
        reviewCount: 80,
        minOrderAmount: 4000,
        deliveryFee: 1000,
        deliveryTime: '20-35 دقيقة',
        isOpen: true,
        hasPromo: false,
        discount: 0
      },
      {
        id: 5,
        name: 'برغر هاوس',
        description: 'أشهى أنواع البرغر الطازج',
        phone: '+963112345680',
        address: 'شارع الفردوس، دمشق، سوريا',
        lat: 33.5167,
        lng: 36.3106,
        logo: 'https://example.com/logos/burger_house.jpg',
        coverImage: 'https://example.com/covers/burger_house.jpg',
        cuisineType: ['برغر', 'وجبات سريعة', 'مشروبات'],
        rating: 4.4,
        reviewCount: 70,
        minOrderAmount: 3500,
        deliveryFee: 1000,
        deliveryTime: '15-30 دقيقة',
        isOpen: true,
        hasPromo: true,
        discount: 5
      }
    ];

    for (const restaurant of restaurantsData) {
      await db.insert(restaurants).values(restaurant).onConflictDoNothing();
    }
    console.log(`تم إنشاء ${restaurantsData.length} مطعم بنجاح`);

    // إنشاء عناصر القائمة (الأطعمة)
    console.log('إنشاء عناصر القائمة...');
    const menuItemsData = [
      // مطعم الشامي
      {
        id: 1,
        restaurantId: 1,
        categoryId: 1, // شاورما
        name: 'شاورما دجاج',
        description: 'شاورما دجاج مع صوص الثوم والمخللات',
        price: 3500,
        image: 'https://example.com/menu/shami/chicken_shawarma.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 2,
        restaurantId: 1,
        categoryId: 1, // شاورما
        name: 'شاورما لحم',
        description: 'شاورما لحم مع صوص الطحينة والمخللات',
        price: 4500,
        image: 'https://example.com/menu/shami/meat_shawarma.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 3,
        restaurantId: 1,
        categoryId: 4, // مشاوي
        name: 'مشاوي مشكلة',
        description: 'تشكيلة من المشاوي تتضمن كباب، شقف، وكفتة',
        price: 12000,
        image: 'https://example.com/menu/shami/mixed_grill.jpg',
        isAvailable: true,
        isPopular: false,
        hasDiscount: true,
        discountPercentage: 10
      },
      
      // مطعم الحلبي
      {
        id: 4,
        restaurantId: 2,
        categoryId: 4, // مشاوي
        name: 'كباب حلبي',
        description: 'كباب حلبي مشوي على الفحم مع بهارات خاصة',
        price: 9000,
        image: 'https://example.com/menu/halabi/aleppo_kebab.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 5,
        restaurantId: 2,
        categoryId: 4, // مشاوي
        name: 'كفتة بالطحينة',
        description: 'كفتة مشوية مع صوص الطحينة والبطاطا',
        price: 10000,
        image: 'https://example.com/menu/halabi/kofta_tahini.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 6,
        restaurantId: 2,
        categoryId: 10, // مأكولات شرقية
        name: 'كبة حلبية',
        description: 'كبة حلبية أصلية محشوة باللحم والصنوبر',
        price: 8000,
        image: 'https://example.com/menu/halabi/aleppo_kibbeh.jpg',
        isAvailable: true,
        isPopular: false,
        hasDiscount: true,
        discountPercentage: 5
      },
      
      // مطعم الساحلي
      {
        id: 7,
        restaurantId: 3,
        categoryId: 9, // مأكولات بحرية
        name: 'سمك مشوي',
        description: 'سمك طازج مشوي مع التتبيلة الخاصة',
        price: 15000,
        image: 'https://example.com/menu/sahili/grilled_fish.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 8,
        restaurantId: 3,
        categoryId: 9, // مأكولات بحرية
        name: 'روبيان مقلي',
        description: 'روبيان مقلي مع صوص الليمون والثوم',
        price: 18000,
        image: 'https://example.com/menu/sahili/fried_shrimp.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: true,
        discountPercentage: 15
      },
      {
        id: 9,
        restaurantId: 3,
        categoryId: 9, // مأكولات بحرية
        name: 'سلطة بحرية',
        description: 'سلطة بحرية مع تشكيلة من المأكولات البحرية',
        price: 12000,
        image: 'https://example.com/menu/sahili/seafood_salad.jpg',
        isAvailable: true,
        isPopular: false,
        hasDiscount: false,
        discountPercentage: 0
      },
      
      // بيتزا دمشق
      {
        id: 10,
        restaurantId: 4,
        categoryId: 2, // بيتزا
        name: 'بيتزا مارغريتا',
        description: 'بيتزا مارغريتا مع صوص الطماطم والجبنة الموزاريلا',
        price: 7000,
        image: 'https://example.com/menu/damascus_pizza/margherita.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 11,
        restaurantId: 4,
        categoryId: 2, // بيتزا
        name: 'بيتزا بيبروني',
        description: 'بيتزا بيبروني مع الجبنة الموزاريلا',
        price: 9000,
        image: 'https://example.com/menu/damascus_pizza/pepperoni.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 12,
        restaurantId: 4,
        categoryId: 2, // بيتزا
        name: 'بيتزا خضار',
        description: 'بيتزا خضار مع الفلفل والزيتون والفطر',
        price: 8000,
        image: 'https://example.com/menu/damascus_pizza/vegetable.jpg',
        isAvailable: true,
        isPopular: false,
        hasDiscount: true,
        discountPercentage: 5
      },
      
      // برغر هاوس
      {
        id: 13,
        restaurantId: 5,
        categoryId: 3, // برغر
        name: 'برغر كلاسيك',
        description: 'برغر كلاسيك مع الجبنة والخضار',
        price: 5000,
        image: 'https://example.com/menu/burger_house/classic.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 14,
        restaurantId: 5,
        categoryId: 3, // برغر
        name: 'برغر دبل تشيز',
        description: 'برغر مزدوج مع طبقتين من الجبنة',
        price: 7000,
        image: 'https://example.com/menu/burger_house/double_cheese.jpg',
        isAvailable: true,
        isPopular: true,
        hasDiscount: false,
        discountPercentage: 0
      },
      {
        id: 15,
        restaurantId: 5,
        categoryId: 3, // برغر
        name: 'برغر دجاج',
        description: 'برغر دجاج مقرمش مع صوص خاص',
        price: 4500,
        image: 'https://example.com/menu/burger_house/chicken.jpg',
        isAvailable: true,
        isPopular: false,
        hasDiscount: true,
        discountPercentage: 5
      }
    ];

    for (const menuItem of menuItemsData) {
      await db.insert(menuItems).values(menuItem).onConflictDoNothing();
    }
    console.log(`تم إنشاء ${menuItemsData.length} عنصر قائمة بنجاح`);

    // إنشاء عمال التوصيل
    console.log('إنشاء بيانات عمال التوصيل...');
    const deliveryPersonsData = [
      {
        id: 1,
        userId: 5, // خالد المحمد
        isAvailable: true,
        currentLat: 33.5138,
        currentLng: 36.2765,
        lastLocationUpdate: new Date()
      },
      {
        id: 2,
        userId: 6, // عمر السليمان
        isAvailable: true,
        currentLat: 33.5167,
        currentLng: 36.3106,
        lastLocationUpdate: new Date()
      }
    ];

    for (const deliveryPerson of deliveryPersonsData) {
      await db.insert(deliveryPersons).values(deliveryPerson).onConflictDoNothing();
    }
    console.log(`تم إنشاء ${deliveryPersonsData.length} عامل توصيل بنجاح`);

    console.log('تم إنشاء جميع البيانات الأولية بنجاح!');
  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء البيانات الأولية:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// تنفيذ السكريبت
seed()
  .then(() => {
    console.log('اكتملت عملية إنشاء البيانات الأولية بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('فشلت عملية إنشاء البيانات الأولية:', error);
    process.exit(1);
  });
