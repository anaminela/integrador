import estilos from './CampoTexto.module.css';

export default function CampoSelect({
  label,
  name,
  erro,
  opcoes = [],
  placeholder = 'Selecione...',
  ...resto
}) {
  return (
    <div className={estilos.grupo}>
      {label && (
        <label htmlFor={name} className={estilos.label}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`${estilos.input} ${erro ? estilos.inputErro : ''}`}
        {...resto}
      >
        <option value="">{placeholder}</option>
        {opcoes.map((op) => {
          const valor = typeof op === 'string' ? op : op.valor;
          const rotulo = typeof op === 'string' ? op : op.rotulo;
          return (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          );
        })}
      </select>
      {erro && <span className={estilos.mensagemErro}>{erro}</span>}
    </div>
  );
}
