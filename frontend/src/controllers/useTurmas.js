import { useState, useEffect, useCallback } from 'react';
import { turmaService } from '../services';
import { Turma } from '../models';

export function useTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await turmaService.listar();
      const lista = resp.data ?? resp ?? [];
      setTurmas(lista.map((t) => new Turma(t)));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = useCallback(async (dados) => {
    const r = await turmaService.criar(dados);
    await carregar();
    return r;
  }, [carregar]);

  const inscrever = useCallback(async (id, telefone) => {
    const r = await turmaService.inscrever(id, telefone);
    await carregar();
    return r;
  }, [carregar]);

  const entrarNaFila = useCallback(async (id) => {
    const r = await turmaService.entrarNaFila(id);
    await carregar();
    return r;
  }, [carregar]);

  return { turmas, carregando, erro, carregar, criar, inscrever, entrarNaFila };
}
