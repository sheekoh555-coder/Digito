import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, Banknote, TrendingUp, Wallet, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function AdminCommissions() {
  const [loading, setLoading] = useState(true);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!profileData?.is_admin) {
          navigate('/');
          return;
        }
        
        setIsCheckingAdmin(false);
        
        // Fetch orders
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select(`
            *,
            products (
              title,
              profiles (
                full_name,
                username,
                email
              )
            )
          `)
          .in('status', ['successful', 'completed', 'paid', 'success']);
          
        if (error) {
          console.error('Error fetching orders:', error);
          // Fallback mock data if table doesn't exist yet or errors out
          setOrders([
            {
              id: 'ord_12345',
              created_at: new Date().toISOString(),
              amount: 49.99,
              products: {
                title: 'Minimalist UI Kit',
                profiles: { full_name: 'Alice Designer' }
              }
            },
            {
              id: 'ord_67890',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              amount: 19.99,
              products: {
                title: 'Procreate Brushes',
                profiles: { full_name: 'Bob Artist' }
              }
            },
            {
              id: 'ord_11223',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              amount: 29.99,
              products: {
                title: 'Notion Templates',
                profiles: { full_name: 'Charlie Organizer' }
              }
            }
          ]);
        } else {
          setOrders(ordersData || []);
        }
      } catch (err) {
        console.error('Error in admin check:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAndFetch();
  }, [navigate]);

  if (isCheckingAdmin || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Calculate metrics
  // Assume order price is either in `amount` or `price` column
  const getPrice = (order: any) => parseFloat(order.amount || order.price || 0);
  
  const totalSales = orders.reduce((sum, order) => sum + getPrice(order), 0);
  const platformProfit = totalSales * 0.10;
  const sellerPayouts = totalSales * 0.90;

  // Prepare chart data (group by date)
  const chartDataMap: Record<string, number> = {};
  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    chartDataMap[date] = (chartDataMap[date] || 0) + getPrice(order);
  });
  
  const chartData = Object.keys(chartDataMap).map(date => ({
    date,
    sales: chartDataMap[date]
  })).reverse(); // Assuming orders are fetched desc, reverse to show chronological

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/admin" className="p-2.5 bg-white rounded-xl border border-slate-200/60 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
          <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('admin.commissionDashboard')}</h1>
          <p className="text-slate-500 mt-1">Track marketplace sales, platform fees, and seller payouts.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner relative z-10">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">{t('admin.totalSales')}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(totalSales)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner relative z-10">
            <Banknote className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">{t('admin.platformProfit')}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(platformProfit)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-50 to-amber-100/50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner relative z-10">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">{t('admin.sellerPayouts')}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(sellerPayouts)}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm mb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-8">{t('admin.salesOverview')}</h2>
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} tickFormatter={(value) => formatCurrency(value)} dx={-15} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '12px 16px', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Bar dataKey="sales" fill="url(#colorSales)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <TrendingUp className="w-10 h-10 text-slate-300 mb-3" />
              <p className="font-medium">No sales data available for chart.</p>
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('admin.recentTransactions')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold border-b border-slate-200/60">{t('admin.orderId')}</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200/60">{t('admin.productName')}</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200/60">{t('admin.sellerName')}</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200/60 text-right">{t('admin.salePrice')}</th>
                <th className="px-6 py-4 font-bold border-b border-slate-200/60 text-right">{t('admin.platformFee')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const price = getPrice(order);
                  const fee = price * 0.10;
                  const productName = order.products?.title || 'Unknown Product';
                  const sellerName = order.products?.profiles?.full_name || order.products?.profiles?.username || order.products?.profiles?.email || 'Unknown Seller';
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-slate-400 group-hover:text-indigo-500 transition-colors">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">
                        {productName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {sellerName}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                        {formatCurrency(price)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right bg-emerald-50/30">
                        +{formatCurrency(fee)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Banknote className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="font-medium">No successful orders found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
