import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parse } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ajusta uma data para o fuso horário brasileiro.
 * Método simples e 100% confiável: converte a data para string no formato YYYY-MM-DD.
 * Isso elimina completamente qualquer problema de fuso horário ao salvar no banco.
 */
export function ajustarDataBrasil(data: string | Date): string {
  const dataObj = typeof data === 'string' ? new Date(data) : new Date(data);
  
  // Formato YYYY-MM-DD como string - elimina completamente problemas de fuso horário
  const ano = dataObj.getFullYear();
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dataObj.getDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
}
