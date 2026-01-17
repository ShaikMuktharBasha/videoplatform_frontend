import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import logo from '../images/logo.png';

const Navbar = () => {
  const { user, logout, isEditor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass fixed w-full z-20 top-0 left-0 transition-all duration-200">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isEditor ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Content Analyzer
            </span>
          </Link>

          {/* Mobile Menu Links - Visible only on small screens */}
          <div className="flex space-x-4 md:hidden">
             <Link to={isEditor ? "/dashboard" : "/"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md font-medium">{isEditor ? 'My Content' : 'Feed'}</Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
