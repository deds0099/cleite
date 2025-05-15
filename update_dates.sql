-- Script para corrigir as datas no banco de dados
-- Este script adiciona 2 dias a todas as datas armazenadas para compensar o problema de fuso horário

-- Corrigir datas na tabela animais
UPDATE animais
SET data_nascimento = data_nascimento::date + interval '2 days'
WHERE data_nascimento IS NOT NULL;

UPDATE animais
SET data_proximo_parto = data_proximo_parto::date + interval '2 days'
WHERE data_proximo_parto IS NOT NULL;

-- Corrigir datas na tabela alertas
UPDATE alertas
SET data = data::date + interval '2 days'
WHERE data IS NOT NULL;

-- Corrigir datas na tabela registros_leite
UPDATE registros_leite
SET data = data::date + interval '2 days'
WHERE data IS NOT NULL;

-- Corrigir datas na tabela registros_financeiros
UPDATE registros_financeiros
SET data = data::date + interval '2 days'
WHERE data IS NOT NULL;

-- Nota: Após executar este script, é importante continuar usando a função fixDateDisplay
-- nos componentes do frontend para garantir que as datas sejam exibidas corretamente. 