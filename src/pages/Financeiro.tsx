import { Layout } from "@/components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRegistrosFinanceiros, addRegistroFinanceiro, deleteRegistroFinanceiro } from "@/lib/api";
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
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

export default function Financeiro() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dataInicio, setDataInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Estados do formulário
  const [tipo, setTipo] = useState<"Receita" | "Despesa">("Receita");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));

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

  // Buscar registros
  const { data: registros, isLoading } = useQuery({
    queryKey: ['registrosFinanceiros'],
    queryFn: getRegistrosFinanceiros
  });

  // Função para registrar transação
  const handleRegistrarTransacao = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Usuário não autenticado");
        return;
      }

      if (!tipo || !categoria || !valor || !data) {
        toast.error("Preencha todos os campos");
        return;
      }

      const valorNum = parseFloat(valor);
      if (isNaN(valorNum) || valorNum <= 0) {
        toast.error("Valor inválido");
        return;
      }

      await addRegistroFinanceiro({
        tipo,
        categoria,
        valor: valorNum,
        descricao,
        data,
        user_id: session.user.id
      });

      queryClient.invalidateQueries({ queryKey: ['registrosFinanceiros'] });
      toast.success("Transação registrada com sucesso!");

      // Limpar formulário
      setCategoria("");
      setValor("");
      setDescricao("");
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error("Erro ao registrar transação");
    }
  };

  // Função para excluir transação
  const handleExcluirTransacao = async (id: string) => {
    try {
      if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
        await deleteRegistroFinanceiro(id);
        queryClient.invalidateQueries({ queryKey: ['registrosFinanceiros'] });
        toast.success("Transação excluída com sucesso!");
      }
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast.error("Erro ao excluir transação");
    }
  };

  // Calcular totais
  const calcularTotais = () => {
    if (!registros) return { receitas: 0, despesas: 0, saldo: 0 };

    const totais = registros.reduce((acc, registro) => {
      if (registro.tipo === 'Receita') {
        acc.receitas += registro.valor;
      } else {
        acc.despesas += registro.valor;
      }
      return acc;
    }, { receitas: 0, despesas: 0 });

    return {
      ...totais,
      saldo: totais.receitas - totais.despesas
    };
  };

  const { receitas, despesas, saldo } = calcularTotais();

  // Lista de categorias
  const categorias = {
    Receita: [
      "Venda de Leite",
      "Venda de Animais",
      "Outros"
    ],
    Despesa: [
      "Ração",
      "Medicamentos",
      "Manutenção",
      "Funcionários",
      "Energia",
      "Água",
      "Outros"
    ]
  };

  if (isLoading) {
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Receitas</CardTitle>
              <CardDescription>Total de entradas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                R$ {receitas.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
              <CardDescription>Total de saídas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                R$ {despesas.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saldo</CardTitle>
              <CardDescription>Balanço total</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldo.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Transação</CardTitle>
            <CardDescription>
              Registre uma nova receita ou despesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(value: "Receita" | "Despesa") => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias[tipo].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                <Label>Valor (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Descrição (opcional)</Label>
                <Input 
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Detalhes sobre a transação"
                />
              </div>

              <Button onClick={handleRegistrarTransacao}>
                Registrar Transação
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Período</CardTitle>
            <CardDescription>
              Selecione o período para visualizar as transações
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

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>
              Todas as transações registradas no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros?.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell>
                      {format(new Date(registro.data), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className={registro.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'}>
                        {registro.tipo}
                      </span>
                    </TableCell>
                    <TableCell>{registro.categoria}</TableCell>
                    <TableCell>R$ {registro.valor.toFixed(2)}</TableCell>
                    <TableCell>{registro.descricao || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluirTransacao(registro.id)}
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
      </div>
    </Layout>
  );
} 