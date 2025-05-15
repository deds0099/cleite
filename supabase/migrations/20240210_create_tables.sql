-- Criar a tabela de animais
CREATE TABLE IF NOT EXISTS animais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    numero TEXT NOT NULL,
    nome TEXT,
    data_nascimento DATE NOT NULL,
    raca TEXT NOT NULL,
    sexo TEXT CHECK (sexo IN ('Macho', 'Fêmea')) NOT NULL DEFAULT 'Fêmea',
    quantidade_partos INTEGER DEFAULT 0,
    data_proximo_parto DATE,
    historico_vacinas JSONB DEFAULT '[]'::jsonb,
    proximas_vacinas JSONB DEFAULT '[]'::jsonb,
    status TEXT CHECK (status IN ('Ativo', 'Inativo')) NOT NULL DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar a tabela de registros de leite
CREATE TABLE IF NOT EXISTS registros_leite (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    periodo TEXT CHECK (periodo IN ('Manha', 'Tarde', 'Total')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar a tabela de alertas
CREATE TABLE IF NOT EXISTS alertas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo TEXT CHECK (tipo IN ('Vacina', 'Parto', 'Inseminacao')) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pendente', 'Concluido')) NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_animais_user_id ON animais(user_id);
CREATE INDEX IF NOT EXISTS idx_animais_numero ON animais(numero);
CREATE INDEX IF NOT EXISTS idx_registros_leite_user_id ON registros_leite(user_id);
CREATE INDEX IF NOT EXISTS idx_registros_leite_animal_id ON registros_leite(animal_id);
CREATE INDEX IF NOT EXISTS idx_registros_leite_data ON registros_leite(data);
CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON alertas(user_id);
CREATE INDEX IF NOT EXISTS idx_alertas_animal_id ON alertas(animal_id);
CREATE INDEX IF NOT EXISTS idx_alertas_data ON alertas(data);

-- Habilitar RLS (Row Level Security)
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_leite ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para animais
CREATE POLICY "Usuários podem ver seus próprios animais"
ON animais FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios animais"
ON animais FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios animais"
ON animais FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Criar políticas de segurança para registros de leite
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

-- Criar políticas de segurança para alertas
CREATE POLICY "Usuários podem ver seus próprios alertas"
ON alertas FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios alertas"
ON alertas FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios alertas"
ON alertas FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Criar função para deletar animal e registros relacionados em uma transação
CREATE OR REPLACE FUNCTION delete_animal_and_related(animal_id UUID, user_id UUID)
RETURNS void AS $$
BEGIN
    -- Verificar se o animal pertence ao usuário
    IF NOT EXISTS (
        SELECT 1 FROM animais 
        WHERE id = animal_id AND user_id = user_id
    ) THEN
        RAISE EXCEPTION 'Animal não encontrado ou não pertence ao usuário';
    END IF;

    -- Deletar em ordem para respeitar as constraints de chave estrangeira
    DELETE FROM registros_leite 
    WHERE animal_id = animal_id AND user_id = user_id;

    DELETE FROM alertas 
    WHERE animal_id = animal_id AND user_id = user_id;

    DELETE FROM animais 
    WHERE id = animal_id AND user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar políticas de DELETE
CREATE POLICY "Usuários podem deletar seus próprios registros de leite"
ON registros_leite FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios alertas"
ON alertas FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios animais"
ON animais FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 