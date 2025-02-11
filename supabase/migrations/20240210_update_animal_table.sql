-- Atualiza a tabela de animais com novos campos
ALTER TABLE animais
ADD COLUMN sexo text CHECK (sexo IN ('Macho', 'Fêmea')) NOT NULL DEFAULT 'Fêmea',
ADD COLUMN quantidade_partos integer DEFAULT 0,
ADD COLUMN data_proximo_parto date,
ADD COLUMN historico_vacinas jsonb DEFAULT '[]'::jsonb,
ADD COLUMN proximas_vacinas jsonb DEFAULT '[]'::jsonb;

-- Adiciona um trigger para criar alertas automaticamente quando próximo parto ou vacina for atualizado
CREATE OR REPLACE FUNCTION criar_alerta_animal()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar alerta para parto se data foi atualizada
    IF NEW.data_proximo_parto IS NOT NULL AND 
       (OLD.data_proximo_parto IS NULL OR OLD.data_proximo_parto != NEW.data_proximo_parto) THEN
        INSERT INTO alertas (animal_id, tipo, data, descricao, status)
        VALUES (NEW.id, 'Parto', NEW.data_proximo_parto, 'Parto previsto', 'Pendente');
    END IF;

    -- Criar alertas para vacinas se foram atualizadas
    IF NEW.proximas_vacinas != OLD.proximas_vacinas OR OLD.proximas_vacinas IS NULL THEN
        INSERT INTO alertas (animal_id, tipo, data, descricao, status)
        SELECT 
            NEW.id,
            'Vacina',
            (vacina->>'data')::date,
            'Vacina: ' || (vacina->>'nome'),
            'Pendente'
        FROM jsonb_array_elements(NEW.proximas_vacinas) AS vacina;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_criar_alerta_animal
AFTER UPDATE ON animais
FOR EACH ROW
EXECUTE FUNCTION criar_alerta_animal(); 