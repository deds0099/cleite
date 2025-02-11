
import { Link } from "react-router-dom";
import { 
  Bell, 
  Leaf, 
  Baby, 
  BarChart2, 
  DollarSign,
  Home,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    icon: Home
  },
  {
    path: "/alertas",
    name: "Alertas",
    icon: Bell
  },
  {
    path: "/nutricao",
    name: "Nutrição",
    icon: Leaf
  },
  {
    path: "/reproducao",
    name: "Reprodução",
    icon: Baby
  },
  {
    path: "/producao",
    name: "Produção",
    icon: BarChart2
  },
  {
    path: "/financeiro",
    name: "Financeiro",
    icon: DollarSign
  }
];

export function Sidebar() {
  return (
    <div className="hidden border-r bg-gray-100/40 md:block md:w-64 lg:w-72">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                  "hover:bg-gray-100"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
