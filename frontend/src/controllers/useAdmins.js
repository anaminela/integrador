import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services';
import { Usuario } from '../models';

export function useAdmins(tipoPerfil) {
  const [admins, setAdmins] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await adminService.listar(tipoPerfil);
      const lista = resp.data ?? resp ?? [];
      setAdmins(lista.map((u) => new Usuario(u)));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [tipoPerfil]);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = useCallback(async (dados) => {
    const r = await adminService.criar(dados);
    await carregar();
    return r;
  }, [carregar]);

  const atualizar = useCallback(async (id, dados) => {
    const r = await adminService.atualizar(id, dados);
    await carregar();
    return r;
  }, [carregar]);

  const reativar = useCallback(async (id) => {
    const r = await adminService.reativar(id);
    await carregar();
    return r;
  }, [carregar]);

  const remover = useCallback(async (id) => {
    const r = await adminService.remover(id);
    await carregar();
    return r;
  }, [carregar]);

  return { admins, carregando, erro, carregar, criar, atualizar, reativar, remover };
}
