// =============================================================
// COMPONENTE: Carregando (spinner)
// -------------------------------------------------------------
// Indicador visual de carregamento. Usa a classe global .spinner
// definida em tema.css.
// =============================================================
export default function Carregando({ texto = 'Carregando...' }) {
  return (
    <div className="text-center" style={{ padding: '32px 0' }}>
      <div className="spinner" />
      <p className="text-suave">{texto}</p>
    </div>
  );
}
