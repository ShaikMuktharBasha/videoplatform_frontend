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
      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-r-4 border-purple-500' 
      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5';
  };

  const navItems = [
    { name: 'Feed', path: '/', icon: HomeIcon },
    { name: 'My Content', path: '/dashboard', icon: VideoCameraIcon },
    { name: 'Liked Content', path: '/liked', icon: HandThumbUpIcon },
    { name: 'Disliked Content', path: '/disliked', icon: HandThumbDownIcon },
    { name: 'Saved Content', path: '/saved', icon: BookmarkIcon },
  ];

  return (
    <aside className="w-64 glass border-t-0 min-h-screen fixed left-0 top-16 hidden md:block overflow-y-auto transition-all duration-200 z-10">
      <div className="py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-all ${isActive(item.path)}`}
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
                <span>Upload Content</span>
             </Link>
           </div>
        ) : null}
      </div>
    </aside>
  );
};

export default Sidebar;
