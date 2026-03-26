import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Package, Store, Loader2, Settings as SettingsIcon, ShieldAlert, DollarSign, ListOrdered } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [becomingSeller, setBecomingSeller] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t, language, formatCurrency } = useLanguage();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      } else {
        setUser(session.user);
        
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data);

          // Fetch purchases
          const { data: ordersData } = await supabase
            .from('orders')
            .select(`
              id,
              created_at,
              amount,
              status,
              products (
                id,
                title,
                image_url,
                file_url
              )
            `)
            .eq('user_id', session.user.id)
            .in('status', ['completed', 'paid', 'success'])
            .order('created_at', { ascending: false });

          if (ordersData) {
            setPurchases(ordersData);
          }

        } catch (err) {
          console.error('Error fetching profile/purchases:', err);
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

  const handleDownload = async (productId: string, fileUrl: string) => {
    if (!fileUrl) return;
    setDownloadingId(productId);
    try {
      const { data, error } = await supabase
        .storage
        .from('product-files')
        .createSignedUrl(fileUrl, 86400); // 24 hours

      if (error) throw error;
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err) {
      console.error('Error generating download link:', err);
      alert('Failed to generate download link. Please try again later.');
    } finally {
      setDownloadingId(null);
    }
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
      
      setProfile({ ...profile, is_seller: true });
      navigate('/seller');
    } catch (err) {
      console.error('Error becoming seller:', err);
      alert('Failed to update seller status. Please try again.');
    } finally {
      setBecomingSeller(false);
    }
  };

  if (loading) return null;

  const isSeller = profile?.is_seller;
  const isAdmin = profile?.is_admin;
  const displayName = profile?.full_name || user?.email;
  const welcomeMessage = language === 'ar' ? `أهلاً يا ${displayName}` : `Welcome back, ${displayName}`;

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div className="flex items-center gap-4">
          {profile?.avatar_url && (
            <img src={profile.avatar_url} alt={displayName} className="w-16 h-16 rounded-full object-cover border border-neutral-200" />
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">{t('userDashboard.title')}</h1>
            <p className="text-neutral-500 text-lg">{welcomeMessage}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/settings"
            className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100"
          >
            <SettingsIcon className="w-4 h-4" /> {t('nav.settings') || 'Settings'}
          </Link>
          <button 
            onClick={handleSignOut}
            className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100"
          >
            <LogOut className="w-4 h-4 rtl:rotate-180" /> {t('userDashboard.signOut')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Admin Section */}
        {isAdmin && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t('admin.dashboard')}</h2>
            </div>
            <p className="text-neutral-500 mb-6">{t('admin.manage')}</p>
            <div className="flex flex-col gap-3">
              <Link to="/admin" className="w-full bg-neutral-100 text-neutral-900 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                <ListOrdered className="w-4 h-4" /> {t('admin.pendingApprovals')}
              </Link>
              <Link to="/admin/commissions" className="w-full bg-neutral-100 text-neutral-900 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                <DollarSign className="w-4 h-4" /> {t('admin.viewCommissions')}
              </Link>
              <Link to="/admin/payouts" className="w-full bg-neutral-100 text-neutral-900 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
                <Package className="w-4 h-4" /> {t('admin.payoutRequests')}
              </Link>
            </div>
          </div>
        )}

        {/* Seller Section */}
        {isSeller && (
          <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t('nav.seller')}</h2>
            </div>
            <p className="text-neutral-500 mb-6">{t('seller.manage')}</p>
            <div className="flex flex-col gap-3">
              <Link to="/seller" className="w-full bg-neutral-900 text-white py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                <Store className="w-4 h-4" /> {t('nav.seller')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Purchases Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-neutral-100 text-neutral-600 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold">{t('userDashboard.purchases') || 'My Purchases'}</h2>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('userDashboard.noPurchases')}</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              {t('userDashboard.noPurchasesDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((order) => {
              const product = order.products || {};
              return (
                <div key={order.id} className="border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col">
                  <div className="aspect-[4/3] bg-neutral-100 relative">
                    <img 
                      src={product.image_url || `https://picsum.photos/seed/${product.id}/800/600`} 
                      alt={product.title || 'Product'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg text-neutral-900 mb-1 line-clamp-1">{product.title || 'Unknown Product'}</h3>
                    <p className="text-sm text-neutral-500 mb-4">
                      Purchased on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <span className="font-medium text-neutral-900">{formatCurrency(order.amount)}</span>
                      {product.file_url ? (
                        <button 
                          onClick={() => handleDownload(product.id, product.file_url)}
                          disabled={downloadingId === product.id}
                          className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-70 flex items-center gap-2"
                        >
                          {downloadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download'}
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400 italic">No file available</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isSeller && !isAdmin && (
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
