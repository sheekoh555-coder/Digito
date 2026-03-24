import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowLeft, Check, Download, Store } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(*)')
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
          image_url: `https://picsum.photos/seed/${id}/800/600`
        });
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse max-w-5xl mx-auto py-8">
        <div className="h-8 w-24 bg-neutral-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-neutral-200 rounded-3xl"></div>
          <div className="space-y-4 pt-4">
            <div className="h-10 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-24 bg-neutral-200 rounded w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold mb-4">{t('product.notFound')}</h2>
        <Link to="/" className="text-neutral-500 hover:text-neutral-900 underline">{t('product.returnHome')}</Link>
      </div>
    );
  }

  const sellerName = product.profiles?.full_name || product.profiles?.username || product.profiles?.email || 'Verified Seller';

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('product.backToProducts')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="bg-neutral-100 aspect-[4/3] rounded-3xl overflow-hidden">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              {t('product.noImage')}
            </div>
          )}
        </div>

        <div className="pt-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-4">
            <Store className="w-4 h-4" />
            <span className="text-sm font-medium">{sellerName}</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-4">
            {product.title}
          </h1>
          <div className="text-3xl font-light text-neutral-900 mb-8">
            ${product.price.toFixed(2)}
          </div>
          
          <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-neutral-600">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{t('product.instantDownload')}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>{t('product.lifetimeAccess')}</span>
            </div>
          </div>

          <button className="w-full bg-neutral-900 text-white py-4 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 text-lg">
            <Download className="w-5 h-5" /> {t('product.purchaseNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
