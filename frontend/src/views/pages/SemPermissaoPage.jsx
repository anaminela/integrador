import { Link } from 'react-router-dom';
import EstadoVazio from '../components/EstadoVazio';

export default function SemPermissaoPage() {
  return (
    <EstadoVazio icone="🚫" mensagem="Você não tem permissão para acessar esta área.">
      <Link to="/" className="linkForte">Voltar ao início</Link>
    </EstadoVazio>
  );
}
