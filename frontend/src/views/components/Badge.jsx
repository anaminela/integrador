// =============================================================
// COMPONENTE: Badge (etiqueta de status)
// -------------------------------------------------------------
// Pequeno rótulo colorido para indicar status (confirmado,
// pendente, pago, estoque baixo...). A cor é definida pela
// prop "tom".
// =============================================================
import estilos from './Badge.module.css';

export default function Badge({ children, tom = 'neutro' }) {
  return <span className={`${estilos.badge} ${estilos[tom] || ''}`}>{children}</span>;
}
