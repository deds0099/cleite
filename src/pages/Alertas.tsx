import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAlertas, getAnimais } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, differenceInDays, isBefore, addDays } from "date-fns";
import { CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Função para corrigir diferença de dias nas datas exibidas
const fixDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  // Adiciona 2 dias para corrigir o problema de fuso horário
  return addDays(date, 2);
};

export default function Alertas() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  // Buscar alertas e animais
  const { data: alertas, isLoading: alertasLoading } = useQuery({
    queryKey: ['alertas'],
    queryFn: getAlertas
  });

  const { data: animais, isLoading: animaisLoading } = useQuery({
    queryKey: ['animais'],
    queryFn: getAnimais
  });

  // Função para marcar alerta como concluído
  const handleConcluirAlerta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ status: 'Concluido' })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      toast.success('Alerta marcado como concluído');
    } catch (error) {
      console.error('Erro ao concluir alerta:', error);
      toast.error('Erro ao concluir alerta');
    }
  };

  // Função para excluir alerta
  const handleExcluirAlerta = async (id: string) => {
    try {
      if (!window.confirm('Tem certeza que deseja excluir este alerta?')) return;

      const { error } = await supabase
        .from('alertas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['alertas'] });
      toast.success('Alerta excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir alerta:', error);
      toast.error('Erro ao excluir alerta');
    }
  };

  // Função para navegar para os detalhes do animal
  const handleVerAnimal = (animalId: string) => {
    navigate(`/animal/${animalId}`);
  };

  // Função para obter o nome do animal
  const getNomeAnimal = (animalId: string) => {
    const animal = animais?.find(a => a.id === animalId);
    return animal ? (animal.nome || `#${animal.numero}`) : 'Animal não encontrado';
  };

  // Função para obter a cor do badge baseado no tipo
  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'Vacina':
        return 'bg-blue-500';
      case 'Parto':
        return 'bg-purple-500';
      case 'Inseminacao':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Função para obter a urgência do alerta
  const getAlertaUrgencia = (data: string) => {
    const dataCorrigida = fixDateDisplay(data);
    const dias = differenceInDays(dataCorrigida, new Date());
    if (dias < 0) return 'Atrasado';
    if (dias <= 7) return 'Urgente';
    if (dias <= 15) return 'Próximo';
    return 'Futuro';
  };

  // Função para obter a cor da urgência
  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'Atrasado':
        return 'text-red-500 font-bold';
      case 'Urgente':
        return 'text-orange-500 font-bold';
      case 'Próximo':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Processar próximos partos
  const proximosPartos = animais?.filter(animal => 
    animal.data_proximo_parto && 
    isBefore(new Date(), fixDateDisplay(animal.data_proximo_parto)) &&
    differenceInDays(fixDateDisplay(animal.data_proximo_parto), new Date()) <= 30
  ) || [];

  // Processar próximas vacinas
  const proximasVacinas = animais?.flatMap(animal => 
    animal.proximas_vacinas.map(vacina => ({
      ...vacina,
      animal_id: animal.id,
      urgencia: getAlertaUrgencia(vacina.data)
    }))
  ).filter(vacina => 
    differenceInDays(fixDateDisplay(vacina.data), new Date()) <= 30
  ).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()) || [];

  if (alertasLoading || animaisLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Alertas</h2>
            <p className="text-muted-foreground">
              Gerencie os alertas do rebanho
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Próximos Partos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximos Partos
              </CardTitle>
              <CardDescription>
                Partos previstos para os próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximosPartos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Urgência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proximosPartos.map((animal) => {
                      const urgencia = getAlertaUrgencia(animal.data_proximo_parto!);
                      return (
                        <TableRow key={animal.id}>
                          <TableCell>
                            {format(fixDateDisplay(animal.data_proximo_parto!), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="link" 
                              onClick={() => handleVerAnimal(animal.id)}
                            >
                              {animal.nome || `#${animal.numero}`}
                            </Button>
                          </TableCell>
                          <TableCell className={getUrgenciaColor(urgencia)}>
                            {urgencia}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhum parto previsto para os próximos 30 dias
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Próximas Vacinas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Próximas Vacinas
              </CardTitle>
              <CardDescription>
                Vacinas previstas para os próximos 30 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximasVacinas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Vacina</TableHead>
                      <TableHead>Urgência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proximasVacinas.map((vacina, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {format(fixDateDisplay(vacina.data), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="link" 
                            onClick={() => handleVerAnimal(vacina.animal_id)}
                          >
                            {getNomeAnimal(vacina.animal_id)}
                          </Button>
                        </TableCell>
                        <TableCell>{vacina.nome}</TableCell>
                        <TableCell className={getUrgenciaColor(vacina.urgencia)}>
                          {vacina.urgencia}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma vacina prevista para os próximos 30 dias
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pendentes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pendentes">Alertas Pendentes</TabsTrigger>
            <TabsTrigger value="concluidos">Alertas Concluídos</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Pendentes</CardTitle>
                <CardDescription>
                  Alertas que precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertas?.filter(a => a.status === 'Pendente').length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Animal</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Urgência</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertas
                        ?.filter(a => a.status === 'Pendente')
                        .map((alerta) => {
                          const urgencia = getAlertaUrgencia(alerta.data);
                          return (
                            <TableRow key={alerta.id}>
                              <TableCell>
                                {format(fixDateDisplay(alerta.data), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell>
                                <Badge className={getBadgeColor(alerta.tipo)}>
                                  {alerta.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="link" 
                                  onClick={() => handleVerAnimal(alerta.animal_id)}
                                >
                                  {getNomeAnimal(alerta.animal_id)}
                                </Button>
                              </TableCell>
                              <TableCell>{alerta.descricao}</TableCell>
                              <TableCell className={getUrgenciaColor(urgencia)}>
                                {urgencia}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleConcluirAlerta(alerta.id)}
                                    className="text-green-500 hover:text-green-700"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleExcluirAlerta(alerta.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum alerta pendente
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concluidos">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Concluídos</CardTitle>
                <CardDescription>
                  Histórico de alertas já atendidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertas?.filter(a => a.status === 'Concluido').length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Animal</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alertas
                        ?.filter(a => a.status === 'Concluido')
                        .map((alerta) => (
                          <TableRow key={alerta.id} className="opacity-60">
                            <TableCell>
                              {format(fixDateDisplay(alerta.data), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <Badge className={getBadgeColor(alerta.tipo)}>
                                {alerta.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="link" 
                                onClick={() => handleVerAnimal(alerta.animal_id)}
                              >
                                {getNomeAnimal(alerta.animal_id)}
                              </Button>
                            </TableCell>
                            <TableCell>{alerta.descricao}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExcluirAlerta(alerta.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Nenhum alerta concluído
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 