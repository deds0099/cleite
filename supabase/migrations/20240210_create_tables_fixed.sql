-- Remover tabelas existentes se houver
DROP TABLE IF EXISTS alertas CASCADE;
DROP TABLE IF EXISTS registros_leite CASCADE;
DROP TABLE IF EXISTS animais CASCADE;

-- Criar a tabela de animais
CREATE TABLE animais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
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
CREATE TABLE registros_leite (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    animal_id UUID REFERENCES animais(id),
    data DATE NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL,
    periodo TEXT CHECK (periodo IN ('Manha', 'Tarde', 'Total')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar a tabela de alertas
CREATE TABLE alertas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    animal_id UUID REFERENCES animais(id),
    tipo TEXT CHECK (tipo IN ('Vacina', 'Parto', 'Inseminacao')) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pendente', 'Concluido')) NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX idx_animais_user_id ON animais(user_id);
CREATE INDEX idx_animais_numero ON animais(numero);
CREATE INDEX idx_registros_leite_user_id ON registros_leite(user_id);
CREATE INDEX idx_registros_leite_animal_id ON registros_leite(animal_id);
CREATE INDEX idx_registros_leite_data ON registros_leite(data);
CREATE INDEX idx_alertas_user_id ON alertas(user_id);
CREATE INDEX idx_alertas_animal_id ON alertas(animal_id);
CREATE INDEX idx_alertas_data ON alertas(data);

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