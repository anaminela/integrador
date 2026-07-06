// =============================================================
// PÁGINA: Agendamento de Quadras (RF4 / RF9)
// -------------------------------------------------------------
// Fluxo do usuário:
//   1. Escolhe a quadra e a data
//   2. Vê a grade de horários (verde = livre, vermelho = ocupado,
//      ⭐ = horário nobre) com o preço de cada slot
//   3. Clica num slot livre → abre o modal para confirmar
//      (tipo avulso/mensal + esporte)
//   4. Se o horário estiver ocupado, pode entrar na fila (RF9)
// Abaixo, lista os próprios agendamentos com opção de cancelar.
// =============================================================
import { useState, useEffect, useCallback } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { quadraService, agendamentoService } from '../../services';
import { useAgendamentos } from '../../controllers';
import {
  Cartao,
  Botao,
  CampoSelect,
  CampoTexto,
  Modal,
  Badge,
  Carregando,
  EstadoVazio,
  Tabela,
} from '../components';
import { formatarMoeda, formatarData, dataHoje, capitalizar } from '../../utils/formatadores';
import { TIPOS_AGENDAMENTO, CORES_AGENDA } from '../../utils/constantes';
import estilos from './Paginas.module.css';

export default function AgendamentosPage() {
  const { sucesso, erro: notifErro, info } = useNotificacao();

  const [quadras, setQuadras] = useState([]);
  const [quadraId, setQuadraId] = useState('');
  const [data, setData] = useState(dataHoje());
  const [slots, setSlots] = useState([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);

  // Modal de confirmação de agendamento.
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [tipo, setTipo] = useState('avulso');
  const [esporte, setEsporte] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Lista de agendamentos do próprio usuário.
  const { agendamentos, carregando: carregandoLista, carregar, cancelar } = useAgendamentos();

  // Carrega as quadras uma vez.
  useEffect(() => {
    quadraService.listar().then((r) => {
      const lista = r.data ?? r ?? [];
      setQuadras(lista);
      const ativa = lista.find((q) => q.status === 'ativa');
      if (ativa) setQuadraId(String(ativa.id));
    });
  }, []);

  // Busca a disponibilidade sempre que quadra/data mudam.
  const buscarDisponibilidade = useCallback(async () => {
    if (!quadraId || !data) return;
    setCarregandoSlots(true);
    try {
      const r = await agendamentoService.disponibilidade(quadraId, data);
      setSlots(r.slots ?? []);
    } catch (e) {
      notifErro(e.message || 'Erro ao buscar disponibilidade.');
      setSlots([]);
    } finally {
      setCarregandoSlots(false);
    }
  }, [quadraId, data, notifErro]);

  useEffect(() => {
    buscarDisponibilidade();
  }, [buscarDisponibilidade]);

  // Abre o modal ao clicar num slot livre.
  function aoClicarSlot(slot) {
    if (!slot.disponivel) return;
    setSlotSelecionado(slot);
    setTipo('avulso');
    setEsporte('');
  }

  // Confirma o agendamento (POST /agendamentos).
  async function confirmarAgendamento() {
    if (!esporte.trim()) {
      notifErro('Informe o esporte.');
      return;
    }
    setSalvando(true);
    try {
      await agendamentoService.criar({
        quadra_id: Number(quadraId),
        data,
        hora_inicio: slotSelecionado.hora_inicio,
        hora_fim: slotSelecionado.hora_fim,
        tipo,
        esporte: esporte.trim(),
      });
      sucesso('Agendamento criado com sucesso!');
      setSlotSelecionado(null);
      buscarDisponibilidade();
      carregar();
    } catch (e) {
      // Conflito (409): oferece entrar na fila.
      if (e.status === 409) {
        notifErro('Horário já reservado. Você pode entrar na fila de espera.');
      } else {
        notifErro(e.message || 'Erro ao criar agendamento.');
      }
    } finally {
      setSalvando(false);
    }
  }

  // Entra na fila de espera de um slot ocupado (RF9).
  async function entrarNaFila(slot) {
    try {
      const r = await agendamentoService.entrarNaFila({
        quadra_id: Number(quadraId),
        data,
        hora_inicio: slot.hora_inicio,
        hora_fim: slot.hora_fim,
      });
      info(r.mensagem || 'Você entrou na fila de espera.');
    } catch (e) {
      notifErro(e.message || 'Não foi possível entrar na fila.');
    }
  }

  async function aoCancelar(id) {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;
    try {
      const r = await cancelar(id);
      sucesso('Agendamento cancelado.');
      if (r?.fila_notificada) {
        info('O próximo da fila de espera foi notificado.');
      }
      buscarDisponibilidade();
    } catch (e) {
      notifErro(e.message || 'Erro ao cancelar.');
    }
  }

  // Colunas da tabela de "meus agendamentos".
  const colunas = [
    { chave: 'data', titulo: 'Data', render: (a) => formatarData(a.data) },
    { chave: 'periodo', titulo: 'Horário', render: (a) => `${a.hora_inicio} - ${a.hora_fim}` },
    { chave: 'esporte', titulo: 'Esporte', render: (a) => capitalizar(a.esporte || '—') },
    { chave: 'tipo', titulo: 'Tipo', render: (a) => capitalizar(a.tipo) },
    { chave: 'preco', titulo: 'Preço', render: (a) => formatarMoeda(a.preco) },
    {
      chave: 'status',
      titulo: 'Status',
      render: (a) => {
        const tom = a.status === 'confirmado' ? 'sucesso' : a.status === 'cancelado' ? 'erro' : 'alerta';
        return <Badge tom={tom}>{capitalizar(a.status)}</Badge>;
      },
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (a) =>
        a.status !== 'cancelado' ? (
          <Botao variante="perigo" tamanho="pequeno" onClick={() => aoCancelar(a.id)}>
            Cancelar
          </Botao>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <div>
      <h1 className="titulo-pagina">📅 Agendar Quadra</h1>
      <p className="subtitulo-pagina">
        Escolha a quadra e a data para ver os horários disponíveis.
      </p>

      {/* Filtros de quadra e data */}
      <div className={estilos.filtros}>
        <div style={{ minWidth: 220 }}>
          <CampoSelect
            label="Quadra"
            name="quadra"
            value={quadraId}
            onChange={(e) => setQuadraId(e.target.value)}
            placeholder="Selecione a quadra"
            opcoes={quadras.map((q) => ({
              valor: String(q.id),
              rotulo: `${q.nome}${q.status !== 'ativa' ? ' (inativa)' : ''}`,
            }))}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <CampoTexto
            label="Data"
            name="data"
            tipo="date"
            value={data}
            min={dataHoje()}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
      </div>

      {/* Legenda de cores */}
      <div className={estilos.legenda}>
        <span className={estilos.legendaItem}>
          <span className={estilos.bolinha} style={{ background: CORES_AGENDA.DISPONIVEL }} /> Disponível
        </span>
        <span className={estilos.legendaItem}>
          <span className={estilos.bolinha} style={{ background: CORES_AGENDA.OCUPADO }} /> Ocupado
        </span>
        <span className={estilos.legendaItem}>
          <span className={estilos.estrela}>⭐</span> Horário nobre (após 17h30 / fim de semana)
        </span>
      </div>

      {/* Grade de horários */}
      <Cartao titulo="Horários (07:00 às 22:00)">
        {carregandoSlots ? (
          <Carregando texto="Buscando horários..." />
        ) : slots.length === 0 ? (
          <EstadoVazio icone="📆" mensagem="Selecione uma quadra e data para ver os horários." />
        ) : (
          <div className={estilos.gradeSlots}>
            {slots.map((slot, i) => {
              const bloqueado = slot.status === 'bloqueado_por_treino';
              const classe = slot.disponivel
                ? estilos.slotLivre
                : bloqueado
                ? estilos.slotBloqueado
                : estilos.slotOcupado;
              return (
                <div
                  key={i}
                  className={`${estilos.slot} ${classe}`}
                  onClick={() => aoClicarSlot(slot)}
                  title={slot.disponivel ? 'Clique para agendar' : 'Horário indisponível'}
                >
                  <div className={estilos.slotHora}>
                    {slot.hora_inicio} - {slot.hora_fim}{' '}
                    {slot.horario_nobre && <span className={estilos.estrela}>⭐</span>}
                  </div>
                  <div className={estilos.slotInfo}>
                    {bloqueado
                      ? 'Bloqueado (treino)'
                      : slot.disponivel
                      ? formatarMoeda(slot.preco)
                      : 'Ocupado'}
                  </div>
                  {!slot.disponivel && !bloqueado && (
                    <Botao
                      variante="secundario"
                      tamanho="pequeno"
                      className="mt-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        entrarNaFila(slot);
                      }}
                    >
                      Entrar na fila
                    </Botao>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Cartao>

      {/* Meus agendamentos */}
      <section className="mt-lg">
        <h2 className={estilos.secaoTitulo}>🗓️ Meus Agendamentos</h2>
        {carregandoLista ? (
          <Carregando />
        ) : (
          <Tabela colunas={colunas} dados={agendamentos} vazio="Você ainda não tem agendamentos." />
        )}
      </section>

      {/* Modal de confirmação */}
      <Modal
        aberto={Boolean(slotSelecionado)}
        aoFechar={() => setSlotSelecionado(null)}
        titulo="Confirmar Agendamento"
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setSlotSelecionado(null)}>
              Cancelar
            </Botao>
            <Botao carregando={salvando} onClick={confirmarAgendamento}>
              Confirmar
            </Botao>
          </>
        }
      >
        {slotSelecionado && (
          <div>
            <p className={estilos.itemDado}>
              <strong>Data:</strong> {formatarData(data)}
            </p>
            <p className={estilos.itemDado}>
              <strong>Horário:</strong> {slotSelecionado.hora_inicio} - {slotSelecionado.hora_fim}{' '}
              {slotSelecionado.horario_nobre && <span className={estilos.estrela}>⭐ nobre</span>}
            </p>
            <p className={estilos.itemPreco}>{formatarMoeda(slotSelecionado.preco)}</p>

            <CampoSelect
              label="Tipo de agendamento"
              name="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Selecione"
              opcoes={TIPOS_AGENDAMENTO.map((t) => ({ valor: t, rotulo: capitalizar(t) }))}
            />
            <CampoTexto
              label="Esporte"
              name="esporte"
              placeholder="Ex.: beach tennis, vôlei, futevôlei"
              value={esporte}
              onChange={(e) => setEsporte(e.target.value)}
            />
            {tipo === 'mensal' && (
              <p className={estilos.itemDado}>
                💡 Agendamentos mensais têm 10% de desconto aplicado no financeiro (RF11).
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
