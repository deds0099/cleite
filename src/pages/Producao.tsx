import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRegistrosLeite, getAnimais, addRegistroLeite, deleteRegistroLeite } from "@/lib/api";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, addDays } from "date-fns";
import { Trash2 } from "lucide-react";

// Função para ajustar a exibição da data
const ajustarDataExibicao = (data: string) => {
  const dataObj = new Date(data);
  return addDays(dataObj, 1);
};

export default function Producao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Estados do formulário
  const [animalSelecionado, setAnimalSelecionado] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [periodo, setPeriodo] = useState<"Manha" | "Tarde">("Manha");
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [totalManual, setTotalManual] = useState("");

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

  // Buscar dados
  const { data: animais, isLoading: animaisLoading } = useQuery({
    queryKey: ['animais'],
    queryFn: getAnimais
  });

  const { data: registros, isLoading: registrosLoading } = useQuery({
    queryKey: ['registrosLeite'],
    queryFn: getRegistrosLeite
  });

  // Função para registrar produção individual
  const handleRegistrarProducao = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (!animalSelecionado || !quantidade || !data) {
        toast.error("Preencha todos os campos");
        return;
      }

      const quantidadeNum = parseFloat(quantidade);
      if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
        toast.error("Quantidade inválida");
        return;
      }

      await addRegistroLeite({
        user_id: session.user.id,
        animal_id: animalSelecionado,
        data: data,
        quantidade: quantidadeNum,
        periodo: periodo
      });

      queryClient.invalidateQueries({ queryKey: ['registrosLeite'] });
      toast.success("Produção registrada com sucesso!");

      // Limpar formulário
      setQuantidade("");
      setPeriodo("Manha");
    } catch (error) {
      console.error('Erro ao registrar produção:', error);
      toast.error("Erro ao registrar produção");
    }
  };

  // Função para salvar total manual
  const handleSalvarTotalManual = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Usuário não autenticado");
        return;
      }

      const quantidadeNum = parseFloat(totalManual);
      if (isNaN(quantidadeNum) || quantidadeNum < 0) {
        toast.error("Quantidade inválida");
        return;
      }

      // Usar a data atual diretamente
      const hoje = format(new Date(), 'yyyy-MM-dd');
      
      const registro = {
        user_id: session.user.id,
        animal_id: null as string | null,
        data: hoje,
        quantidade: quantidadeNum,
        periodo: "Total" as const
      };

      await addRegistroLeite(registro);
      queryClient.invalidateQueries({ queryKey: ['registrosLeite'] });
      toast.success("Total de produção registrado com sucesso!");
      setTotalManual("");
    } catch (error) {
      console.error('Erro ao registrar total:', error);
      toast.error("Erro ao registrar total de produção");
    }
  };

  // Adicionar a função handleExcluirRegistro antes do return
  const handleExcluirRegistro = async (id: string) => {
    try {
      if (window.confirm('Tem certeza que deseja excluir este registro?')) {
        await deleteRegistroLeite(id);
        queryClient.invalidateQueries({ queryKey: ['registrosLeite'] });
        toast.success('Registro excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      toast.error('Erro ao excluir registro');
    }
  };

  if (animaisLoading || registrosLoading) {
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

  if (!animais || !registros) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center">
            <p>Nenhum dado disponível</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Calcular produção de hoje (apenas registros totais)
  const hoje = new Date();
  const producaoHoje = registros
    .filter(r => {
      const dataAjustada = ajustarDataExibicao(r.data);
      return format(dataAjustada, 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd') && r.periodo === 'Total';
    })
    .reduce((acc, curr) => acc + curr.quantidade, 0);

  // Calcular produção individual de hoje
  const producaoIndividualHoje = registros
    .filter(r => {
      const dataAjustada = ajustarDataExibicao(r.data);
      return format(dataAjustada, 'yyyy-MM-dd') === format(hoje, 'yyyy-MM-dd') && r.periodo !== 'Total';
    })
    .reduce((acc, curr) => acc + curr.quantidade, 0);

  // Calcular produção do período selecionado
  const producaoPeriodo = registros
    .filter(registro => {
      const dataAjustada = ajustarDataExibicao(registro.data);
      return isWithinInterval(dataAjustada, {
        start: startOfDay(parseISO(dataInicio)),
        end: endOfDay(parseISO(dataFim))
      });
    })
    .reduce((acc, curr) => acc + curr.quantidade, 0);

  // Filtrar registros pelo período selecionado
  const registrosFiltrados = registros
    .filter(registro => {
      const dataAjustada = ajustarDataExibicao(registro.data);
      return isWithinInterval(dataAjustada, {
        start: startOfDay(parseISO(dataInicio)),
        end: endOfDay(parseISO(dataFim))
      });
    });

  // Separar registros totais e individuais
  const registrosTotais = registrosFiltrados.filter(r => r.periodo === 'Total');
  const registrosIndividuais = registrosFiltrados.filter(r => r.periodo !== 'Total');

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Produção Total de Hoje</CardTitle>
              <CardDescription>Total de leite registrado manualmente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">{producaoHoje.toFixed(1)}L</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={totalManual}
                    onChange={(e) => setTotalManual(e.target.value)}
                    placeholder="Digite o total do dia"
                  />
                  <Button onClick={handleSalvarTotalManual}>
                    Salvar Total
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produção Individual de Hoje</CardTitle>
              <CardDescription>Total de leite registrado por animal</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{producaoIndividualHoje.toFixed(1)}L</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Produção do Período</CardTitle>
            <CardDescription>Total de leite no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{producaoPeriodo.toFixed(1)}L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Produção Individual</CardTitle>
            <CardDescription>
              Registre a produção de leite por animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Animal</Label>
                <Select value={animalSelecionado} onValueChange={setAnimalSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animais.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.nome || `#${animal.numero}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data</Label>
                <Input 
                  type="date" 
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>

              <div>
                <Label>Quantidade (litros)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div>
                <Label>Período</Label>
                <Select value={periodo} onValueChange={(value: "Manha" | "Tarde") => setPeriodo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manha">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRegistrarProducao}>
                Registrar Produção
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Período</CardTitle>
            <CardDescription>
              Selecione o período para visualizar a produção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Data Início</Label>
                <Input 
                  type="date" 
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label>Data Fim</Label>
                <Input 
                  type="date" 
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Produção Total</CardTitle>
              <CardDescription>
                Acompanhe a produção total diária no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Quantidade (L)</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrosTotais
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell>
                          {format(ajustarDataExibicao(registro.data), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{registro.quantidade.toFixed(1)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExcluirRegistro(registro.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Produção por Animal</CardTitle>
              <CardDescription>
                Acompanhe a produção individual por animal no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Animal</TableHead>
                    <TableHead>Quantidade (L)</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrosIndividuais
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((registro) => {
                      const animal = animais.find(a => a.id === registro.animal_id);
                      return (
                        <TableRow key={registro.id}>
                          <TableCell>
                            {format(ajustarDataExibicao(registro.data), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            {animal ? (animal.nome || `#${animal.numero}`) : 'Animal não encontrado'}
                          </TableCell>
                          <TableCell>{registro.quantidade.toFixed(1)}</TableCell>
                          <TableCell>{registro.periodo}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleExcluirRegistro(registro.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}