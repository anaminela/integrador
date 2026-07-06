import { useState, useEffect, useCallback } from 'react';
import { usuarioService } from '../services';
import { Usuario } from '../models';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await usuarioService.listar();
      const lista = resp.data ?? resp ?? [];
      setUsuarios(lista.map((u) => new Usuario(u)));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const atualizar = useCallback(async (id, dados) => {
    const r = await usuarioService.atualizar(id, dados);
    await carregar();
    return r;
  }, [carregar]);

  const remover = useCallback(async (id) => {
    const r = await usuarioService.remover(id);
    await carregar();
    return r;
  }, [carregar]);

  return { usuarios, carregando, erro, carregar, atualizar, remover };
}
