import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  status?: string;
  seller_id?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(*)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        // Fallback mock data for testing without database
        setProducts([
          { id: '1', title: 'Minimalist UI Kit', description: 'A clean and modern UI kit for your next project.', price: 49.99, image_url: 'https://picsum.photos/seed/ui/800/600' },
          { id: '2', title: 'Procreate Brushes', description: 'High-quality brushes for digital artists.', price: 19.99, image_url: 'https://picsum.photos/seed/brush/800/600' },
          { id: '3', title: 'Notion Templates', description: 'Organize your life and work with these templates.', price: 29.99, image_url: 'https://picsum.photos/seed/notion/800/600' }
        ]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-neutral-900 mb-6">
          Digital excellence,<br />delivered instantly.
        </h1>
        <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto mb-10 font-light">
          Discover premium digital assets, tools, and resources designed to elevate your creative workflow.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-neutral-900 text-white px-8 py-4 rounded-full font-medium hover:bg-neutral-800 transition-colors">
            Explore Collection
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section>
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-semibold tracking-tight">Latest Arrivals</h2>
          <Link to="/" className="text-neutral-500 hover:text-neutral-900 font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 aspect-[4/3] rounded-2xl mb-4"></div>
                <div className="h-6 bg-neutral-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group block">
                <div className="bg-neutral-100 aspect-[4/3] rounded-2xl mb-4 overflow-hidden relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Sold by: {(product as any).profiles?.full_name || (product as any).profiles?.username || (product as any).profiles?.email || 'Verified Seller'}
                    </p>
                    <p className="text-sm text-neutral-500 mt-2 line-clamp-1">{product.description}</p>
                  </div>
                  <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-neutral-50 rounded-3xl border border-neutral-100">
            <p className="text-neutral-500">No products found. Add some from the admin panel.</p>
          </div>
        )}
      </section>
    </div>
  );
}
