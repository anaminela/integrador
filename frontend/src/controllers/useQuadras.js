// =============================================================
// CONTROLLER: useQuadras
// -------------------------------------------------------------
// Orquestra a listagem/CRUD de quadras, convertendo os dados
// crus da API em instâncias do Model Quadra.
// =============================================================
import { useState, useEffect, useCallback } from 'react';
import { quadraService } from '../services';
import { Quadra } from '../models';

export function useQuadras() {
  const [quadras, setQuadras] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await quadraService.listar();
      const lista = resp.data ?? resp ?? [];
      setQuadras(lista.map((q) => new Quadra(q)));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(async (dados) => {
    const resp = await quadraService.criar(dados);
    await carregar();
    return resp;
  }, [carregar]);

  const atualizar = useCallback(async (id, dados) => {
    const resp = await quadraService.atualizar(id, dados);
    await carregar();
    return resp;
  }, [carregar]);

  const remover = useCallback(async (id) => {
    const resp = await quadraService.remover(id);
    await carregar();
    return resp;
  }, [carregar]);

  return { quadras, carregando, erro, carregar, criar, atualizar, remover };
}
