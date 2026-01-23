import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (result.user.role === 'Admin' || result.user.role === 'Editor') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const CheckIcon = () => (
    <svg className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4 font-sans relative overflow-hidden transition-colors duration-200">
      {/* Background Ambience */} 
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-5xl lg:h-[700px] h-auto bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex-col lg:flex-row">
        
        {/* Left Column - Marketing */}
        <div className="hidden lg:flex w-full lg:w-1/2 flex-col justify-center p-12 relative border-r border-white/5 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
           {/* Abstract Decoration */}
           <div className="absolute top-0 right-0 p-12 opacity-30">
             <div className="w-24 h-24 rounded-full border border-purple-500/30 blur-sm"></div>
           </div>

           <div className="mb-2">
             <h1 className="text-5xl font-bold mb-4 text-white">
               <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                 Content
                 <br />
                 Analyzer AI
               </span>
             </h1>
             <p className="text-gray-400 text-lg mb-8 leading-relaxed">
               Unlock deep insights into your writing with our neural network analysis engine.
             </p>
           </div>

           <div className="space-y-4">
             <div className="flex items-center text-gray-300">
               <CheckIcon />
               <span>Sentiment & Tone Detection</span>
             </div>
             <div className="flex items-center text-gray-300">
                <CheckIcon />
               <span>SEO Performance Scoring</span>
             </div>
             <div className="flex items-center text-gray-300">
                <CheckIcon />
               <span>Plagiarism & AI Verification</span>
             </div>
             <div className="flex items-center text-gray-300">
                <CheckIcon />
               <span>Readability Optimization</span>
             </div>
           </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 mb-8">Enter your credentials to access your dashboard.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-lg p-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono tracking-widest"
                  required
                />
                <div className="flex justify-end mt-2">
                   {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>


            <p className="text-center mt-8 text-gray-500 text-sm">
              New here?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
