import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Animal, Vacina } from "@/types";
import { updateAnimal } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";

const vacinaFormSchema = z.object({
  nome: z.string().min(1, "Nome da vacina é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().optional()
});

type VacinaFormValues = z.infer<typeof vacinaFormSchema>;

interface VacinasFormProps {
  animal: Animal;
}

export function VacinasForm({ animal }: VacinasFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<VacinaFormValues>({
    resolver: zodResolver(vacinaFormSchema)
  });

  async function onSubmit(data: VacinaFormValues) {
    try {
      const novaVacina: Vacina = {
        nome: data.nome,
        data: data.data,
        observacoes: data.observacoes
      };

      // Adiciona a vacina ao histórico se a data é passada, senão adiciona às próximas
      const hoje = new Date();
      const dataVacina = new Date(data.data);
      
      const updatedAnimal = { ...animal };
      if (dataVacina <= hoje) {
        updatedAnimal.historico_vacinas = [...animal.historico_vacinas, novaVacina];
      } else {
        updatedAnimal.proximas_vacinas = [...animal.proximas_vacinas, novaVacina];
      }

      await updateAnimal(animal.id, updatedAnimal);
      queryClient.invalidateQueries({ queryKey: ["animais"] });
      toast.success("Vacina registrada com sucesso!");
      form.reset();
    } catch (error) {
      toast.error("Erro ao registrar vacina");
      console.error(error);
    }
  }

  // Função para excluir vacina do histórico
  const handleExcluirVacinaHistorico = async (index: number) => {
    try {
      if (!window.confirm('Tem certeza que deseja excluir esta vacina do histórico?')) return;

      const updatedAnimal = { ...animal };
      updatedAnimal.historico_vacinas = animal.historico_vacinas.filter((_, i) => i !== index);

      await updateAnimal(animal.id, updatedAnimal);
      queryClient.invalidateQueries({ queryKey: ["animais"] });
      toast.success("Vacina excluída do histórico com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir vacina do histórico");
      console.error(error);
    }
  };

  // Função para excluir vacina futura
  const handleExcluirVacinaFutura = async (index: number) => {
    try {
      if (!window.confirm('Tem certeza que deseja excluir esta vacina agendada?')) return;

      const updatedAnimal = { ...animal };
      updatedAnimal.proximas_vacinas = animal.proximas_vacinas.filter((_, i) => i !== index);

      await updateAnimal(animal.id, updatedAnimal);
      queryClient.invalidateQueries({ queryKey: ["animais"] });
      toast.success("Vacina agendada excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir vacina agendada");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Vacina</FormLabel>
                <FormControl>
                  <Input placeholder="Aftosa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observações sobre a vacina..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Registrar Vacina</Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Próximas Vacinas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacina</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animal.proximas_vacinas.map((vacina, index) => (
              <TableRow key={index}>
                <TableCell>{vacina.nome}</TableCell>
                <TableCell>{format(new Date(vacina.data), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{vacina.observacoes}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExcluirVacinaFutura(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <h3 className="text-lg font-medium">Histórico de Vacinas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vacina</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animal.historico_vacinas.map((vacina, index) => (
              <TableRow key={index}>
                <TableCell>{vacina.nome}</TableCell>
                <TableCell>{format(new Date(vacina.data), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{vacina.observacoes}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExcluirVacinaHistorico(index)}
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
    </div>
  );
} 