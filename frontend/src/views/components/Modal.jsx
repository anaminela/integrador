// =============================================================
// COMPONENTE: Modal (janela sobreposta)
// -------------------------------------------------------------
// Exibe conteúdo em uma camada acima da página (overlay).
// Fecha ao clicar no fundo ou no botão X. Usado para formulários
// de criação/edição e confirmações.
//
// Props:
//   aberto: controla a visibilidade
//   aoFechar: callback ao fechar
//   titulo: cabeçalho do modal
//   children: conteúdo
//   rodape: área opcional de botões no rodapé
// =============================================================
import { useEffect } from 'react';
import estilos from './Modal.module.css';

export default function Modal({ aberto, aoFechar, titulo, children, rodape }) {
  // Fecha com a tecla ESC e trava o scroll do fundo enquanto aberto.
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e) => {
      if (e.key === 'Escape') aoFechar?.();
    };
    document.addEventListener('keydown', aoTeclar);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = '';
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div className={estilos.overlay} onMouseDown={aoFechar}>
      {/* stopPropagation evita fechar ao clicar dentro do modal */}
      <div className={estilos.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={estilos.cabecalho}>
          <h3 className={estilos.titulo}>{titulo}</h3>
          <button className={estilos.fechar} onClick={aoFechar} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className={estilos.corpo}>{children}</div>
        {rodape && <div className={estilos.rodape}>{rodape}</div>}
      </div>
    </div>
  );
}
