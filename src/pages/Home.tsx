import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowRight, Sparkles, Layers, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      console.log('Fetched products:', data, 'Error:', error);
      
      if (error) {
        console.error('Error fetching products:', error);
        // Fallback mock data for testing without database
        setProducts([
          { id: '1', title: 'Minimalist UI Kit', description: 'A clean and modern UI kit for your next project.', price: 49.99, image_url: 'https://picsum.photos/seed/ui/800/600' },
          { id: '2', title: 'Procreate Brushes', description: 'High-quality brushes for digital artists.', price: 19.99, image_url: 'https://picsum.photos/seed/brush/800/600' },
          { id: '3', title: 'Notion Templates', description: 'Organize your life and work with these templates.', price: 29.99, image_url: 'https://picsum.photos/seed/notion/800/600' },
          { id: '4', title: '3D Icon Pack', description: 'Premium 3D icons for modern interfaces.', price: 39.99, image_url: 'https://picsum.photos/seed/3d/800/600' }
        ]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-white"></div>
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-purple-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob"></div>
        <div className="absolute top-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000"></div>

        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Discover Premium Digital Assets</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 whitespace-pre-line leading-tight">
            {t('home.heroTitle')}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            {t('home.heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
              <Layers className="w-5 h-5" />
              {t('home.explore')}
            </button>
            <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-medium hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Start Selling
            </button>
          </div>
        </div>

        {/* 3D Floating Elements (Decorative) */}
        <div className="hidden lg:block absolute top-1/2 left-10 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-2xl transform -rotate-12 animate-float opacity-80 backdrop-blur-md"></div>
        <div className="hidden lg:block absolute top-1/3 right-10 w-24 h-24 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full shadow-2xl transform rotate-12 animate-float-delayed opacity-80 backdrop-blur-md"></div>
      </section>

      {/* Products Grid */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">{t('home.latestArrivals')}</h2>
            <p className="text-slate-500 font-medium">Curated digital products for creators</p>
          </div>
          <Link to="/" className="hidden sm:flex text-indigo-600 hover:text-indigo-700 font-medium items-center gap-1 transition-colors group">
            {t('home.viewAll')} <ArrowRight className="w-4 h-4 rtl:rotate-180 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 aspect-[4/3] rounded-2xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 perspective-1000">
            {products.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`} 
                className="group block relative transform-gpu transition-all duration-500 hover:-translate-y-2 hover:rotate-x-2 hover:rotate-y-2"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500 h-full flex flex-col relative z-10">
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                    {/* Glassmorphism overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col justify-between bg-white relative z-20 transform translate-z-10">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mt-1 mb-3">
                        {t('home.soldBy')} {(product as any).profiles?.full_name || (product as any).profiles?.username || (product as any).profiles?.email || 'Verified Seller'}
                      </p>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <span className="text-xl font-black text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                        {formatCurrency(product.price)}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* 3D Shadow effect */}
                <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl transform translate-y-4 scale-95 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500">{t('home.noProducts')}</p>
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/" className="inline-flex text-indigo-600 hover:text-indigo-700 font-medium items-center gap-2 transition-colors bg-indigo-50 px-6 py-3 rounded-xl">
            {t('home.viewAll')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}
