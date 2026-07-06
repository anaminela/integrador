import estilos from './Badge.module.css';

export default function Badge({ children, tom = 'neutro' }) {
  return <span className={`${estilos.badge} ${estilos[tom] || ''}`}>{children}</span>;
}
