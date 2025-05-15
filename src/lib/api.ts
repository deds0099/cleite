import { supabase } from '@/integrations/supabase/client';
import { Animal, Alerta, RegistroLeite, RegistroFinanceiro, DadosNutricao, FarmProfile } from '@/types';
import { ajustarDataBrasil } from './utils';

// Funções para Animais
export const getAnimais = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Sessão:', session); // Debug

    if (!session) {
      console.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('Buscando animais para o usuário:', session.user.id);

    const { data, error } = await supabase
      .from('animais')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao buscar animais:', error);
      throw new Error(`Erro ao buscar animais: ${error.message}`);
    }

    if (!data) {
      console.log('Nenhum animal encontrado');
      return [];
    }

    console.log('Animais encontrados:', data);
    return data as Animal[];
  } catch (error) {
    console.error('Erro inesperado ao buscar animais:', error);
    throw error;
  }
};

export const addAnimal = async (animal: Omit<Animal, 'id' | 'created_at'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  console.log('Tentando adicionar animal:', animal);
  
  // Ajustar as datas para garantir consistência
  const dataNascimento = new Date(animal.data_nascimento);
  dataNascimento.setHours(0, 0, 0, 0); // Definir meia-noite
  
  let dataProximoParto = null;
  if (animal.data_proximo_parto) {
    const proximoParto = new Date(animal.data_proximo_parto);
    proximoParto.setHours(0, 0, 0, 0);
    dataProximoParto = proximoParto.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  const { data, error } = await supabase
    .from('animais')
    .insert([{
      ...animal,
      user_id: session.user.id,
      data_nascimento: dataNascimento.toISOString().split('T')[0], // Formato YYYY-MM-DD
      data_proximo_parto: dataProximoParto
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao adicionar animal:', error);
    throw new Error(`Erro ao adicionar animal: ${error.message}`);
  }
  
  console.log('Animal adicionado com sucesso:', data);
  return data as Animal;
};

export const updateAnimal = async (id: string, animal: Omit<Animal, 'id' | 'created_at'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  // Ajustar as datas para garantir consistência
  if (animal.data_nascimento) {
    const dataNascimento = new Date(animal.data_nascimento);
    dataNascimento.setHours(0, 0, 0, 0);
    animal.data_nascimento = dataNascimento.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }
  
  if (animal.data_proximo_parto) {
    const proximoParto = new Date(animal.data_proximo_parto);
    proximoParto.setHours(0, 0, 0, 0);
    animal.data_proximo_parto = proximoParto.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  const { data, error } = await supabase
    .from('animais')
    .update(animal)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Animal;
};

export const getAnimal = async (id: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('animais')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();
  if (error) throw error;
  return data as Animal;
};

export const deleteAnimal = async (id: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Usuário não autenticado');

    // Com o CASCADE configurado no banco, apenas precisamos excluir o animal
    const { error } = await supabase
      .from('animais')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao deletar animal:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    throw error;
  }
};

// Funções para Alertas
export const getAlertas = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('alertas')
    .select('*')
    .eq('user_id', session.user.id);
  if (error) throw error;
  return data as Alerta[];
};

export const addAlerta = async (alerta: Omit<Alerta, 'id' | 'created_at'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  // Ajustar a data para garantir consistência
  const dataAlerta = new Date(alerta.data);
  dataAlerta.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('alertas')
    .insert([{ 
      ...alerta, 
      data: dataAlerta.toISOString().split('T')[0], // Formato YYYY-MM-DD
      user_id: session.user.id 
    }])
    .select()
    .single();
  if (error) throw error;
  return data as Alerta;
};

// Funções para Registros de Leite
export const getRegistrosLeite = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Sessão em getRegistrosLeite:', session); // Debug

    if (!session) {
      console.error('Usuário não autenticado em getRegistrosLeite');
      throw new Error('Usuário não autenticado');
    }

    console.log('Buscando registros para o usuário:', session.user.id);

    const { data, error } = await supabase
      .from('registros_leite')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Erro ao buscar registros:', error);
      throw new Error(`Erro ao buscar registros: ${error.message}`);
    }

    if (!data) {
      console.log('Nenhum registro encontrado');
      return [];
    }

    console.log('Registros encontrados:', data);
    return data as RegistroLeite[];
  } catch (error) {
    console.error('Erro inesperado em getRegistrosLeite:', error);
    throw error;
  }
};

export const deleteRegistroLeite = async (id: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('registros_leite')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    throw error;
  }
};

export const addRegistroLeite = async (registro: Omit<RegistroLeite, 'id' | 'created_at'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  // Ajustar a data para garantir consistência
  const dataRegistro = new Date(registro.data);
  dataRegistro.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('registros_leite')
    .insert({
      animal_id: registro.animal_id || null,
      data: dataRegistro.toISOString().split('T')[0], // Formato YYYY-MM-DD
      quantidade: registro.quantidade,
      periodo: registro.periodo,
      user_id: session.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as RegistroLeite;
};

// Tipos para o financeiro
export type TipoTransacao = 'Receita' | 'Despesa';

export interface RegistroFinanceiroBase {
  tipo: TipoTransacao;
  categoria: string;
  valor: number;
  descricao: string;
  data: string;
}

export interface RegistroFinanceiro extends RegistroFinanceiroBase {
  id: string;
  user_id: string;
  created_at: string;
}

export interface NovoRegistroFinanceiro extends Omit<RegistroFinanceiroBase, 'descricao'> {
  user_id: string;
  descricao?: string;
}

// Funções para o financeiro
export async function getRegistrosFinanceiros() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Não autorizado');
  }

  const { data, error } = await supabase
    .from('registros_financeiros')
    .select('*')
    .eq('user_id', session.user.id)
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao buscar registros financeiros:', error);
    throw error;
  }

  return data as RegistroFinanceiro[];
}

export async function addRegistroFinanceiro(registro: NovoRegistroFinanceiro) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Não autorizado');
  }

  // Ajustar a data para garantir consistência
  const dataRegistro = new Date(registro.data);
  dataRegistro.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('registros_financeiros')
    .insert({
      ...registro,
      data: dataRegistro.toISOString().split('T')[0], // Formato YYYY-MM-DD
      descricao: registro.descricao || '',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar registro financeiro:', error);
    throw error;
  }

  return data as RegistroFinanceiro;
}

export async function deleteRegistroFinanceiro(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Não autorizado');
  }

  const { error } = await supabase
    .from('registros_financeiros')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Erro ao deletar registro financeiro:', error);
    throw error;
  }
}

// Funções para Dados de Nutrição
export const getDadosNutricao = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('dados_nutricao')
    .select('*')
    .eq('user_id', session.user.id);
  if (error) throw error;
  return data as DadosNutricao[];
};

export const addDadosNutricao = async (dados: Omit<DadosNutricao, 'id' | 'created_at'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('dados_nutricao')
    .insert([{ ...dados, user_id: session.user.id }])
    .select()
    .single();
  if (error) throw error;
  return data as DadosNutricao;
};

// Funções para Perfil da Fazenda
export const getFarmProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Sessão:', session); // Debug

    if (!session) {
      console.error('Usuário não autenticado');
      throw new Error('Usuário não autenticado');
    }

    console.log('Buscando perfil para o usuário:', session.user.id); // Debug

    const { data, error } = await supabase
      .from('farm_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      // Se o erro for de registro não encontrado, vamos criar um perfil vazio
      if (error.code === 'PGRST116') {
        console.log('Perfil não encontrado, criando novo...'); // Debug
        const { data: newProfile, error: createError } = await supabase
          .from('farm_profiles')
          .insert([{ 
            user_id: session.user.id,
            farm_name: '',
            city: ''
          }])
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          throw new Error(`Erro ao criar perfil: ${createError.message}`);
        }

        return newProfile as FarmProfile;
      }
      throw new Error(`Erro ao buscar perfil: ${error.message}`);
    }

    console.log('Perfil encontrado:', data); // Debug
    return data as FarmProfile;
  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error);
    throw error;
  }
};

export const updateFarmProfile = async (profile: Omit<FarmProfile, 'id' | 'user_id' | 'created_at'>) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('farm_profiles')
    .update(profile)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  }
  return data as FarmProfile;
};
