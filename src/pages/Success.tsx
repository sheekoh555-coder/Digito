import { Link } from 'react-router-dom';
import { CheckCircle, Download, Home } from 'lucide-react';

export default function Success() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4" dir="rtl">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <CheckCircle className="w-12 h-12" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        شكراً لشرائك!
      </h1>
      
      <p className="text-lg text-slate-600 max-w-md mb-12">
        تم تأكيد عملية الدفع بنجاح. يمكنك الآن تحميل ملفك الرقمي من خلال الزر أدناه.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          className="flex-1 bg-indigo-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          onClick={() => alert('هذا زر تحميل تجريبي (Placeholder)')}
        >
          <Download className="w-5 h-5" /> 
          <span>تحميل الملف الآن</span>
        </button>
        
        <Link 
          to="/"
          className="flex-1 bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
        >
          <Home className="w-5 h-5" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    </div>
  );
}
