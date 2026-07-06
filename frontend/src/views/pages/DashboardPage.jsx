import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { quadraService, produtoService, turmaService, adminService } from '../../services';
import { Cartao, Badge, Carregando, EstadoVazio } from '../components';
import { formatarMoeda, capitalizar } from '../../utils/formatadores';
import estilos from './Paginas.module.css';

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [quadras, setQuadras] = useState([]);
  const [cardapio, setCardapio] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [rQuadras, rCardapio, rTurmas] = await Promise.allSettled([
          quadraService.listar(),
          produtoService.cardapio(),
          turmaService.listar(),
        ]);
        if (rQuadras.status === 'fulfilled')
          setQuadras(rQuadras.value.data ?? rQuadras.value ?? []);
        if (rCardapio.status === 'fulfilled')
          setCardapio(rCardapio.value.data ?? rCardapio.value ?? []);
        if (rTurmas.status === 'fulfilled')
          setTurmas(rTurmas.value.data ?? rTurmas.value ?? []);

        if (usuario?.ehInterno) {
          try {
            const m = await adminService.metricas();
            setMetricas(m.data ?? m);
          } catch {
            /* silencioso */
          }
        }
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [usuario]);

  if (carregando) return <Carregando texto="Carregando o dashboard..." />;

  return (
    <div>
      <h1 className="titulo-pagina">Olá, {usuario?.nome?.split(' ')[0]} 👋</h1>
      <p className="subtitulo-pagina">Bem-vindo(a) à G2 Arena Beach. Confira nossa estrutura.</p>

      {/* Métricas para funcionários/administradores */}
      {metricas && (
        <div className={estilos.metricas}>
          <div className={estilos.metrica}>
            <span className={estilos.metricaIcone}>👥</span>
            <div className={estilos.metricaRotulo}>Usuários internos</div>
            <div className={estilos.metricaValor}>{metricas.total_internos ?? metricas.total ?? '—'}</div>
          </div>
          <div className={`${estilos.metrica} ${estilos.sol}`}>
            <span className={estilos.metricaIcone}>🏟️</span>
            <div className={estilos.metricaRotulo}>Quadras ativas</div>
            <div className={estilos.metricaValor}>{quadras.filter((q) => q.status === 'ativa').length}</div>
          </div>
          <div className={`${estilos.metrica} ${estilos.coral}`}>
            <span className={estilos.metricaIcone}>🏐</span>
            <div className={estilos.metricaRotulo}>Turmas abertas</div>
            <div className={estilos.metricaValor}>{turmas.length}</div>
          </div>
          <div className={`${estilos.metrica} ${estilos.sucesso}`}>
            <span className={estilos.metricaIcone}>🥤</span>
            <div className={estilos.metricaRotulo}>Itens no cardápio</div>
            <div className={estilos.metricaValor}>{cardapio.length}</div>
          </div>
        </div>
      )}

      {/* Quadras */}
      <section className={estilos.secao}>
        <h2 className={estilos.secaoTitulo}>🏟️ Nossas Quadras</h2>
        {quadras.length === 0 ? (
          <EstadoVazio mensagem="Nenhuma quadra cadastrada ainda." />
        ) : (
          <div className="grade">
            {quadras.map((q) => (
              <Cartao key={q.id}>
                <h3 className={estilos.itemTitulo}>{q.nome}</h3>
                <p className={estilos.itemDado}>Piso: {q.tipo_piso}</p>
                <p className={estilos.itemDado}>
                  Status:{' '}
                  <Badge tom={q.status === 'ativa' ? 'sucesso' : 'erro'}>
                    {capitalizar(q.status)}
                  </Badge>
                </p>
                <div className={estilos.itemPreco}>{formatarMoeda(q.preco_hora)}/h</div>
                <Link to="/agendamentos" className="linkForte">
                  Agendar →
                </Link>
              </Cartao>
            ))}
          </div>
        )}
      </section>

      {/* Cardápio (prévia) */}
      <section className={estilos.secao}>
        <h2 className={estilos.secaoTitulo}>🥤 Cardápio</h2>
        {cardapio.length === 0 ? (
          <EstadoVazio icone="🍹" mensagem="Cardápio indisponível no momento." />
        ) : (
          <div className="grade">
            {cardapio.slice(0, 6).map((p) => (
              <Cartao key={p.id}>
                <h3 className={estilos.itemTitulo}>{p.nome}</h3>
                <p className={estilos.itemDado}>{p.categoria}</p>
                {p.descricao && <p className={estilos.itemDado}>{p.descricao}</p>}
                <div className={estilos.itemPreco}>{formatarMoeda(p.preco_venda)}</div>
              </Cartao>
            ))}
          </div>
        )}
        <Link to="/cardapio" className="linkForte">
          Ver cardápio completo →
        </Link>
      </section>

      {/* Turmas (prévia) */}
      <section className={estilos.secao}>
        <h2 className={estilos.secaoTitulo}>🏐 Turmas & Treinos</h2>
        {turmas.length === 0 ? (
          <EstadoVazio icone="🏆" mensagem="Nenhuma turma disponível." />
        ) : (
          <div className="grade">
            {turmas.slice(0, 6).map((t) => (
              <Cartao key={t.id}>
                <h3 className={estilos.itemTitulo}>Turma {capitalizar(t.nivel)}</h3>
                <p className={estilos.itemDado}>📆 {t.dia_semana}</p>
                <p className={estilos.itemDado}>
                  🕒 {t.hora_inicio} - {t.hora_fim}
                </p>
                <p className={estilos.itemDado}>
                  Vagas:{' '}
                  <Badge tom={t.vagas_disponiveis > 0 ? 'sucesso' : 'erro'}>
                    {t.vagas_disponiveis} / {t.capacidade_maxima}
                  </Badge>
                </p>
                <Link to="/turmas" className="linkForte">
                  Ver treinos →
                </Link>
              </Cartao>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
