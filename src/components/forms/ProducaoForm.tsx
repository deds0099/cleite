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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Animal, RegistroLeite } from "@/types";
import { addRegistroLeite, getRegistrosLeite } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

const producaoFormSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  quantidade: z.number().min(0.1, "Quantidade deve ser maior que 0"),
  periodo: z.enum(["Manha", "Tarde"], {
    required_error: "Período é obrigatório"
  })
});

type ProducaoFormValues = z.infer<typeof producaoFormSchema>;

interface ProducaoFormProps {
  animal: Animal;
}

// Função para corrigir diferença de dias nas datas exibidas
const fixDateDisplay = (dateStr: string) => {
  const date = new Date(dateStr);
  // Adiciona 2 dias para corrigir o problema de fuso horário
  return addDays(date, 2);
};

export function ProducaoForm({ animal }: ProducaoFormProps) {
  const queryClient = useQueryClient();
  
  const { data: registros } = useQuery({
    queryKey: ['registros_leite', animal.id],
    queryFn: getRegistrosLeite
  });

  const form = useForm<ProducaoFormValues>({
    resolver: zodResolver(producaoFormSchema),
    defaultValues: {
      quantidade: 0,
      periodo: "Manha"
    }
  });

  async function onSubmit(data: ProducaoFormValues) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuário não autenticado');

      const registro: Omit<RegistroLeite, 'id' | 'created_at'> = {
        user_id: session.user.id,
        animal_id: animal.id,
        data: data.data,
        quantidade: data.quantidade,
        periodo: data.periodo
      };

      await addRegistroLeite(registro);
      queryClient.invalidateQueries({ queryKey: ['registros_leite'] });
      toast.success("Produção registrada com sucesso!");
      form.reset();
    } catch (error) {
      toast.error("Erro ao registrar produção");
      console.error(error);
    }
  }

  // Agrupar registros por data
  const registrosPorData = registros?.reduce((acc, registro) => {
    const data = format(new Date(registro.data), 'dd/MM/yyyy');
    if (!acc[data]) {
      acc[data] = {
        data: registro.data,
        manha: 0,
        tarde: 0,
        total: 0
      };
    }
    if (registro.periodo === 'Manha') {
      acc[data].manha += registro.quantidade;
    } else {
      acc[data].tarde += registro.quantidade;
    }
    acc[data].total += registro.quantidade;
    return acc;
  }, {} as Record<string, { data: string; manha: number; tarde: number; total: number; }>);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (litros)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1"
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Manha">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Registrar Produção</Button>
        </form>
      </Form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Produção</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Manhã (L)</TableHead>
              <TableHead>Tarde (L)</TableHead>
              <TableHead>Total (L)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrosPorData && Object.entries(registrosPorData)
              .sort((a, b) => new Date(b[1].data).getTime() - new Date(a[1].data).getTime())
              .map(([data, registro]) => (
                <TableRow key={data}>
                  <TableCell>{format(fixDateDisplay(data), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{registro.manha.toFixed(1)}</TableCell>
                  <TableCell>{registro.tarde.toFixed(1)}</TableCell>
                  <TableCell>{registro.total.toFixed(1)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 