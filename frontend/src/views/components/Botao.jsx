// =============================================================
// COMPONENTE: Botao
// -------------------------------------------------------------
// Botão reutilizável com variações de cor (variante), tamanhos e
// estado de carregamento. Encapsula o estilo para manter
// consistência visual em toda a aplicação.
//
// Props:
//   variante: "primario" | "secundario" | "perigo" | "sucesso" | "fantasma"
//   tamanho: "pequeno" | "medio" | "grande"
//   carregando: mostra spinner e desabilita
//   ...resto: repassado ao <button> (onClick, type, disabled...)
// =============================================================
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
