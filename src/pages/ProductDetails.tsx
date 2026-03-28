import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowLeft, Check, Download, Store } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setProduct(data);
      } else {
        // Fallback mock data for testing without database
        setProduct({
          id: id,
          title: 'Premium Digital Asset',
          description: 'This is a high-quality digital product designed to elevate your workflow. Includes lifetime updates and instant download.',
          price: 49.99,
          image_url: `https://picsum.photos/seed/${id}/800/600`,
          seller_id: 'mock-seller-id'
        });
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handlePurchase = async () => {
    if (!product) return;
    
    try {
      setPurchasing(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine currency based on language or formatCurrency logic
      // Assuming Arabic uses EGP and English uses USD
      const currency = formatCurrency(1).includes('ج.م') ? 'egp' : 'usd';
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          price: product.price,
          title: product.title,
          userId: user?.id || 'anonymous',
          origin: window.location.origin,
          currency
        }),
      });

      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      alert('Failed to initiate checkout. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse max-w-5xl mx-auto py-8">
        <div className="h-8 w-24 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
          <div className="space-y-4 pt-4">
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-24 bg-slate-200 rounded w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900">{t('product.notFound')}</h2>
        <Link to="/" className="text-slate-500 hover:text-indigo-600 underline transition-colors">{t('product.returnHome')}</Link>
      </div>
    );
  }

  const sellerName = product.profiles?.full_name || product.profiles?.username || product.profiles?.email || 'Verified Seller';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-medium group">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180 transform group-hover:-translate-x-1 transition-transform" /> {t('product.backToProducts')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start perspective-1000">
        <div className="bg-white aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200/60 shadow-xl shadow-indigo-500/5 transform-gpu transition-all duration-500 hover:rotate-y-2 hover:rotate-x-2 relative group">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
              {t('product.noImage')}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        <div className="pt-4 lg:pl-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100 shadow-sm">
            <Store className="w-4 h-4" />
            <span className="text-sm font-semibold">{sellerName}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
            {product.title}
          </h1>
          <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 inline-block">
            {formatCurrency(product.price)}
          </div>
          
          <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="space-y-4 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4">What's included</h3>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{t('product.instantDownload')}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{t('product.lifetimeAccess')}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-medium">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{t('product.securePayment') || 'Secure Payment'}</span>
            </div>
          </div>

          <button 
            onClick={handlePurchase}
            disabled={purchasing}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {purchasing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-6 h-6" />
            )}
            {purchasing ? t('product.processing') || 'Processing...' : t('product.purchaseNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
