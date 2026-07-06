import estilos from './Botao.module.css';

export default function Botao({
  children,
  variante = 'primario',
  tamanho = 'medio',
  carregando = false,
  className = '',
  disabled,
  ...resto
}) {
  const classes = [
    estilos.botao,
    estilos[variante],
    estilos[tamanho],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || carregando} {...resto}>
      {carregando && <span className={estilos.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
