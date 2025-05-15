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
import { Animal } from "@/types";
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

const partoFormSchema = z.object({
  data_proximo_parto: z.string().optional(),
});

type PartoFormValues = z.infer<typeof partoFormSchema>;

interface PartosFormProps {
  animal: Animal;
}

export function PartosForm({ animal }: PartosFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<PartoFormValues>({
    resolver: zodResolver(partoFormSchema),
    defaultValues: {
      data_proximo_parto: animal.data_proximo_parto || undefined,
    }
  });

  async function onSubmit(data: PartoFormValues) {
    try {
      const updatedAnimal = { 
        ...animal,
        data_proximo_parto: data.data_proximo_parto || null,
        quantidade_partos: animal.quantidade_partos + 1
      };

      await updateAnimal(animal.id, updatedAnimal);
      queryClient.invalidateQueries({ queryKey: ['animal'] });
      toast.success("Parto registrado com sucesso!");
      form.reset({
        data_proximo_parto: undefined
      });
    } catch (error) {
      toast.error("Erro ao registrar parto");
      console.error(error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informações de Partos</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Quantidade de Partos</p>
            <p className="text-2xl font-bold">{animal.quantidade_partos}</p>
          </div>
          {animal.data_proximo_parto && (
            <div>
              <p className="text-sm font-medium">Próximo Parto Previsto</p>
              <p className="text-2xl font-bold">
                {format(new Date(animal.data_proximo_parto), 'dd/MM/yyyy')}
              </p>
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="data_proximo_parto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Próximo Parto (opcional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Registrar Parto</Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Partos</h3>
        {animal.quantidade_partos > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número do Parto</TableHead>
                <TableHead>Data Prevista</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Implementar histórico detalhado de partos */}
              <TableRow>
                <TableCell>{animal.quantidade_partos}</TableCell>
                <TableCell>
                  {animal.data_proximo_parto 
                    ? format(new Date(animal.data_proximo_parto), 'dd/MM/yyyy')
                    : '-'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">Nenhum parto registrado</p>
        )}
      </div>
    </div>
  );
} 