// =============================================================
// CONTROLLER: useAgendamentos
// -------------------------------------------------------------
// Orquestra a listagem de agendamentos (RF4/RF7). Converte os
// dados em instâncias do Model Agendamento.
// =============================================================
import { useState, useEffect, useCallback } from 'react';
import { agendamentoService } from '../services';
import { Agendamento } from '../models';

export function useAgendamentos(filtros = {}) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Serializamos os filtros para usar como dependência estável.
  const chaveFiltros = JSON.stringify(filtros);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const resp = await agendamentoService.listar(JSON.parse(chaveFiltros));
      const lista = resp.data ?? resp ?? [];
      setAgendamentos(lista.map((a) => new Agendamento(a)));
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [chaveFiltros]);

  useEffect(() => { carregar(); }, [carregar]);

  const cancelar = useCallback(async (id) => {
    const r = await agendamentoService.cancelar(id);
    await carregar();
    return r;
  }, [carregar]);

  const atualizarStatus = useCallback(async (id, status) => {
    const r = await agendamentoService.atualizarStatus(id, status);
    await carregar();
    return r;
  }, [carregar]);

  return { agendamentos, carregando, erro, carregar, cancelar, atualizarStatus };
}
