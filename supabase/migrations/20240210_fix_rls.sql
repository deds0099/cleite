-- Primeiro, vamos garantir que o RLS está ativado
ALTER TABLE animais DISABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar duplicação
DROP POLICY IF EXISTS "Usuários podem ver seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios animais" ON animais;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios animais" ON animais;

-- Recriar as políticas com condições mais estritas
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
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios animais"
ON animais FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verificar se há registros sem user_id
DO $$
BEGIN
    -- Remover registros que não têm user_id (se houver)
    DELETE FROM animais WHERE user_id IS NULL;
    
    -- Garantir que a coluna user_id é NOT NULL
    ALTER TABLE animais 
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN user_id SET DEFAULT auth.uid();
END $$; 