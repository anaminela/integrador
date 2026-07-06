import { useState, useEffect, useCallback } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { auditoriaService } from '../../services';
import { Botao, CampoTexto, Tabela, Badge, Carregando } from '../components';
import { formatarDataHora } from '../../utils/formatadores';
import estilos from './Paginas.module.css';

function tomStatus(status) {
  if (status >= 500) return 'erro';
  if (status >= 400) return 'alerta';
  if (status >= 200 && status < 300) return 'sucesso';
  return 'neutro';
}

function tomAcao(acao) {
  switch (acao) {
    case 'POST':
      return 'sucesso';
    case 'PUT':
    case 'PATCH':
      return 'info';
    case 'DELETE':
      return 'erro';
    default:
      return 'neutro';
  }
}

export default function AuditoriaPage() {
  const { erro: notifErro } = useNotificacao();

  const [metricas, setMetricas] = useState(null);
  const [periodoAnalisado, setPeriodoAnalisado] = useState('');
  const [periodo, setPeriodo] = useState({ inicio: '', fim: '' });
  const [carregandoMetricas, setCarregandoMetricas] = useState(true);

  const [logs, setLogs] = useState([]);
  const [limite, setLimite] = useState('100');
  const [carregandoLogs, setCarregandoLogs] = useState(true);

  const carregarMetricas = useCallback(
    async (inicio, fim) => {
      setCarregandoMetricas(true);
      try {
        const resp = await auditoriaService.dashboard(inicio || undefined, fim || undefined);
        setMetricas(resp.metricas ?? null);
        setPeriodoAnalisado(resp.periodo_analisado ?? '');
      } catch (e) {
        notifErro(e.message || 'Erro ao carregar métricas.');
      } finally {
        setCarregandoMetricas(false);
      }
    },
    [notifErro],
  );

  const carregarLogs = useCallback(
    async (qtd) => {
      setCarregandoLogs(true);
      try {
        const resp = await auditoriaService.logs(Number(qtd) || 100);
        setLogs(resp.data ?? resp ?? []);
      } catch (e) {
        notifErro(e.message || 'Erro ao carregar logs.');
      } finally {
        setCarregandoLogs(false);
      }
    },
    [notifErro],
  );

  useEffect(() => {
    carregarMetricas();
    carregarLogs(100);
  }, [carregarMetricas, carregarLogs]);

  function aplicarPeriodo() {
    carregarMetricas(periodo.inicio, periodo.fim);
  }

  function limparPeriodo() {
    setPeriodo({ inicio: '', fim: '' });
    carregarMetricas();
  }

  const colunas = [
    { chave: 'id', titulo: '#' },
    {
      chave: 'usuario_id',
      titulo: 'Usuário',
      render: (l) => (l.usuario_id === 'Não autenticado' ? <span className="text-suave">Anônimo</span> : `#${l.usuario_id}`),
    },
    {
      chave: 'acao',
      titulo: 'Ação',
      render: (l) => <Badge tom={tomAcao(l.acao)}>{l.acao}</Badge>,
    },
    {
      chave: 'recurso',
      titulo: 'Recurso',
      render: (l) => <code className={estilos.recursoLog}>{l.recurso}</code>,
    },
    {
      chave: 'status_http',
      titulo: 'Status',
      render: (l) => <Badge tom={tomStatus(l.status_http)}>{l.status_http}</Badge>,
    },
    { chave: 'ip', titulo: 'IP' },
    {
      chave: 'data',
      titulo: 'Data/Hora',
      render: (l) => formatarDataHora(l.data),
    },
  ];

  return (
    <div>
      <h1 className="titulo-pagina">🛡️ Auditoria e Métricas</h1>
      <p className="subtitulo-pagina">
        Acompanhe os indicadores do sistema e o histórico de operações realizadas.
      </p>

      {/* -------- Filtro de período das métricas -------- */}
      <div className={estilos.filtros}>
        <CampoTexto
          label="Início do período"
          tipo="date"
          value={periodo.inicio}
          onChange={(e) => setPeriodo((p) => ({ ...p, inicio: e.target.value }))}
        />
        <CampoTexto
          label="Fim do período"
          tipo="date"
          value={periodo.fim}
          onChange={(e) => setPeriodo((p) => ({ ...p, fim: e.target.value }))}
        />
        <Botao onClick={aplicarPeriodo} disabled={!periodo.inicio || !periodo.fim}>
          Aplicar período
        </Botao>
        <Botao variante="fantasma" onClick={limparPeriodo}>
          Limpar
        </Botao>
      </div>

      {periodoAnalisado && (
        <p className="text-suave mb-md">
          Período analisado: <strong>{periodoAnalisado}</strong>
        </p>
      )}

      {/* -------- Cartões de métricas -------- */}
      {carregandoMetricas ? (
        <Carregando />
      ) : metricas ? (
        <div className={estilos.metricas}>
          <div className={estilos.metrica}>
            <span className={estilos.metricaIcone}>👥</span>
            <div className={estilos.metricaRotulo}>Usuários cadastrados</div>
            <div className={estilos.metricaValor}>{metricas.total_usuarios_cadastrados}</div>
          </div>
          <div className={`${estilos.metrica} sucesso`}>
            <span className={estilos.metricaIcone}>🆕</span>
            <div className={estilos.metricaRotulo}>Novos no período</div>
            <div className={estilos.metricaValor}>{metricas.usuarios_novos_no_periodo}</div>
          </div>
          <div className={`${estilos.metrica} coral`}>
            <span className={estilos.metricaIcone}>📅</span>
            <div className={estilos.metricaRotulo}>Total de agendamentos</div>
            <div className={estilos.metricaValor}>{metricas.total_agendamentos}</div>
          </div>
          <div className={`${estilos.metrica} sol`}>
            <span className={estilos.metricaIcone}>📊</span>
            <div className={estilos.metricaRotulo}>Média por usuário</div>
            <div className={estilos.metricaValor}>{metricas.media_agendamentos_por_usuario}</div>
          </div>
        </div>
      ) : (
        <p className="text-suave">Não foi possível carregar as métricas.</p>
      )}

      {/* -------- Histórico de logs -------- */}
      <div className={estilos.secao}>
        <div className="flex justify-between items-center mb-md wrap gap-sm">
          <h2 className={estilos.secaoTitulo}>Histórico de operações</h2>
          <div className="flex gap-sm items-end">
            <div style={{ width: 120 }}>
              <CampoTexto
                label="Limite"
                tipo="number"
                value={limite}
                onChange={(e) => setLimite(e.target.value)}
              />
            </div>
            <Botao variante="secundario" onClick={() => carregarLogs(limite)}>
              Atualizar
            </Botao>
          </div>
        </div>

        {carregandoLogs ? (
          <Carregando />
        ) : (
          <Tabela colunas={colunas} dados={logs} vazio="Nenhuma operação registrada ainda." />
        )}
      </div>
    </div>
  );
}
