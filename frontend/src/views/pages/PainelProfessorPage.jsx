// =============================================================
// PÁGINA: Painel do Professor (RF6) — interno
// -------------------------------------------------------------
// Mostra a agenda das turmas e os clientes interessados (fila).
// Consome GET /turmas/dashboard.
// =============================================================
import { useState, useEffect } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { turmaService } from '../../services';
import { Cartao, Carregando, EstadoVazio, Badge } from '../components';
import { capitalizar } from '../../utils/formatadores';
import estilos from './Paginas.module.css';

export default function PainelProfessorPage() {
  const { erro } = useNotificacao();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    turmaService
      .dashboard()
      .then((r) => setDados(r.data ?? r))
      .catch((e) => erro(e.message || 'Erro ao carregar o painel.'))
      .finally(() => setCarregando(false));
  }, [erro]);

  if (carregando) return <Carregando texto="Carregando painel do professor..." />;

  // O dashboard pode vir como array de turmas ou objeto com "turmas".
  const turmas = Array.isArray(dados) ? dados : dados?.turmas ?? [];

  return (
    <div>
      <h1 className="titulo-pagina">📋 Painel do Professor</h1>
      <p className="subtitulo-pagina">Sua agenda semanal e os clientes interessados nas turmas.</p>

      {turmas.length === 0 ? (
        <EstadoVazio icone="🏐" mensagem="Nenhuma turma cadastrada para exibir." />
      ) : (
        <div className="grade">
          {turmas.map((t) => (
            <Cartao key={t.id} titulo={`Turma ${capitalizar(t.nivel || '')}`}>
              <p className={estilos.itemDado}>📆 {capitalizar(t.dia_semana || '')}</p>
              <p className={estilos.itemDado}>
                🕒 {t.hora_inicio} - {t.hora_fim}
              </p>
              <p className={estilos.itemDado}>
                👥 Matriculados: {t.matriculados ?? t.alunos?.length ?? 0}/{t.capacidade_maxima}
              </p>

              <div className="mt-sm">
                <strong style={{ fontSize: '0.9rem' }}>Interessados na fila:</strong>
                {(t.fila_espera ?? t.interessados ?? []).length === 0 ? (
                  <p className={estilos.itemDado}>Ninguém na fila.</p>
                ) : (
                  <div className="flex flex-col gap-sm mt-sm">
                    {(t.fila_espera ?? t.interessados ?? []).map((f, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span style={{ fontSize: '0.88rem' }}>
                          {f.nome ?? f.usuario_nome ?? `Usuário ${f.usuario_id}`}
                        </span>
                        <Badge tom="info">posição {f.posicao ?? i + 1}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </div>
  );
}
