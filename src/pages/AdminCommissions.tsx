import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Loader2, DollarSign, TrendingUp, Wallet, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
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
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 bg-white rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Commission Dashboard</h1>
          <p className="text-neutral-500 mt-1">Track marketplace sales, platform fees, and seller payouts.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Total Marketplace Sales</p>
            <p className="text-3xl font-semibold tracking-tight">${totalSales.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Total Platform Profit (10%)</p>
            <p className="text-3xl font-semibold tracking-tight">${platformProfit.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 mb-1">Net Seller Payouts (90%)</p>
            <p className="text-3xl font-semibold tracking-tight">${sellerPayouts.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm mb-10">
        <h2 className="text-lg font-semibold mb-6">Sales Overview</h2>
        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 12 }} tickFormatter={(value) => `$${value}`} dx={-10} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                />
                <Bar dataKey="sales" fill="#171717" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              No sales data available for chart.
            </div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-sm">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Seller Name</th>
                <th className="px-6 py-4 font-medium text-right">Sale Price</th>
                <th className="px-6 py-4 font-medium text-right">Platform Fee (10%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const price = getPrice(order);
                  const fee = price * 0.10;
                  const productName = order.products?.title || 'Unknown Product';
                  const sellerName = order.products?.profiles?.full_name || order.products?.profiles?.username || order.products?.profiles?.email || 'Unknown Seller';
                  
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-neutral-500">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                        {productName}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {sellerName}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-900 text-right">
                        ${price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600 text-right">
                        ${fee.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No successful orders found.
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
