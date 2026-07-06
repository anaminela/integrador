import { useNotificacao } from '../../contexts/NotificacaoContext';
import estilos from './Toasts.module.css';

const ICONES = {
  sucesso: '✅',
  erro: '⛔',
  info: 'ℹ️',
  alerta: '⚠️',
};

export default function Toasts() {
  const { toasts, removerToast } = useNotificacao();

  return (
    <div className={estilos.container} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${estilos.toast} ${estilos[t.tipo] || ''}`}>
          <span className={estilos.icone}>{ICONES[t.tipo] || 'ℹ️'}</span>
          <span className={estilos.mensagem}>{t.mensagem}</span>
          <button className={estilos.fechar} onClick={() => removerToast(t.id)} aria-label="Fechar">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
