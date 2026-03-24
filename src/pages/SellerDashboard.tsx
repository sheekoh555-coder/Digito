import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SellerDashboard() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingSeller, setIsCheckingSeller] = useState(true);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image_url: ''
  });

  useEffect(() => {
    const checkSeller = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      setUserId(session.user.id);

      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_seller')
          .eq('id', session.user.id)
          .single();
          
        if (!data?.is_seller) {
          navigate('/');
        } else {
          setIsCheckingSeller(false);
          fetchMyProducts(session.user.id);
        }
      } catch (err) {
        console.error('Error checking seller status:', err);
        navigate('/');
      }
    };
    
    checkSeller();
  }, [navigate]);

  const fetchMyProducts = async (uid: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', uid)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setMyProducts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
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
            image_url: formData.image_url || `https://picsum.photos/seed/${encodeURIComponent(formData.title)}/800/600`,
            seller_id: userId,
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({ title: '', description: '', price: '', image_url: '' });
      fetchMyProducts(userId);
    } catch (err: any) {
      setError(err.message || 'Failed to submit product');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSeller) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Seller Dashboard</h1>
          <p className="text-neutral-500">Submit a new digital product for approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
              Product submitted successfully! Waiting for admin approval.
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
              Product Title
            </label>
            <input
              type="text"
              id="title"
              required
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              placeholder="e.g. Minimalist UI Kit"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
              placeholder="Describe the product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-2">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-neutral-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="image_url"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" /> Submit for Approval
              </>
            )}
          </button>
        </form>
      </div>

      <div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">My Products</h2>
          <p className="text-neutral-500">Track the status of your submissions.</p>
        </div>
        
        <div className="space-y-4">
          {myProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-500">
              You haven't submitted any products yet.
            </div>
          ) : (
            myProducts.map(product => (
              <div key={product.id} className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                  {product.image_url && <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 truncate">{product.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Price: ${product.price.toFixed(2)} 
                    <span className="text-green-600 font-medium ml-3 bg-green-50 px-2 py-0.5 rounded-md">
                      Net: ${(product.price * 0.9).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div>
                  {product.status === 'approved' && <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg"><CheckCircle className="w-3 h-3"/> Approved</span>}
                  {product.status === 'pending' && <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg"><Clock className="w-3 h-3"/> Pending</span>}
                  {product.status === 'rejected' && <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg"><XCircle className="w-3 h-3"/> Rejected</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
