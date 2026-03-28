import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Loader2, Check, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: ''
  });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!data?.is_admin) {
          navigate('/');
        } else {
          setIsCheckingAdmin(false);
          fetchPendingProducts();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  const fetchPendingProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPendingProducts(data);
    }
  };

  const handleProductAction = async (productId: string, action: 'approved' | 'rejected') => {
    try {
      // Status column removed for now
      // const { error } = await supabase
      //   .from('products')
      //   .update({ status: action })
      //   .eq('id', productId);
        
      // if (error) throw error;
      
      // Remove from list
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert('Failed to update product status.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            image_url: formData.image_url || `https://picsum.photos/seed/${encodeURIComponent(formData.title)}/800/600`
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({ title: '', description: '', price: '', image_url: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{t('admin.dashboard')}</h1>
          <p className="text-slate-500">{t('admin.manage')}</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link 
            to="/admin/payouts" 
            className="bg-white border border-slate-200/60 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {t('admin.payoutRequests')}
          </Link>
          <Link 
            to="/admin/commissions" 
            className="bg-white border border-slate-200/60 text-slate-700 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {t('admin.viewCommissions')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Add Product Form */}
        <div className="relative group perspective-1000">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl transform translate-y-2 scale-[0.98] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 relative z-10 overflow-hidden transform-gpu group-hover:rotate-x-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="mb-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">{t('admin.addNewProduct')}</h2>
              <p className="text-slate-500 text-sm">Directly create an approved digital product.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-2xl text-sm font-medium border border-red-100/50 flex items-start gap-3">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="p-4 bg-emerald-50/80 backdrop-blur-sm text-emerald-600 rounded-2xl text-sm font-medium border border-emerald-100/50 flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>Product added successfully!</p>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('dashboard.title')}
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white"
                    placeholder="e.g. Minimalist UI Kit"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    {t('dashboard.description')}
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white resize-none"
                    placeholder="Describe the product..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('dashboard.price')}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input
                        type="number"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="image_url" className="block text-sm font-semibold text-slate-700 mb-2">
                      {t('dashboard.imageUrl')} <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      id="image_url"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" /> {t('dashboard.addProduct')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">{t('admin.pendingApprovals')}</h2>
            <p className="text-slate-500 text-sm">Review products submitted by sellers.</p>
          </div>
          
          <div className="space-y-4">
            {pendingProducts.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/60 text-slate-500 shadow-sm flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-medium text-slate-600">No pending products</p>
                <p className="text-sm text-slate-400 mt-1">All caught up!</p>
              </div>
            ) : (
              pendingProducts.map(product => (
                <div key={product.id} className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200/50 group-hover:shadow-inner transition-shadow">
                      {product.image_url && <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{product.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleProductAction(product.id, 'approved')}
                      className="flex-1 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl font-semibold hover:bg-emerald-100 hover:shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4" /> {t('admin.approve')}
                    </button>
                    <button 
                      onClick={() => handleProductAction(product.id, 'rejected')}
                      className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl font-semibold hover:bg-red-100 hover:shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" /> {t('admin.reject')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
