// =============================================================
// CONTROLLER: useFormulario
// -------------------------------------------------------------
// Hook reutilizável para formulários controlados. Gerencia:
//   • valores dos campos
//   • erros por campo
//   • handlers de mudança (com máscara opcional)
//   • validação sob demanda
//
// A função "validar" (opcional) recebe os valores e retorna um
// objeto { campo: mensagemDeErro }. Campos sem erro têm string "".
// =============================================================
import { useState, useCallback } from 'react';
import { formularioValido } from '../utils/validadores';

export function useFormulario(valoresIniciais, validar) {
  const [valores, setValores] = useState(valoresIniciais);
  const [erros, setErros] = useState({});

  // Atualiza um campo pelo nome. Aceita máscara opcional (função).
  const aoMudar = useCallback((evento) => {
    const { name, value, type, checked } = evento.target;
    const valorFinal = type === 'checkbox' ? checked : value;
    setValores((atuais) => ({ ...atuais, [name]: valorFinal }));
  }, []);

  // Define o valor de um campo diretamente (útil para máscaras).
  const definirCampo = useCallback((nome, valor) => {
    setValores((atuais) => ({ ...atuais, [nome]: valor }));
  }, []);

  // Valida todos os campos. Retorna true se estiver tudo ok.
  const validarTudo = useCallback(() => {
    if (!validar) return true;
    const novosErros = validar(valores);
    setErros(novosErros);
    return formularioValido(novosErros);
  }, [validar, valores]);

  // Reinicia o formulário aos valores iniciais.
  const resetar = useCallback(() => {
    setValores(valoresIniciais);
    setErros({});
  }, [valoresIniciais]);

  return { valores, erros, aoMudar, definirCampo, validarTudo, resetar, setValores, setErros };
}
