export default function EstadoVazio({ icone = '🏖️', mensagem = 'Nada por aqui ainda.', children }) {
  return (
    <div className="estado-vazio">
      <div style={{ fontSize: '2.4rem', marginBottom: 8 }}>{icone}</div>
      <p>{mensagem}</p>
      {children}
    </div>
  );
}
