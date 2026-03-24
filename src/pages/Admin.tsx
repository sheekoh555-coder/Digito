import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
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
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [navigate]);

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
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Add New Product</h1>
        <p className="text-neutral-500">Create a new digital product listing in the store.</p>
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
  );
}
