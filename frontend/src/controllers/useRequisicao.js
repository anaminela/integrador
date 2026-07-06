// =============================================================
// CONTROLLER BASE: useRequisicao
// -------------------------------------------------------------
// Hook genérico que orquestra QUALQUER chamada assíncrona à API,
// controlando três estados universais: carregando, erro e dados.
// É a "cola" entre as Views (componentes) e os Services (API),
// cumprindo o papel de Controller na arquitetura MVC do frontend.
//
// Uso típico:
//   const { dados, carregando, erro, executar } = useRequisicao(
//     () => quadraService.listar(),
//     { imediato: true }
//   );
// =============================================================
import { useState, useEffect, useCallback, useRef } from 'react';

export function useRequisicao(funcaoServico, { imediato = false } = {}) {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(imediato);
  const [erro, setErro] = useState(null);

  // Guardamos a função em uma ref para não recriar "executar" a cada render.
  const refFuncao = useRef(funcaoServico);
  refFuncao.current = funcaoServico;

  // executar(...args): dispara a chamada e atualiza os estados.
  const executar = useCallback(async (...args) => {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await refFuncao.current(...args);
      setDados(resposta);
      return resposta;
    } catch (e) {
      setErro(e);
      throw e; // repassa para o chamador tratar (ex.: exibir toast)
    } finally {
      setCarregando(false);
    }
  }, []);

  // Se "imediato", executa assim que o componente monta.
  useEffect(() => {
    if (imediato) {
      executar().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { dados, carregando, erro, executar, setDados };
}
