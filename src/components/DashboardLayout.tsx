import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Shield, Settings, LogOut, Globe, Package, CreditCard, Users, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    const checkUserRoles = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin, is_seller')
          .eq('id', userId)
          .single();
        setIsAdmin(!!data?.is_admin);
        setIsSeller(!!data?.is_seller);
      } catch (err) {
        console.error('Error checking user roles:', err);
        setIsAdmin(false);
        setIsSeller(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      } else {
        setIsAdmin(false);
        setIsSeller(false);
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('userDashboard.title') || 'Dashboard' },
    ...(isSeller ? [{ path: '/seller', icon: Store, label: t('nav.seller') || 'Seller Dashboard' }] : []),
    ...(isAdmin ? [
      { path: '/admin', icon: Shield, label: t('nav.admin') || 'Admin' },
      { path: '/admin/commissions', icon: CreditCard, label: 'Commissions' },
      { path: '/admin/payouts', icon: Users, label: 'Payouts' },
    ] : []),
    { path: '/settings', icon: Settings, label: t('nav.settings') || 'Settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 text-white group">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
            <span className="font-bold text-xl leading-none">D</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">Digito</span>
        </Link>
        <button 
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-400 font-medium shadow-inner border border-indigo-500/10' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/50 space-y-2 bg-slate-900/30">
        <button 
          onClick={() => { toggleLanguage(); setIsMobileSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800/50 hover:text-white transition-all duration-300 text-slate-400 ${language === 'ar' ? 'text-right' : 'text-left'}`}
        >
          <Globe className="w-5 h-5" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
        <button 
          onClick={handleSignOut}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 text-slate-400 ${language === 'ar' ? 'text-right' : 'text-left'}`}
        >
          <LogOut className="w-5 h-5" />
          <span>{t('userDashboard.signOut') || 'Sign Out'}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className={`flex min-h-screen bg-slate-50 ${language === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl leading-none">D</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
           {/* Add any mobile header actions here if needed */}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50
        w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}
      `}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 pt-16 lg:pt-0 ${language === 'ar' ? 'lg:mr-72' : 'lg:ml-72'}`}>
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
