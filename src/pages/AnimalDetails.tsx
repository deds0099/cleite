import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimal } from "@/lib/api";
import { Layout } from "@/components/Layout";
import { VacinasForm } from "@/components/forms/VacinasForm";
import { ProducaoForm } from "@/components/forms/ProducaoForm";
import { PartosForm } from "@/components/forms/PartosForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AnimalDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

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
      <div className="container mx-auto py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {animal.nome || `Animal #${animal.numero}`}
            </CardTitle>
            <CardDescription>
              Detalhes do animal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Número</p>
                <p>{animal.numero}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Raça</p>
                <p>{animal.raca}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Data de Nascimento</p>
                <p>{format(new Date(animal.data_nascimento), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Sexo</p>
                <p>{animal.sexo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Quantidade de Partos</p>
                <p>{animal.quantidade_partos}</p>
              </div>
              {animal.data_proximo_parto && (
                <div>
                  <p className="text-sm font-medium">Próximo Parto</p>
                  <p>{format(new Date(animal.data_proximo_parto), 'dd/MM/yyyy')}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Status</p>
                <p>{animal.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="vacinas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vacinas">Vacinas</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="partos">Partos</TabsTrigger>
          </TabsList>

          <TabsContent value="vacinas">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Vacinas</CardTitle>
                <CardDescription>
                  Registre e acompanhe as vacinas do animal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VacinasForm animal={animal} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="producao">
            <Card>
              <CardHeader>
                <CardTitle>Produção de Leite</CardTitle>
                <CardDescription>
                  Registre e acompanhe a produção de leite
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProducaoForm animal={animal} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partos">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Partos</CardTitle>
                <CardDescription>
                  Registro e acompanhamento de partos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PartosForm animal={animal} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 