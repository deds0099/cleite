import { Link } from "react-router-dom";
import { Beef, Home, DollarSign, LineChart, Bell, Settings } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Menu Lateral */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="space-y-4">
          <div className="text-xl font-bold mb-6">Controle Leiteiro</div>
          
          <Link to="/" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg">
            <Home size={20} />
            <span>Página Inicial</span>
          </Link>

          <div className="space-y-1">
            <div className="text-sm text-gray-400 px-2">Gestão</div>
            <Link to="/animais" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg">
              <Beef size={20} />
              <span>Animais</span>
            </Link>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-400 px-2">Controle</div>
            <Link to="/producao" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg">
              <LineChart size={20} />
              <span>Produção</span>
            </Link>
            <Link to="/financeiro" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg">
              <DollarSign size={20} />
              <span>Financeiro</span>
            </Link>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-gray-400 px-2">Sistema</div>
            <Link to="/alertas" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg">
              <Bell size={20} />
              <span>Alertas</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg">
              <Settings size={20} />
              <span>Configurações</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
