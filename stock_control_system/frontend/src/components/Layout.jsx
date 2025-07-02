import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  Home, 
  Package, 
  PlusCircle, 
  User, 
  LogOut, 
  Menu,
  X,
  ChevronDown,
  Download // <-- Ícone importado
} from 'lucide-react';
import '../App.css';

// Componente para o Logo
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="bg-green-100 p-2 rounded-lg">
      <Home className="h-6 w-6 text-green-600" />
    </div>
    <div>
      <h1 className="text-lg font-bold text-gray-800">CDE-FUSIONUP</h1>
      <p className="text-xs text-gray-500">Controle de Estoque</p>
    </div>
  </div>
);

// Componente para o Perfil do Usuário na Sidebar
const UserProfile = ({ user }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
      {user?.first_name?.[0] || 'U'}
    </div>
    <div>
      <p className="font-semibold text-sm text-gray-800">
        {user?.first_name || user?.username || 'Usuário'}
      </p>
      <p className="text-xs text-gray-500">{user?.email}</p>
    </div>
  </div>
);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Produtos', href: '/products', icon: Package },
    { name: 'Novo Produto', href: '/products/new', icon: PlusCircle },
    { name: 'Exportar/Backup', href: '/exports', icon: Download }, // <-- Novo item
  ];

  const isActive = (href) => location.pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center px-4">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navegação</p>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => sidebarOpen && setSidebarOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <UserProfile user={user} />
        <Button variant="ghost" size="sm" className="w-full justify-start mt-4 text-gray-600" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-lg">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden -ml-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
