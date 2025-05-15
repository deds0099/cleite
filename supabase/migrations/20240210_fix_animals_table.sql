-- Primeiro, vamos verificar e corrigir a estrutura da tabela animais
DO $$
BEGIN
    -- Adicionar coluna user_id se não existir
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'animais'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE animais
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Garantir que a coluna user_id é NOT NULL
ALTER TABLE animais
ALTER COLUMN user_id SET NOT NULL;

-- Recriar o índice
DROP INDEX IF EXISTS idx_animais_user_id;
CREATE INDEX idx_animais_user_id ON animais(user_id);

-- Recriar as políticas de segurança
DROP POLICY IF EXISTS "Usuários podem ver seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios animais" ON animais;

-- Habilitar RLS
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;

-- Criar políticas
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