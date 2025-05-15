import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimal } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { VacinasForm } from "@/components/forms/VacinasForm";
import { ProducaoForm } from "@/components/forms/ProducaoForm";
import { PartosForm } from "@/components/forms/PartosForm";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { deleteAnimal } from "@/lib/api";
import { toast } from "sonner";
import { Animal } from "@/types";
import { AnimalForm } from "@/components/forms/AnimalForm";

// Função para corrigir diferença de dias nas datas exibidas
const fixDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  // Adiciona 2 dias para corrigir o problema de fuso horário
  return addDays(date, 2);
};

export function AnimalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAnimal = async () => {
    try {
      await deleteAnimal(id!);
      toast.success("Animal excluído com sucesso!");
      navigate("/animals");
    } catch (error) {
      toast.error("Erro ao excluir o animal. Por favor, tente novamente mais tarde.");
    }
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

  if (!animal) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center">
            <p>Animal não encontrado</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        {isLoading ? (
          <div>Carregando...</div>
        ) : animal ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {animal.nome || `#${animal.numero}`}
                </h2>
                <p className="text-muted-foreground">
                  Detalhes do animal
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Excluir Animal</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Você tem certeza?</DialogTitle>
                      <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o animal
                        e todos os dados relacionados.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAnimal}>
                        Excluir
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                  <CardDescription>
                    Detalhes gerais do animal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Número: </span>
                    <span>{animal.numero}</span>
                  </div>
                  <div>
                    <span className="font-medium">Nome: </span>
                    <span>{animal.nome || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Raça: </span>
                    <span>{animal.raca}</span>
                  </div>
                  <div>
                    <span className="font-medium">Sexo: </span>
                    <span>{animal.sexo}</span>
                  </div>
                  <div>
                    <span className="font-medium">Data de Nascimento: </span>
                    <span>{format(fixDateDisplay(animal.data_nascimento), 'dd/MM/yyyy')}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status: </span>
                    <span>{animal.status}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reprodução</CardTitle>
                  <CardDescription>
                    Dados reprodutivos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Quantidade de Partos: </span>
                    <span>{animal.quantidade_partos || 0}</span>
                  </div>
                  {animal.data_proximo_parto && (
                    <div>
                      <span className="font-medium">Próximo Parto: </span>
                      <span>{format(fixDateDisplay(animal.data_proximo_parto), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="producao" className="space-y-4">
              <TabsList>
                <TabsTrigger value="producao">Produção</TabsTrigger>
                <TabsTrigger value="vacinas">Vacinas</TabsTrigger>
                <TabsTrigger value="partos">Partos</TabsTrigger>
                <TabsTrigger value="editar">Editar Animal</TabsTrigger>
              </TabsList>

              <TabsContent value="producao">
                <Card>
                  <CardHeader>
                    <CardTitle>Produção de Leite</CardTitle>
                    <CardDescription>
                      Registro e histórico de produção
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProducaoForm animal={animal} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vacinas">
                <Card>
                  <CardHeader>
                    <CardTitle>Vacinas</CardTitle>
                    <CardDescription>
                      Histórico e agendamento de vacinas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VacinasForm animal={animal} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="partos">
                <Card>
                  <CardHeader>
                    <CardTitle>Partos</CardTitle>
                    <CardDescription>
                      Registro e agendamento de partos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PartosForm animal={animal} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="editar">
                <Card>
                  <CardHeader>
                    <CardTitle>Editar Animal</CardTitle>
                    <CardDescription>
                      Atualizar informações do animal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AnimalForm animalExistente={animal} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div>Animal não encontrado</div>
        )}
      </div>
    </Layout>
  );
} 