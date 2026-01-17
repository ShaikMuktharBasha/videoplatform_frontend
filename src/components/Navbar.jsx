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
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isEditor ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Content Analyzer</span>
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
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
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
