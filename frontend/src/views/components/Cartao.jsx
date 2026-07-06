// =============================================================
// COMPONENTE: Cartao (Card)
// -------------------------------------------------------------
// Contêiner visual com sombra e cantos arredondados. Usado para
// agrupar informações (métricas, itens de lista, formulários).
// Aceita "titulo" e "acoes" (área no topo à direita) opcionais.
// =============================================================
import estilos from './Cartao.module.css';

export default function Cartao({ titulo, acoes, children, className = '', ...resto }) {
  return (
    <div className={`${estilos.cartao} ${className}`} {...resto}>
      {(titulo || acoes) && (
        <div className={estilos.cabecalho}>
          {titulo && <h3 className={estilos.titulo}>{titulo}</h3>}
          {acoes && <div className={estilos.acoes}>{acoes}</div>}
        </div>
      )}
      <div className={estilos.corpo}>{children}</div>
    </div>
  );
}
