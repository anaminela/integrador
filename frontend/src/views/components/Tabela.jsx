import estilos from './Tabela.module.css';

export default function Tabela({ colunas, dados = [], vazio = 'Nenhum registro encontrado.' }) {
  if (!dados.length) {
    return <p className="estado-vazio">{vazio}</p>;
  }

  return (
    <div className={estilos.wrapper}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.chave}>{c.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, i) => (
            <tr key={linha.id ?? i}>
              {colunas.map((c) => (
                <td key={c.chave} data-label={c.titulo}>
                  {c.render ? c.render(linha) : linha[c.chave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
