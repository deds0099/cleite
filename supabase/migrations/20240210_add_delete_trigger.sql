-- Criar função para o trigger de deleção
CREATE OR REPLACE FUNCTION delete_animal_related_records()
RETURNS TRIGGER AS $$
BEGIN
    -- Deletar registros de leite relacionados
    DELETE FROM registros_leite 
    WHERE animal_id = OLD.id AND user_id = OLD.user_id;

    -- Deletar alertas relacionados
    DELETE FROM alertas 
    WHERE animal_id = OLD.id AND user_id = OLD.user_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_delete_animal_related ON animais;
CREATE TRIGGER trigger_delete_animal_related
    BEFORE DELETE ON animais
    FOR EACH ROW
    EXECUTE FUNCTION delete_animal_related_records(); 