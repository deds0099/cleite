-- Corrigir datas nos registros de leite
UPDATE registros_leite
SET data = date(date_trunc('day', data AT TIME ZONE 'UTC'));

-- Corrigir datas nos registros financeiros
UPDATE registros_financeiros
SET data = date(date_trunc('day', data AT TIME ZONE 'UTC'));

-- Corrigir datas nos alertas
UPDATE alertas
SET data = date(date_trunc('day', data AT TIME ZONE 'UTC'));

-- Corrigir datas nos animais
UPDATE animais
SET data_nascimento = date(date_trunc('day', data_nascimento AT TIME ZONE 'UTC')),
    data_proximo_parto = CASE 
                          WHEN data_proximo_parto IS NOT NULL 
                          THEN date(date_trunc('day', data_proximo_parto AT TIME ZONE 'UTC'))
                          ELSE NULL 
                        END; 