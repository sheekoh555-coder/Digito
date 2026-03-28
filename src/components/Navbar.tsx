import { Link } from 'react-router-dom';
import { ShoppingBag, User, Shield, Globe, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-slate-500 hover:text-indigo-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-xl leading-none">D</span>
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">Digito</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={toggleLanguage}
              className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
            {isAdmin && (
              <Link to="/admin" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-md">
                <Shield className="w-4 h-4" />
                <span>{t('nav.admin')}</span>
              </Link>
            )}
            {isSeller && (
              <Link to="/seller" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium">
                <ShoppingBag className="w-4 h-4" />
                <span>{t('nav.seller')}</span>
              </Link>
            )}
            {user ? (
              <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/auth" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
            <button className="text-slate-500 hover:text-indigo-600 transition-colors relative transform hover:scale-110 duration-300">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">0</span>
            </button>
          </div>

          {/* Mobile Cart (Always visible) */}
          <div className="md:hidden flex items-center">
            <button className="text-slate-500 hover:text-indigo-600 transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">0</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white/90 backdrop-blur-xl absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            <button 
              onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
              className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-xl transition-colors flex items-center gap-3 text-base font-medium w-full text-start"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
            {isAdmin && (
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-xl transition-colors flex items-center gap-3 text-base font-medium"
              >
                <Shield className="w-5 h-5" />
                <span>{t('nav.admin')}</span>
              </Link>
            )}
            {isSeller && (
              <Link 
                to="/seller" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-xl transition-colors flex items-center gap-3 text-base font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t('nav.seller')}</span>
              </Link>
            )}
            {user ? (
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-xl transition-colors flex items-center gap-3 text-base font-medium"
              >
                <User className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-3 rounded-xl transition-colors flex items-center gap-3 text-base font-medium"
              >
                <User className="w-5 h-5" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
