import { Layout } from "@/components/Layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAnimais, deleteAnimal } from "@/lib/api";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AnimalForm } from "@/components/forms/AnimalForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function Animais() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      console.log('Usuário autenticado:', session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const { data: animais, isLoading, error, isError } = useQuery({
    queryKey: ['animais'],
    queryFn: getAnimais,
    retry: 1,
  });

  const handleNovoAnimal = () => {
    setOpen(true);
  };

  const handleExcluirAnimal = async (id: string) => {
    try {
      if (window.confirm('Tem certeza que deseja excluir este animal? Todos os registros associados também serão excluídos.')) {
        await deleteAnimal(id);
        queryClient.invalidateQueries({ queryKey: ['animais'] });
        toast.success('Animal excluído com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao excluir animal:', error);
      toast.error('Erro ao excluir animal');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Carregando...</h2>
            <p className="text-muted-foreground">Buscando seus animais</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    console.error('Erro na página de animais:', error);
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Erro ao carregar animais</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Por favor, tente novamente'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Animais</h2>
            <p className="text-muted-foreground">
              Gerencie o rebanho e acompanhe cada animal
            </p>
          </div>
          <Button onClick={handleNovoAnimal}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Animal
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Animais</CardTitle>
            <CardDescription>
              {animais?.length 
                ? `${animais.length} ${animais.length === 1 ? 'animal cadastrado' : 'animais cadastrados'} no sistema` 
                : "Nenhum animal cadastrado ainda"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {animais?.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Raça</TableHead>
                      <TableHead>Sexo</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead>Qtd. Partos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {animais.map((animal) => (
                      <TableRow 
                        key={animal.id}
                        className="cursor-pointer hover:bg-muted"
                      >
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{animal.numero}</TableCell>
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{animal.nome || '-'}</TableCell>
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{animal.raca}</TableCell>
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{animal.sexo}</TableCell>
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{format(new Date(animal.data_nascimento), 'dd/MM/yyyy')}</TableCell>
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{animal.quantidade_partos}</TableCell>
                        <TableCell onClick={() => navigate(`/animal/${animal.id}`)}>{animal.status}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluirAnimal(animal.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">Nenhum animal cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece cadastrando seu primeiro animal
                </p>
                <Button onClick={handleNovoAnimal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Animal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Animal</DialogTitle>
            <DialogDescription>
              Preencha os dados do animal abaixo
            </DialogDescription>
          </DialogHeader>
          <AnimalForm />
        </DialogContent>
      </Dialog>
    </Layout>
  );
} 