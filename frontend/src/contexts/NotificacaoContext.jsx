// =============================================================
// CONTEXT: Notificações in-app (toasts + central)
// -------------------------------------------------------------
// Substitui o WhatsApp (fora do escopo) por notificações dentro
// da aplicação. Oferece duas coisas:
//   1. Toasts temporários (feedback de ações: sucesso/erro/info)
//   2. Uma "central" que acumula avisos para o sino do cabeçalho
//
// Qualquer componente pode disparar uma notificação chamando o
// hook useNotificacao().
// =============================================================
import { createContext, useContext, useState, useCallback } from 'react';

const NotificacaoContext = createContext(null);

let contadorId = 0; // gera ids únicos para cada notificação

export function NotificacaoProvider({ children }) {
  // Toasts visíveis no canto da tela (some sozinho).
  const [toasts, setToasts] = useState([]);
  // Central: lista persistente na sessão (sino do cabeçalho).
  const [central, setCentral] = useState([]);

  // Remove um toast pelo id.
  const removerToast = useCallback((id) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
  }, []);

  // Dispara um toast. tipo: "sucesso" | "erro" | "info" | "alerta".
  const notificar = useCallback(
    (mensagem, tipo = 'info', duracao = 4000) => {
      const id = ++contadorId;
      setToasts((atuais) => [...atuais, { id, mensagem, tipo }]);
      // Também registra na central para consulta posterior.
      setCentral((atuais) => [
        { id, mensagem, tipo, data: new Date().toISOString(), lida: false },
        ...atuais,
      ]);
      // Remove automaticamente após "duracao" ms.
      if (duracao > 0) {
        setTimeout(() => removerToast(id), duracao);
      }
      return id;
    },
    [removerToast],
  );

  // Atalhos semânticos.
  const sucesso = useCallback((msg) => notificar(msg, 'sucesso'), [notificar]);
  const erro = useCallback((msg) => notificar(msg, 'erro', 6000), [notificar]);
  const info = useCallback((msg) => notificar(msg, 'info'), [notificar]);
  const alerta = useCallback((msg) => notificar(msg, 'alerta', 6000), [notificar]);

  // Marca todas as notificações da central como lidas.
  const marcarTodasLidas = useCallback(() => {
    setCentral((atuais) => atuais.map((n) => ({ ...n, lida: true })));
  }, []);

  // Limpa a central.
  const limparCentral = useCallback(() => setCentral([]), []);

  // Adiciona várias notificações de uma vez à central (ex.: lembretes do backend).
  const adicionarNaCentral = useCallback((lista) => {
    const novas = lista.map((item) => ({
      id: ++contadorId,
      mensagem: item.mensagem ?? String(item),
      tipo: item.tipo ?? 'info',
      data: item.data ?? new Date().toISOString(),
      lida: false,
    }));
    setCentral((atuais) => [...novas, ...atuais]);
  }, []);

  const naoLidas = central.filter((n) => !n.lida).length;

  const valor = {
    toasts,
    central,
    naoLidas,
    notificar,
    sucesso,
    erro,
    info,
    alerta,
    removerToast,
    marcarTodasLidas,
    limparCentral,
    adicionarNaCentral,
  };

  return (
    <NotificacaoContext.Provider value={valor}>
      {children}
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  const ctx = useContext(NotificacaoContext);
  if (!ctx) {
    throw new Error('useNotificacao deve ser usado dentro de <NotificacaoProvider>.');
  }
  return ctx;
}
