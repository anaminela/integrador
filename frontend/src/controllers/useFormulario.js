import { useState, useCallback } from 'react';
import { formularioValido } from '../utils/validadores';

export function useFormulario(valoresIniciais, validar) {
  const [valores, setValores] = useState(valoresIniciais);
  const [erros, setErros] = useState({});

  const aoMudar = useCallback((evento) => {
    const { name, value, type, checked } = evento.target;
    const valorFinal = type === 'checkbox' ? checked : value;
    setValores((atuais) => ({ ...atuais, [name]: valorFinal }));
  }, []);

  const definirCampo = useCallback((nome, valor) => {
    setValores((atuais) => ({ ...atuais, [nome]: valor }));
  }, []);

  const validarTudo = useCallback(() => {
    if (!validar) return true;
    const novosErros = validar(valores);
    setErros(novosErros);
    return formularioValido(novosErros);
  }, [validar, valores]);

  const resetar = useCallback(() => {
    setValores(valoresIniciais);
    setErros({});
  }, [valoresIniciais]);

  return { valores, erros, aoMudar, definirCampo, validarTudo, resetar, setValores, setErros };
}
