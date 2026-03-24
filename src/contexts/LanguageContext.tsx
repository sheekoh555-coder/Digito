import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.admin': 'Admin',
    'nav.seller': 'Seller Dashboard',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'dashboard.addProduct': 'Add Product',
    'dashboard.withdraw': 'Withdraw',
    'dashboard.price': 'Price',
    'dashboard.commission': 'Commission',
    'dashboard.availableBalance': 'Available Balance',
    'dashboard.requestWithdrawal': 'Request Withdrawal',
    'dashboard.amount': 'Amount ($)',
    'dashboard.method': 'Method',
    'dashboard.accountDetails': 'Account Details',
    'dashboard.withdrawFunds': 'Withdraw Funds',
    'dashboard.myProducts': 'My Products',
    'dashboard.payoutHistory': 'Payout History',
    'dashboard.title': 'Title',
    'dashboard.description': 'Description',
    'dashboard.imageUrl': 'Image URL',
    'dashboard.submitProduct': 'Submit Product',
    'admin.dashboard': 'Admin Dashboard',
    'admin.manage': 'Manage products and platform settings.',
    'admin.payoutRequests': 'Payout Requests',
    'admin.viewCommissions': 'View Commissions',
    'admin.addNewProduct': 'Add New Product',
    'admin.pendingApprovals': 'Pending Approvals',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'commissions.title': 'Commission Dashboard',
    'commissions.totalSales': 'Total Marketplace Sales',
    'commissions.platformProfit': 'Total Platform Profit (10%)',
    'commissions.sellerPayouts': 'Net Seller Payouts (90%)',
    'commissions.salesOverview': 'Sales Overview',
    'commissions.recentTransactions': 'Recent Transactions',
    'commissions.orderId': 'Order ID',
    'commissions.productName': 'Product Name',
    'commissions.sellerName': 'Seller Name',
    'commissions.salePrice': 'Sale Price',
    'commissions.platformFee': 'Platform Fee (10%)',
    'payouts.title': 'Payout Requests',
    'payouts.pending': 'Pending Requests',
    'payouts.history': 'Processed History',
    'payouts.approveMarkPaid': 'Approve & Mark Paid',
    'home.heroTitle': 'Digital excellence,\ndelivered instantly.',
    'home.heroSubtitle': 'Discover premium digital assets, tools, and resources designed to elevate your creative workflow.',
    'home.explore': 'Explore Collection',
    'home.latestArrivals': 'Latest Arrivals',
    'home.viewAll': 'View all',
    'home.soldBy': 'Sold by:',
    'home.noProducts': 'No products found. Add some from the admin panel.',
    'product.buyNow': 'Buy Now',
    'product.description': 'Description',
    'product.seller': 'Seller',
    'product.success': 'Purchase successful! You now have access to this product.',
    'product.backToProducts': 'Back to products',
    'product.noImage': 'No Image',
    'product.instantDownload': 'Instant digital download',
    'product.lifetimeAccess': 'Lifetime access & updates',
    'product.purchaseNow': 'Purchase Now',
    'product.notFound': 'Product not found',
    'product.returnHome': 'Return to home',
    'auth.createAccount': 'Create an account',
    'auth.welcomeBack': 'Welcome back',
    'auth.signUpDesc': 'Sign up to start purchasing digital products.',
    'auth.signInDesc': 'Sign in to access your digital purchases.',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signUp': 'Sign Up',
    'auth.signIn': 'Sign In',
    'auth.alreadyHaveAccount': 'Already have an account? Sign in',
    'auth.dontHaveAccount': "Don't have an account? Sign up",
    'auth.checkEmail': 'Check your email for the confirmation link!',
    'userDashboard.title': 'My Dashboard',
    'userDashboard.welcome': 'Welcome back, ',
    'userDashboard.signOut': 'Sign Out',
    'userDashboard.noPurchases': 'No purchases yet',
    'userDashboard.noPurchasesDesc': 'When you buy digital products, they will appear here for instant download.',
    'userDashboard.wantToSell': 'Want to sell your own products?',
    'userDashboard.wantToSellDesc': 'Join our marketplace as a vendor. Upload your digital assets, reach a wider audience, and keep 90% of your earnings.',
    'userDashboard.becomeSeller': 'Become a Seller',
    'seller.manage': 'Manage your products and withdrawals.',
    'seller.withdrawalRequested': 'Withdrawal requested successfully!',
    'seller.productSubmitted': 'Product submitted successfully!',
    'seller.noWithdrawalHistory': 'No withdrawal history yet.',
    'seller.noProducts': "You haven't submitted any products yet.",
    'seller.net': 'Net:',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.admin': 'لوحة الإدارة',
    'nav.seller': 'لوحة البائع',
    'nav.login': 'تسجيل الدخول',
    'nav.logout': 'تسجيل الخروج',
    'dashboard.addProduct': 'إضافة منتج',
    'dashboard.withdraw': 'سحب',
    'dashboard.price': 'السعر',
    'dashboard.commission': 'العمولة',
    'dashboard.availableBalance': 'الرصيد المتاح',
    'dashboard.requestWithdrawal': 'طلب سحب',
    'dashboard.amount': 'المبلغ ($)',
    'dashboard.method': 'الطريقة',
    'dashboard.accountDetails': 'تفاصيل الحساب',
    'dashboard.withdrawFunds': 'سحب الأموال',
    'dashboard.myProducts': 'منتجاتي',
    'dashboard.payoutHistory': 'سجل السحوبات',
    'dashboard.title': 'العنوان',
    'dashboard.description': 'الوصف',
    'dashboard.imageUrl': 'رابط الصورة',
    'dashboard.submitProduct': 'تقديم المنتج',
    'admin.dashboard': 'لوحة الإدارة',
    'admin.manage': 'إدارة المنتجات وإعدادات المنصة.',
    'admin.payoutRequests': 'طلبات السحب',
    'admin.viewCommissions': 'عرض العمولات',
    'admin.addNewProduct': 'إضافة منتج جديد',
    'admin.pendingApprovals': 'الموافقات المعلقة',
    'admin.approve': 'موافقة',
    'admin.reject': 'رفض',
    'commissions.title': 'لوحة العمولات',
    'commissions.totalSales': 'إجمالي مبيعات السوق',
    'commissions.platformProfit': 'أرباح المنصة (10%)',
    'commissions.sellerPayouts': 'مدفوعات البائعين (90%)',
    'commissions.salesOverview': 'نظرة عامة على المبيعات',
    'commissions.recentTransactions': 'المعاملات الأخيرة',
    'commissions.orderId': 'رقم الطلب',
    'commissions.productName': 'اسم المنتج',
    'commissions.sellerName': 'اسم البائع',
    'commissions.salePrice': 'سعر البيع',
    'commissions.platformFee': 'رسوم المنصة (10%)',
    'payouts.title': 'طلبات السحب',
    'payouts.pending': 'الطلبات المعلقة',
    'payouts.history': 'السجل المعالج',
    'payouts.approveMarkPaid': 'موافقة وتحديد كمدفوع',
    'home.heroTitle': 'التميز الرقمي،\nيتم تسليمه على الفور.',
    'home.heroSubtitle': 'اكتشف الأصول والأدوات والموارد الرقمية المتميزة المصممة للارتقاء بسير عملك الإبداعي.',
    'home.explore': 'استكشف المجموعة',
    'home.latestArrivals': 'أحدث الإضافات',
    'home.viewAll': 'عرض الكل',
    'home.soldBy': 'مباع بواسطة:',
    'home.noProducts': 'لم يتم العثور على منتجات. أضف بعضها من لوحة الإدارة.',
    'product.buyNow': 'اشترِ الآن',
    'product.description': 'الوصف',
    'product.seller': 'البائع',
    'product.success': 'تم الشراء بنجاح! يمكنك الآن الوصول إلى هذا المنتج.',
    'product.backToProducts': 'العودة إلى المنتجات',
    'product.noImage': 'لا توجد صورة',
    'product.instantDownload': 'تنزيل رقمي فوري',
    'product.lifetimeAccess': 'وصول وتحديثات مدى الحياة',
    'product.purchaseNow': 'شراء الآن',
    'product.notFound': 'المنتج غير موجود',
    'product.returnHome': 'العودة إلى الرئيسية',
    'auth.createAccount': 'إنشاء حساب',
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.signUpDesc': 'سجل للبدء في شراء المنتجات الرقمية.',
    'auth.signInDesc': 'سجل الدخول للوصول إلى مشترياتك الرقمية.',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.signUp': 'تسجيل',
    'auth.signIn': 'تسجيل الدخول',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟ تسجيل الدخول',
    'auth.dontHaveAccount': "ليس لديك حساب؟ تسجيل",
    'auth.checkEmail': 'تحقق من بريدك الإلكتروني للحصول على رابط التأكيد!',
    'userDashboard.title': 'لوحة التحكم الخاصة بي',
    'userDashboard.welcome': 'مرحباً بعودتك، ',
    'userDashboard.signOut': 'تسجيل الخروج',
    'userDashboard.noPurchases': 'لا توجد مشتريات بعد',
    'userDashboard.noPurchasesDesc': 'عند شراء منتجات رقمية، ستظهر هنا للتنزيل الفوري.',
    'userDashboard.wantToSell': 'هل تريد بيع منتجاتك الخاصة؟',
    'userDashboard.wantToSellDesc': 'انضم إلى سوقنا كبائع. قم بتحميل أصولك الرقمية، والوصول إلى جمهور أوسع، واحتفظ بـ 90٪ من أرباحك.',
    'userDashboard.becomeSeller': 'أصبح بائعاً',
    'seller.manage': 'إدارة منتجاتك وسحوباتك.',
    'seller.withdrawalRequested': 'تم طلب السحب بنجاح!',
    'seller.productSubmitted': 'تم تقديم المنتج بنجاح!',
    'seller.noWithdrawalHistory': 'لا يوجد سجل سحوبات بعد.',
    'seller.noProducts': "لم تقم بتقديم أي منتجات بعد.",
    'seller.net': 'الصافي:',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
