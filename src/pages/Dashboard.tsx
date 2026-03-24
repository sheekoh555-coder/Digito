import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Store, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [becomingSeller, setBecomingSeller] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      } else {
        setUser(session.user);
        
        // Check seller status
        try {
          const { data } = await supabase
            .from('profiles')
            .select('is_seller')
            .eq('id', session.user.id)
            .single();
          setIsSeller(!!data?.is_seller);
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
      setLoading(false);
    }
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleBecomeSeller = async () => {
    if (!user) return;
    setBecomingSeller(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_seller: true })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsSeller(true);
      navigate('/seller');
    } catch (err) {
      console.error('Error becoming seller:', err);
      alert('Failed to update seller status. Please try again.');
    } finally {
      setBecomingSeller(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">{t('userDashboard.title')}</h1>
          <p className="text-neutral-500">{t('userDashboard.welcome')}{user?.email}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100"
        >
          <LogOut className="w-4 h-4 rtl:rotate-180" /> {t('userDashboard.signOut')}
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center mb-8">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-medium mb-2">{t('userDashboard.noPurchases')}</h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          {t('userDashboard.noPurchasesDesc')}
        </p>
      </div>

      {!isSeller && (
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{t('userDashboard.wantToSell')}</h2>
            <p className="text-neutral-400 max-w-md">
              {t('userDashboard.wantToSellDesc')}
            </p>
          </div>
          <button 
            onClick={handleBecomeSeller}
            disabled={becomingSeller}
            className="bg-white text-neutral-900 px-6 py-3 rounded-xl font-medium hover:bg-neutral-100 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
          >
            {becomingSeller ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
            {t('userDashboard.becomeSeller')}
          </button>
        </div>
      )}
    </div>
  );
}
