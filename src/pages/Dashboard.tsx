import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Bypass login for testing
        setUser({ email: 'guest@example.com' });
      } else {
        setUser(session.user);
      }
      setLoading(false);
    }
    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">My Dashboard</h1>
          <p className="text-neutral-500">Welcome back, {user?.email}</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-neutral-100"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-medium mb-2">No purchases yet</h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          When you buy digital products, they will appear here for instant download.
        </p>
      </div>
    </div>
  );
}
