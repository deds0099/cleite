-- Atualizar a tabela registros_leite para aceitar o novo tipo de período
ALTER TABLE registros_leite 
DROP CONSTRAINT IF EXISTS registros_leite_periodo_check;

ALTER TABLE registros_leite 
ADD CONSTRAINT registros_leite_periodo_check 
CHECK (periodo IN ('Manha', 'Tarde', 'Total'));

-- Permitir animal_id nulo
ALTER TABLE registros_leite 
ALTER COLUMN animal_id DROP NOT NULL; 