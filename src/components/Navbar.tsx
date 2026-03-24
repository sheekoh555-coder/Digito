import { Link } from 'react-router-dom';
import { ShoppingBag, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

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
    <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">D</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">Digito</span>
          </Link>
          <div className="flex items-center gap-6">
            {isAdmin && (
              <Link to="/admin" className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2 text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
            {isSeller && (
              <Link to="/seller" className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2 text-sm font-medium">
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Seller</span>
              </Link>
            )}
            {user ? (
              <Link to="/dashboard" className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link to="/auth" className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
            <button className="text-neutral-500 hover:text-neutral-900 transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center rounded-full">0</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
