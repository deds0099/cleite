-- Adicionar coluna user_id em todas as tabelas
ALTER TABLE animais ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id);
ALTER TABLE alertas ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id);
ALTER TABLE registros_leite ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id);
ALTER TABLE registros_financeiros ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id);
ALTER TABLE dados_nutricao ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id);

-- Criar índices para melhor performance
CREATE INDEX idx_animais_user_id ON animais(user_id);
CREATE INDEX idx_alertas_user_id ON alertas(user_id);
CREATE INDEX idx_registros_leite_user_id ON registros_leite(user_id);
CREATE INDEX idx_registros_financeiros_user_id ON registros_financeiros(user_id);
CREATE INDEX idx_dados_nutricao_user_id ON dados_nutricao(user_id);

-- Criar políticas de segurança RLS (Row Level Security)
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_leite ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_nutricao ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para animais
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

CREATE POLICY "Usuários podem deletar seus próprios animais"
ON animais FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para alertas
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

-- Políticas para registros de leite
CREATE POLICY "Usuários podem ver seus próprios registros de leite"
ON registros_leite FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de leite"
ON registros_leite FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Políticas para registros financeiros
CREATE POLICY "Usuários podem ver seus próprios registros financeiros"
ON registros_financeiros FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros financeiros"
ON registros_financeiros FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Políticas para dados de nutrição
CREATE POLICY "Usuários podem ver seus próprios dados de nutrição"
ON dados_nutricao FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios dados de nutrição"
ON dados_nutricao FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Políticas para perfis de fazenda
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON farm_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON farm_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id); 