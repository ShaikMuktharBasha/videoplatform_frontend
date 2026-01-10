import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  VideoCameraIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  BookmarkIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-primary-50 dark:bg-gray-800 text-primary-700 dark:text-primary-400 border-r-4 border-primary-600' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800';
  };

  const navItems = [
    { name: 'Feed', path: '/', icon: HomeIcon },
    { name: 'My Videos', path: '/dashboard', icon: VideoCameraIcon },
    { name: 'Liked Videos', path: '/liked', icon: HandThumbUpIcon },
    { name: 'Disliked Videos', path: '/disliked', icon: HandThumbDownIcon },
    { name: 'Saved Videos', path: '/saved', icon: BookmarkIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen fixed left-0 top-16 hidden md:block overflow-y-auto transition-colors duration-200">
      <div className="py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive(item.path)}`}
              >
                <item.icon className="w-6 h-6 mr-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {user?.role === 'Editor' || user?.role === 'Admin' ? (
           <div className="mt-8 px-6">
             <Link to="/upload" className="w-full flex items-center justify-center space-x-2 btn-primary py-2 rounded-lg">
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span>Upload Video</span>
             </Link>
           </div>
        ) : null}
      </div>
    </aside>
  );
};

export default Sidebar;
