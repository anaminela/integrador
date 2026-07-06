// =============================================================
// COMPONENTE: CampoTexto
// -------------------------------------------------------------
// Input controlado com rótulo (label), mensagem de erro e
// suporte a diferentes tipos (text, email, password, date...).
// Padroniza a aparência dos formulários e a exibição de erros.
// =============================================================
import estilos from './CampoTexto.module.css';

export default function CampoTexto({
  label,
  name,
  erro,
  tipo = 'text',
  ...resto
}) {
  return (
    <div className={estilos.grupo}>
      {label && (
        <label htmlFor={name} className={estilos.label}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={tipo}
        className={`${estilos.input} ${erro ? estilos.inputErro : ''}`}
        {...resto}
      />
      {erro && <span className={estilos.mensagemErro}>{erro}</span>}
    </div>
  );
}
