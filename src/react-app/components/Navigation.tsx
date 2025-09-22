import { Link, useLocation } from 'react-router';
import { MapPin, Shield, Leaf } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isAdminVerified = localStorage.getItem('adminAccess') === 'verified';

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Leaf className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">EcoMap</h1>
              <p className="text-xs text-gray-500">Pontos de Descarte</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-green-100 text-green-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <MapPin size={18} />
              <span className="hidden sm:inline">Mapa</span>
            </Link>
            
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive('/admin') 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <Shield size={18} />
              <span className="hidden sm:inline">Admin</span>
              {isAdminVerified && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
