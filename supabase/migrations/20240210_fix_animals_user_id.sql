-- Desabilitar RLS temporariamente
ALTER TABLE animais DISABLE ROW LEVEL SECURITY;

-- Remover restrições existentes se houver
ALTER TABLE animais DROP COLUMN IF EXISTS user_id;

-- Adicionar a coluna user_id
ALTER TABLE animais 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Atualizar registros existentes (se houver) com o ID do primeiro usuário
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    IF first_user_id IS NOT NULL THEN
        UPDATE animais SET user_id = first_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Tornar a coluna NOT NULL
ALTER TABLE animais 
ALTER COLUMN user_id SET NOT NULL;

-- Criar índice
DROP INDEX IF EXISTS idx_animais_user_id;
CREATE INDEX idx_animais_user_id ON animais(user_id);

-- Habilitar RLS
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;

-- Recriar políticas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios animais" ON animais;

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