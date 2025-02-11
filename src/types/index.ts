export interface Animal {
  id: string;
  user_id: string;
  numero: string;
  nome?: string;
  data_nascimento: string;
  raca: string;
  sexo: 'Macho' | 'Fêmea';
  quantidade_partos: number;
  data_proximo_parto?: string;
  historico_vacinas: Vacina[];
  proximas_vacinas: Vacina[];
  status: 'Ativo' | 'Inativo';
  created_at?: string;
}

export interface Vacina {
  nome: string;
  data: string;
  observacoes?: string;
}

export interface Alerta {
  id: string;
  user_id: string;
  animal_id: string;
  tipo: 'Vacina' | 'Parto' | 'Inseminacao';
  data: string;
  descricao: string;
  status: 'Pendente' | 'Concluido';
  created_at?: string;
}

export interface RegistroLeite {
  id: string;
  user_id: string;
  animal_id?: string | null;
  data: string;
  quantidade: number;
  periodo: 'Manha' | 'Tarde' | 'Total';
  created_at?: string;
}

export interface RegistroFinanceiro {
  id: string;
  user_id: string;
  data: string;
  tipo: 'Receita' | 'Despesa';
  categoria: string;
  valor: number;
  descricao: string;
  created_at?: string;
}

export interface DadosNutricao {
  id: string;
  user_id: string;
  animal_id: string;
  data: string;
  racao: string;
  quantidade: number;
  observacoes?: string;
  created_at?: string;
}

export interface FarmProfile {
  id: string;
  user_id: string;
  farm_name: string;
  city: string;
  created_at?: string;
}

export interface AuthError {
  message: string;
}
