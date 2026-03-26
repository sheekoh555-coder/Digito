import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl);
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        setStatus('error');
      }
    }

    verifySession();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-neutral-900 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold text-neutral-900">{t('success.verifying')}</h2>
        <p className="text-neutral-500 mt-2">{t('success.dontClose')}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl font-bold">!</span>
        </div>
        <h2 className="text-3xl font-semibold text-neutral-900 mb-4">{t('success.failed')}</h2>
        <p className="text-neutral-600 max-w-md mb-8">
          {t('success.failedDesc')}
        </p>
        <Link 
          to="/"
          className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors"
        >
          {t('success.returnHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10" />
      </div>
      <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-4">{t('success.title')}</h2>
      <p className="text-lg text-neutral-600 max-w-md mb-10">
        {t('success.desc')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        {downloadUrl ? (
          <a 
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-neutral-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> {t('success.download')}
          </a>
        ) : (
          <button disabled className="flex-1 bg-neutral-300 text-neutral-500 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed">
            <Download className="w-5 h-5" /> {t('success.download')}
          </button>
        )}
        <Link 
          to="/"
          className="flex-1 bg-neutral-100 text-neutral-900 px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
        >
          {t('success.continue')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
