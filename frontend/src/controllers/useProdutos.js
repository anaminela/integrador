// =============================================================
// CONTROLLER: useProdutos
// -------------------------------------------------------------
// Orquestra estoque/cardápio (RF8). Converte dados em Produto e
// expõe ações de CRUD e movimentação de estoque.
// =============================================================
import { useState, useEffect, useCallback } from 'react';
import { produtoService } from '../services';
import { Produto } from '../models';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await produtoService.listar();
      const lista = resp.data ?? resp ?? [];
      setProdutos(lista.map((p) => new Produto(p)));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = useCallback(async (dados) => {
    const r = await produtoService.criar(dados);
    await carregar();
    return r;
  }, [carregar]);

  const atualizar = useCallback(async (id, dados) => {
    const r = await produtoService.atualizar(id, dados);
    await carregar();
    return r;
  }, [carregar]);

  const remover = useCallback(async (id) => {
    const r = await produtoService.remover(id);
    await carregar();
    return r;
  }, [carregar]);

  const movimentar = useCallback(async (id, dados) => {
    const r = await produtoService.movimentar(id, dados);
    await carregar();
    return r;
  }, [carregar]);

  return { produtos, carregando, erro, carregar, criar, atualizar, remover, movimentar };
}
