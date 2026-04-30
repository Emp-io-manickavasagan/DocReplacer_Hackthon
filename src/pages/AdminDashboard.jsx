import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  limit,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Helmet } from 'react-helmet-async';
import { 
  Users, 
  MousePointer2, 
  FileText, 
  Download, 
  MessageSquare, 
  Lock, 
  LogOut, 
  TrendingUp,
  ChevronRight,
  Star,
  Trash2,
  Zap
} from 'lucide-react';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Stats state
  const [stats, setStats] = useState({
    uniqueVisitors: 0,
    totalVisits: 0,
    returningUsers: 0,
    totalPrompts: 0,
    totalGenerations: 0,
    totalDownloads: 0,
  });
  const [feedbacks, setFeedbacks] = useState([]);

  // Auth check
  const handleLogin = (e) => {
    e.preventDefault();
    const envUser = import.meta.env.VITE_ADMIN_USER;
    const envPass = import.meta.env.VITE_ADMIN_PASS;

    if (!envUser || !envPass) {
      setError('Configuration Error: Admin credentials are not set in the environment variables.');
      return;
    }

    if (username === envUser && password === envPass) {
      setIsLoggedIn(true);
      setError('');
      fetchData();
    } else {
      setError('Invalid credentials');
    }
  };

  const fetchData = async () => {
    if (!db) return;
    setLoading(true);
    try {
      // 1. Unique Visitors from stats/aggregates
      const aggregateRef = doc(db, 'stats', 'aggregates');
      const aggregateSnap = await getDoc(aggregateRef);
      const uniqueNum = aggregateSnap.exists() ? aggregateSnap.data().uniqueVisitors || 0 : 0;

      // 2. Aggregate data from users collection
      const usersSnap = await getDocs(collection(db, 'users'));
      let tVisits = 0;
      let rUsers = 0;
      let tPrompts = 0;
      let tGens = 0;
      let tDowns = 0;

      usersSnap.forEach((doc) => {
        const data = doc.data();
        tVisits += (data.visitCount || 0);
        if ((data.visitCount || 0) > 1) rUsers++;
        tPrompts += (data.promptCount || 0);
        tGens += (data.buildDocxCount || 0);
        tDowns += (data.downloadCount || 0);
      });

      setStats({
        uniqueVisitors: uniqueNum,
        totalVisits: tVisits,
        returningUsers: rUsers,
        totalPrompts: tPrompts,
        totalGenerations: tGens,
        totalDownloads: tDowns,
      });

      // 3. Fetch Feedbacks
      const feedbackQuery = query(
        collection(db, 'downloadFeedback'), 
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const feedbackSnap = await getDocs(feedbackQuery);
      const feedbackList = [];
      feedbackSnap.forEach((doc) => {
        feedbackList.push({ id: doc.id, ...doc.data() });
      });
      setFeedbacks(feedbackList);

    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("Are you SURE you want to clear ALL analytics data? This will reset all stats to 0. This cannot be undone.")) return;
    
    setLoading(true);
    try {
      const batchDelete = async (colName) => {
        const snap = await getDocs(collection(db, colName));
        const chunks = [];
        for (let i = 0; i < snap.docs.length; i += 500) {
          chunks.push(snap.docs.slice(i, i + 500));
        }
        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      };

      await batchDelete('users');
      await batchDelete('downloadFeedback');
      await setDoc(doc(db, 'stats', 'aggregates'), { uniqueVisitors: 0 });

      await fetchData();
      alert("All data cleared successfully.");
    } catch (err) {
      console.error("Error clearing data:", err);
      alert("Error clearing data. Check console.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if session already exists (simple implementation)
    const saved = localStorage.getItem('admin_session');
    if (saved === 'true') {
      setIsLoggedIn(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('admin_session', 'true');
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <Helmet>
          <title>Admin Portal | DocReplacer</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
              <Lock className="text-blue-400 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight text-center">Admin Portal</h1>
            <p className="text-gray-400 mt-2 text-center">Enter your credentials to access the statistics</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
            
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 md:p-8 font-sans">
      <Helmet>
        <title>Analytics Dashboard | Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <nav className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
            <TrendingUp className="text-indigo-400 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">System Analytics</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={fetchData}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Refresh Data
          </button>
          <button 
            onClick={handleClearData}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all text-sm font-medium"
          >
            <Trash2 size={16} /> Clear Data
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto space-y-8 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400">Syncing with database...</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
              <StatCard 
                title="Unique Visitors" 
                value={stats.uniqueVisitors} 
                icon={<Users className="text-blue-400" />} 
                color="blue"
              />
              <StatCard 
                title="Total Visits" 
                value={stats.totalVisits} 
                icon={<MousePointer2 className="text-emerald-400" />} 
                color="emerald"
                subtitle={`${stats.returningUsers} returning users`}
              />
              <StatCard 
                title="Prompts Started" 
                value={stats.totalPrompts} 
                icon={<Zap className="text-yellow-400" />} 
                color="yellow"
              />
              <StatCard 
                title="Documents Generated" 
                value={stats.totalGenerations} 
                icon={<FileText className="text-orange-400" />} 
                color="orange"
              />
              <StatCard 
                title="Total Downloads" 
                value={stats.totalDownloads} 
                icon={<Download className="text-purple-400" />} 
                color="purple"
              />
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feedback List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <MessageSquare size={20} className="text-blue-400" />
                    Recent Feedback
                  </h3>
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Showing last 50</span>
                </div>
                
                <div className="space-y-3">
                  {feedbacks.length > 0 ? feedbacks.map((fb) => (
                    <div key={fb.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={14} 
                                className={`${i < (fb.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-mono">#{fb.visitorId?.slice(0, 8)}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {fb.createdAt?.toDate ? fb.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed italic">
                        "{fb.comment || "No comment provided"}"
                      </p>
                    </div>
                  )) : (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                      <p className="text-gray-500">No feedback entries found yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-lg font-bold mb-2">Performance Summary</h4>
                    <p className="text-sm text-gray-400 mb-4">Calculated from {stats.totalVisits} total interactions.</p>
                    
                    <ul className="space-y-4">
                      <ProgressItem label="Return Rate" value={Math.round((stats.returningUsers / (stats.uniqueVisitors || 1)) * 100)} color="bg-indigo-500" />
                      <ProgressItem label="Conversion (Generated)" value={Math.round((stats.totalGenerations / (stats.totalVisits || 1)) * 100)} color="bg-orange-500" />
                      <ProgressItem label="Success (Downloaded)" value={Math.round((stats.totalDownloads / (stats.totalGenerations || 1)) * 100)} color="bg-emerald-500" />
                    </ul>
                  </div>
                  {/* Decorative Blob */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                  <h4 className="font-semibold mb-4 text-gray-300">Security Notice</h4>
                  <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="mt-1"><Lock size={14} className="text-yellow-500" /></div>
                    <p className="text-[12px] text-yellow-200/70 leading-normal">
                      This dashboard is protected by environment variables and hidden from search engines. Ensure you keep your difficult URL private.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const colorMap = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
  };

  return (
    <div className={`${colorMap[color]} border rounded-3xl p-6 hover:-translate-y-1 transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight">{value.toLocaleString()}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );
};

const ProgressItem = ({ label, value, color }) => (
  <li>
    <div className="flex justify-between items-center text-xs mb-1.5 px-0.5">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-white font-bold">{value}%</span>
    </div>
    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`${color} h-full rounded-full transition-all duration-1000`} 
        style={{ width: `${Math.min(100, value)}%` }}
      ></div>
    </div>
  </li>
);

export default AdminDashboard;
