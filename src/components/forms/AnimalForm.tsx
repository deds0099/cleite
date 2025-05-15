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
import { Animal, Vacina } from "@/types";
import { addAnimal } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const vacinaSchema = z.object({
  nome: z.string().min(1, "Nome da vacina é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  observacoes: z.string().optional()
});

const animalFormSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  nome: z.string().optional(),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  raca: z.string().min(1, "Raça é obrigatória"),
  sexo: z.enum(["Macho", "Fêmea"], {
    required_error: "Sexo é obrigatório"
  }),
  quantidade_partos: z.number().min(0).default(0),
  data_proximo_parto: z.string().optional(),
  status: z.enum(["Ativo", "Inativo"], {
    required_error: "Status é obrigatório"
  }).default("Ativo"),
  proximas_vacinas: z.array(vacinaSchema).default([])
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

export function AnimalForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      quantidade_partos: 0,
      status: "Ativo",
      proximas_vacinas: [],
      sexo: "Fêmea"
    }
  });

  async function onSubmit(data: AnimalFormValues) {
    try {
      // Verifica autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para cadastrar um animal");
        navigate('/auth');
        return;
      }

      console.log('Dados do formulário:', data); // Debug
      const animalData: Omit<Animal, 'id' | 'created_at'> = {
        numero: data.numero,
        nome: data.nome || null,
        data_nascimento: data.data_nascimento,
        raca: data.raca,
        sexo: data.sexo,
        quantidade_partos: data.quantidade_partos,
        data_proximo_parto: data.data_proximo_parto || null,
        status: data.status,
        historico_vacinas: [],
        proximas_vacinas: data.proximas_vacinas || []
      };
      console.log('Dados a serem enviados:', animalData); // Debug
      const response = await addAnimal(animalData);
      console.log('Resposta do servidor:', response); // Debug
      queryClient.invalidateQueries({ queryKey: ["animais"] });
      toast.success("Animal cadastrado com sucesso!");
      form.reset();
    } catch (error) {
      console.error('Erro detalhado:', error); // Debug detalhado
      if (error instanceof Error) {
        toast.error(`Erro ao cadastrar animal: ${error.message}`);
      } else {
        toast.error("Erro ao cadastrar animal. Tente novamente.");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input placeholder="123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Mimosa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="raca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raça</FormLabel>
              <FormControl>
                <Input placeholder="Holandesa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sexo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Fêmea">Fêmea</SelectItem>
                  <SelectItem value="Macho">Macho</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantidade_partos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Partos</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Cadastrar Animal</Button>
      </form>
    </Form>
  );
} 