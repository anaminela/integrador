
import { createContext, useContext, useState, useCallback } from 'react';

const NotificacaoContext = createContext(null);

let contadorId = 0; 

export function NotificacaoProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [central, setCentral] = useState([]);

  // Remove um toast pelo id.
  const removerToast = useCallback((id) => {
    setToasts((atuais) => atuais.filter((t) => t.id !== id));
  }, []);

  const notificar = useCallback(
    (mensagem, tipo = 'info', duracao = 4000) => {
      const id = ++contadorId;
      setToasts((atuais) => [...atuais, { id, mensagem, tipo }]);
      setCentral((atuais) => [
        { id, mensagem, tipo, data: new Date().toISOString(), lida: false },
        ...atuais,
      ]);
      if (duracao > 0) {
        setTimeout(() => removerToast(id), duracao);
      }
      return id;
    },
    [removerToast],
  );

  const sucesso = useCallback((msg) => notificar(msg, 'sucesso'), [notificar]);
  const erro = useCallback((msg) => notificar(msg, 'erro', 6000), [notificar]);
  const info = useCallback((msg) => notificar(msg, 'info'), [notificar]);
  const alerta = useCallback((msg) => notificar(msg, 'alerta', 6000), [notificar]);

  const marcarTodasLidas = useCallback(() => {
    setCentral((atuais) => atuais.map((n) => ({ ...n, lida: true })));
  }, []);

  const limparCentral = useCallback(() => setCentral([]), []);

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
