import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Loader2, Check, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  
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
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-neutral-500">Manage products and platform settings.</p>
        </div>
        <Link 
          to="/admin/commissions" 
          className="bg-white border border-neutral-200 text-neutral-900 px-6 py-3 rounded-xl font-medium hover:bg-neutral-50 transition-colors flex items-center gap-2 shadow-sm"
        >
          View Commissions
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Add New Product</h2>
            <p className="text-neutral-500">Directly create an approved digital product.</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium">
            Product added successfully!
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
              <Plus className="w-5 h-5" /> Add Product
            </>
          )}
        </button>
      </form>
      </div>

      <div>
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Pending Approvals</h2>
          <p className="text-neutral-500">Review products submitted by sellers.</p>
        </div>
        
        <div className="space-y-4">
          {pendingProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-500">
              No pending products to review.
            </div>
          ) : (
            pendingProducts.map(product => (
              <div key={product.id} className="p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-neutral-100 rounded-xl overflow-hidden flex-shrink-0">
                    {product.image_url && <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 truncate">{product.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{product.description}</p>
                    <p className="text-sm font-semibold text-neutral-900 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                  <button 
                    onClick={() => handleProductAction(product.id, 'approved')}
                    className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button 
                    onClick={() => handleProductAction(product.id, 'rejected')}
                    className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" /> Reject
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
