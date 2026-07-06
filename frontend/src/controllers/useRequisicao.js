import { useState, useEffect, useCallback, useRef } from 'react';

export function useRequisicao(funcaoServico, { imediato = false } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(imediato);
  const [erro, setErro] = useState(null);

  const refFuncao = useRef(funcaoServico);
  refFuncao.current = funcaoServico;

  const executar = useCallback(async (...args) => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await refFuncao.current(...args);
      setDados(resposta);
      return resposta;
    } catch (e) {
      setErro(e);
      throw e;
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (imediato) {
      executar().catch(() => {});
    }
  }, []);

  return { dados, carregando, erro, executar, setDados };
}
