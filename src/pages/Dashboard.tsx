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
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select(`
              id,
              created_at,
              amount,
              status,
              product_id,
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

          if (ordersError) {
            console.error('Error fetching orders:', ordersError);
            
            // Fallback: try with singular 'product' relation name if 'products' fails
            const { data: fallbackOrdersData } = await supabase
              .from('orders')
              .select(`
                id,
                created_at,
                amount,
                status,
                product_id,
                product:products (
                  id,
                  title,
                  image_url,
                  file_url
                )
              `)
              .eq('user_id', session.user.id)
              .in('status', ['completed', 'paid', 'success'])
              .order('created_at', { ascending: false });
              
            if (fallbackOrdersData) {
              setPurchases(fallbackOrdersData);
            }
          } else if (ordersData) {
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
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6 mb-10 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={displayName} className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-lg relative z-10 transform-gpu transition-transform hover:scale-105" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg relative z-10 transform-gpu transition-transform hover:scale-105">
            {displayName?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{t('userDashboard.title')}</h1>
          <p className="text-slate-500 text-lg font-medium">{welcomeMessage}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Admin Section */}
        {isAdmin && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md transform-gpu group-hover:scale-110 transition-transform duration-300">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t('admin.dashboard')}</h2>
            </div>
            <p className="text-slate-500 mb-8 font-medium relative z-10">{t('admin.manage')}</p>
            <div className="flex flex-col gap-3 relative z-10">
              <Link to="/admin" className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2 border border-slate-200/60">
                <ListOrdered className="w-5 h-5" /> {t('admin.pendingApprovals')}
              </Link>
              <Link to="/admin/commissions" className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2 border border-slate-200/60">
                <DollarSign className="w-5 h-5" /> {t('admin.viewCommissions')}
              </Link>
              <Link to="/admin/payouts" className="w-full bg-slate-50 text-slate-700 py-3 rounded-xl font-semibold hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2 border border-slate-200/60">
                <Package className="w-5 h-5" /> {t('admin.payoutRequests')}
              </Link>
            </div>
          </div>
        )}

        {/* Seller Section */}
        {isSeller && (
          <div className="bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md transform-gpu group-hover:scale-110 transition-transform duration-300">
                <Store className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{t('nav.seller')}</h2>
            </div>
            <p className="text-slate-500 mb-8 font-medium relative z-10">{t('seller.manage')}</p>
            <div className="flex flex-col gap-3 relative z-10">
              <Link to="/seller" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
                <Store className="w-5 h-5" /> {t('nav.seller')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Purchases Section */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-8 mb-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t('userDashboard.purchases') || 'My Purchases'}</h2>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100/50 relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm border border-slate-100">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{t('userDashboard.noPurchases')}</h3>
            <p className="text-slate-500 max-w-md mx-auto font-medium">
              {t('userDashboard.noPurchasesDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 perspective-1000">
            {purchases.map((order) => {
              let product = order.products || order.product || {};
              if (Array.isArray(product)) {
                product = product[0] || {};
              }
              return (
                <div key={order.id} className="group border border-slate-200/60 rounded-2xl overflow-hidden bg-white flex flex-col transform-gpu transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img 
                      src={product.image_url || `https://picsum.photos/seed/${product.id}/800/600`} 
                      alt={product.title || 'Product'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow relative z-10 bg-white">
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.title || 'Unknown Product'}</h3>
                    <p className="text-sm text-slate-500 mb-6 font-medium">
                      Purchased on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-black text-slate-900">{formatCurrency(order.amount)}</span>
                      {product.file_url ? (
                        <button 
                          onClick={() => handleDownload(product.id, product.file_url)}
                          disabled={downloadingId === product.id}
                          className="text-sm font-bold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                        >
                          {downloadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download'}
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">No file</span>
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
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3">{t('userDashboard.wantToSell')}</h2>
            <p className="text-slate-300 max-w-md text-lg">
              {t('userDashboard.wantToSellDesc')}
            </p>
          </div>
          <button 
            onClick={handleBecomeSeller}
            disabled={becomingSeller}
            className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 flex items-center gap-3 whitespace-nowrap disabled:opacity-70 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {becomingSeller ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
            {t('userDashboard.becomeSeller')}
          </button>
        </div>
      )}
    </div>
  );
}
