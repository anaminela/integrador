// =============================================================
// COMPONENTE: Alerta
// -------------------------------------------------------------
// Caixa de mensagem contextual (info/sucesso/erro/alerta) para
// exibir avisos dentro das páginas (ex.: erro de formulário).
// =============================================================
import estilos from './Alerta.module.css';

export default function Alerta({ tipo = 'info', children }) {
  if (!children) return null;
  return <div className={`${estilos.alerta} ${estilos[tipo] || ''}`}>{children}</div>;
}
