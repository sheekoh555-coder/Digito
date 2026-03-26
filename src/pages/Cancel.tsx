import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Cancel() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10" />
      </div>
      <h2 className="text-4xl font-semibold tracking-tight text-neutral-900 mb-4">{t('cancel.title')}</h2>
      <p className="text-lg text-neutral-600 max-w-md mb-10">
        {t('cancel.desc')}
      </p>
      
      <Link 
        to="/"
        className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-5 h-5 rtl:rotate-180" /> {t('cancel.returnHome')}
      </Link>
    </div>
  );
}
