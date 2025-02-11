-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver seus próprios registros de leite" ON registros_leite;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios registros de leite" ON registros_leite;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios registros de leite" ON registros_leite;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios registros de leite" ON registros_leite;

-- Remover tabelas se existirem
DROP TABLE IF EXISTS registros_leite CASCADE;
DROP TABLE IF EXISTS registros_financeiros CASCADE;
DROP TABLE IF EXISTS dados_nutricao CASCADE;

-- Criar função para ajustar fuso horário
CREATE OR REPLACE FUNCTION ajustar_data_registro()
RETURNS TRIGGER AS $$
BEGIN
    -- Ajusta a data para meia-noite no fuso horário local
    NEW.data = date_trunc('day', NEW.data AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela de registros de leite
CREATE TABLE registros_leite (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    animal_id UUID REFERENCES animais(id),
    data DATE NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    periodo TEXT CHECK (periodo IN ('Manha', 'Tarde', 'Total')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar trigger para ajustar a data
CREATE TRIGGER trigger_ajustar_data_registro
    BEFORE INSERT OR UPDATE ON registros_leite
    FOR EACH ROW
    EXECUTE FUNCTION ajustar_data_registro();

-- Criar índices para melhor performance
CREATE INDEX idx_registros_leite_user_id ON registros_leite(user_id);
CREATE INDEX idx_registros_leite_animal_id ON registros_leite(animal_id);
CREATE INDEX idx_registros_leite_data ON registros_leite(data);

-- Habilitar RLS
ALTER TABLE registros_leite ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios registros de leite"
ON registros_leite FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de leite"
ON registros_leite FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de leite"
ON registros_leite FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de leite"
ON registros_leite FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Criar tabela de registros financeiros
CREATE TABLE registros_financeiros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    data DATE NOT NULL,
    tipo TEXT CHECK (tipo IN ('Receita', 'Despesa')) NOT NULL,
    categoria TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices
CREATE INDEX idx_registros_financeiros_user_id ON registros_financeiros(user_id);
CREATE INDEX idx_registros_financeiros_data ON registros_financeiros(data);

-- Habilitar RLS
ALTER TABLE registros_financeiros ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios registros financeiros"
ON registros_financeiros FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros financeiros"
ON registros_financeiros FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros financeiros"
ON registros_financeiros FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros financeiros"
ON registros_financeiros FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Criar tabela de dados de nutrição
CREATE TABLE dados_nutricao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    animal_id UUID NOT NULL REFERENCES animais(id),
    data DATE NOT NULL,
    racao TEXT NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices
CREATE INDEX idx_dados_nutricao_user_id ON dados_nutricao(user_id);
CREATE INDEX idx_dados_nutricao_animal_id ON dados_nutricao(animal_id);
CREATE INDEX idx_dados_nutricao_data ON dados_nutricao(data);

-- Habilitar RLS
ALTER TABLE dados_nutricao ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Usuários podem ver seus próprios dados de nutrição"
ON dados_nutricao FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados de nutrição"
ON dados_nutricao FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios dados de nutrição"
ON dados_nutricao FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios dados de nutrição"
ON dados_nutricao FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 