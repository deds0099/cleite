import { Layout } from "@/components/Layout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getAlertas, getRegistrosLeite, getFarmProfile } from "@/lib/api";
import { format } from "date-fns";
import { Bell, BarChart2, Baby } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  const { data: farmProfile } = useQuery({
    queryKey: ['farmProfile'],
    queryFn: getFarmProfile,
  });

  const { data: alertas } = useQuery({
    queryKey: ['alertas'],
    queryFn: getAlertas,
  });

  const { data: registrosLeite } = useQuery({
    queryKey: ['registrosLeite'],
    queryFn: getRegistrosLeite,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const hoje = new Date();
  const producaoHoje = registrosLeite
    ?.filter(r => format(new Date(r.data), 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd'))
    ?.reduce((acc, curr) => acc + curr.quantidade, 0) || 0;

  const alertasPendentes = alertas?.filter(a => a.status === 'Pendente')?.length || 0;
  
  const partosPrevistos = alertas
    ?.filter(a => 
      a.tipo === 'Parto' && 
      a.status === 'Pendente' &&
      new Date(a.data) <= new Date(hoje.setDate(hoje.getDate() + 30))
    )?.length || 0;

  const stats = [
    {
      title: "Alertas Pendentes",
      value: alertasPendentes.toString(),
      description: "Vacinas e partos previstos",
      icon: Bell,
      color: "text-red-500",
    },
    {
      title: "Produção Hoje",
      value: `${producaoHoje}L`,
      description: "Total de leite produzido",
      icon: BarChart2,
      color: "text-blue-500",
    },
    {
      title: "Partos Previstos",
      value: partosPrevistos.toString(),
      description: "Próximos 30 dias",
      icon: Baby,
      color: "text-purple-500",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {farmProfile?.farm_name || "Carregando..."}
            </h2>
            <p className="text-muted-foreground">
              {farmProfile?.city ? `${farmProfile.city}` : ""}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/auth');
            }}
          >
            Sair
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
