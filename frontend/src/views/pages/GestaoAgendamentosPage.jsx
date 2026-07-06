// =============================================================
// PÁGINA: Gestão de Agendamentos (RF7) — interno
// -------------------------------------------------------------
// Lista TODOS os agendamentos (funcionário/admin) com filtros e
// permite aceitar (confirmar), recusar (cancelar) ou marcar como
// pendente via PATCH /agendamentos/:id/status.
// =============================================================
import { useState } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useAgendamentos } from '../../controllers';
import { Botao, CampoTexto, CampoSelect, Tabela, Badge, Carregando } from '../components';
import { formatarData, formatarMoeda, capitalizar, dataHoje } from '../../utils/formatadores';
import { STATUS_AGENDAMENTO } from '../../utils/constantes';
import estilos from './Paginas.module.css';

export default function GestaoAgendamentosPage() {
  const { sucesso, erro: notifErro } = useNotificacao();
  const [filtros, setFiltros] = useState({ data: '', status: '' });
  const { agendamentos, carregando, atualizarStatus } = useAgendamentos(filtros);

  async function mudar(id, status) {
    try {
      await atualizarStatus(id, status);
      sucesso(`Agendamento marcado como ${status}.`);
    } catch (e) {
      notifErro(e.message || 'Erro ao atualizar status.');
    }
  }

  const colunas = [
    { chave: 'id', titulo: '#' },
    { chave: 'data', titulo: 'Data', render: (a) => formatarData(a.data) },
    { chave: 'periodo', titulo: 'Horário', render: (a) => `${a.hora_inicio} - ${a.hora_fim}` },
    { chave: 'esporte', titulo: 'Esporte', render: (a) => capitalizar(a.esporte || '—') },
    { chave: 'preco', titulo: 'Preço', render: (a) => formatarMoeda(a.preco) },
    {
      chave: 'status',
      titulo: 'Status',
      render: (a) => {
        const tom =
          a.status === 'confirmado' ? 'sucesso' : a.status === 'cancelado' ? 'erro' : 'alerta';
        return <Badge tom={tom}>{capitalizar(a.status)}</Badge>;
      },
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (a) => (
        <div className={estilos.acoesLinha}>
          <Botao
            variante="sucesso"
            tamanho="pequeno"
            disabled={a.status === 'confirmado'}
            onClick={() => mudar(a.id, STATUS_AGENDAMENTO.CONFIRMADO)}
          >
            Aceitar
          </Botao>
          <Botao
            variante="perigo"
            tamanho="pequeno"
            disabled={a.status === 'cancelado'}
            onClick={() => mudar(a.id, STATUS_AGENDAMENTO.CANCELADO)}
          >
            Recusar
          </Botao>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1 className="titulo-pagina">🗂️ Gestão de Agendamentos</h1>
      <p className="subtitulo-pagina">Aceite, recuse ou acompanhe todas as reservas.</p>

      <div className={estilos.filtros}>
        <CampoTexto
          label="Data"
          name="data"
          tipo="date"
          value={filtros.data}
          onChange={(e) => setFiltros((f) => ({ ...f, data: e.target.value }))}
        />
        <div style={{ minWidth: 180 }}>
          <CampoSelect
            label="Status"
            name="status"
            value={filtros.status}
            onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}
            placeholder="Todos"
            opcoes={Object.values(STATUS_AGENDAMENTO).map((s) => ({
              valor: s,
              rotulo: capitalizar(s),
            }))}
          />
        </div>
        <Botao variante="fantasma" onClick={() => setFiltros({ data: dataHoje(), status: '' })}>
          Hoje
        </Botao>
        <Botao variante="fantasma" onClick={() => setFiltros({ data: '', status: '' })}>
          Limpar filtros
        </Botao>
      </div>

      {carregando ? (
        <Carregando />
      ) : (
        <Tabela colunas={colunas} dados={agendamentos} vazio="Nenhum agendamento encontrado." />
      )}
    </div>
  );
}
