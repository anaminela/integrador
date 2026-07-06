import { Link } from 'react-router-dom';

export default function NaoEncontradaPage() {
  return (
    <div className="text-center" style={{ padding: '80px 20px' }}>
      <div style={{ fontSize: '4rem' }}>🏖️</div>
      <h1 style={{ fontSize: '2.4rem' }}>404</h1>
      <p className="text-suave mb-md">Página não encontrada. A onda levou este endereço embora.</p>
      <Link to="/" style={{ fontWeight: 600 }}>Voltar ao início</Link>
    </div>
  );
}
