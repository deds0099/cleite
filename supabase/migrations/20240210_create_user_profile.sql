-- Criar a tabela de perfis de fazenda
CREATE TABLE IF NOT EXISTS farm_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    farm_name TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índice para melhor performance
CREATE INDEX idx_farm_profiles_user_id ON farm_profiles(user_id);

-- Habilitar RLS na tabela de perfis
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para perfis
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON farm_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seu próprio perfil"
ON farm_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON farm_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Adicionar trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.farm_profiles (user_id, farm_name, city)
  VALUES (new.id, '', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 