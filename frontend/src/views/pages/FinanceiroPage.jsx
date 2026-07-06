// =============================================================
// PÁGINA: Financeiro / Caixa (RF10, RF11, RF12) — interno
// -------------------------------------------------------------
// Permite:
//   • Registrar entradas/saídas no caixa (RF10)
//   • Gerar relatório consolidado por período com saldo (RF12)
//   • Atualizar status de pagamento das transações (RF11)
// =============================================================
import { useState } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { financeiroService } from '../../services';
import { useFormulario } from '../../controllers';
import { Botao, CampoTexto, CampoSelect, Modal, Tabela, Badge } from '../components';
import { formatarMoeda, formatarData, dataHoje, capitalizar } from '../../utils/formatadores';
import {
  METODOS_PAGAMENTO,
  CATEGORIAS_FINANCEIRO,
  STATUS_FINANCEIRO,
} from '../../utils/constantes';
import { validarNumeroPositivo, validarObrigatorio } from '../../utils/validadores';
import estilos from './Paginas.module.css';

function validarTransacao(v) {
  return {
    tipo: validarObrigatorio(v.tipo, 'Tipo'),
    categoria: validarObrigatorio(v.categoria, 'Categoria'),
    valor: validarNumeroPositivo(v.valor, 'Valor'),
  };
}

const VAZIO = {
  tipo: 'entrada',
  categoria: '',
  valor: '',
  metodo_pagamento: 'PIX',
  status: 'pago',
};

export default function FinanceiroPage() {
  const { sucesso, erro: notifErro } = useNotificacao();
  const [periodo, setPeriodo] = useState({ inicio: dataHoje(), fim: dataHoje() });
  const [relatorio, setRelatorio] = useState(null);
  const [carregandoRel, setCarregandoRel] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { valores, erros, aoMudar, validarTudo, setValores } = useFormulario(
    VAZIO,
    validarTransacao,
  );

  async function gerarRelatorio() {
    setCarregandoRel(true);
    try {
      const r = await financeiroService.relatorio(periodo.inicio, periodo.fim);
      setRelatorio(r.data ?? r);
    } catch (e) {
      notifErro(e.message || 'Erro ao gerar relatório.');
    } finally {
      setCarregandoRel(false);
    }
  }

  async function salvar() {
    if (!validarTudo()) return;
    setSalvando(true);
    try {
      await financeiroService.registrar({
        ...valores,
        valor: Number(valores.valor),
      });
      sucesso('Transação registrada.');
      setModalAberto(false);
      setValores(VAZIO);
      gerarRelatorio();
    } catch (e) {
      notifErro(e.message || 'Erro ao registrar transação.');
    } finally {
      setSalvando(false);
    }
  }

  async function mudarStatus(id, status) {
    try {
      await financeiroService.atualizarStatus(id, status);
      sucesso('Status atualizado.');
      gerarRelatorio();
    } catch (e) {
      notifErro(e.message || 'Erro ao atualizar status.');
    }
  }

  // O relatório pode vir com {entradas, saidas, saldo, transacoes}.
  const transacoes = relatorio?.transacoes ?? (Array.isArray(relatorio) ? relatorio : []);
  const totalEntradas = relatorio?.total_entradas ?? relatorio?.entradas ?? 0;
  const totalSaidas = relatorio?.total_saidas ?? relatorio?.saidas ?? 0;
  const saldo = relatorio?.saldo ?? totalEntradas - totalSaidas;

  const colunas = [
    { chave: 'data', titulo: 'Data', render: (t) => formatarData(t.data) },
    { chave: 'categoria', titulo: 'Categoria', render: (t) => capitalizar(t.categoria) },
    {
      chave: 'tipo',
      titulo: 'Tipo',
      render: (t) => (
        <Badge tom={t.tipo === 'entrada' ? 'sucesso' : 'erro'}>{capitalizar(t.tipo)}</Badge>
      ),
    },
    { chave: 'valor', titulo: 'Valor', render: (t) => formatarMoeda(t.valor) },
    { chave: 'metodo_pagamento', titulo: 'Método', render: (t) => t.metodo_pagamento || '—' },
    {
      chave: 'status',
      titulo: 'Status',
      render: (t) => (
        <select
          value={t.status}
          onChange={(e) => mudarStatus(t.id, e.target.value)}
          style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--cor-borda)' }}
        >
          {STATUS_FINANCEIRO.map((s) => (
            <option key={s} value={s}>
              {capitalizar(s)}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div>
      <div className={estilos.cabecalhoPagina}>
        <div>
          <h1 className="titulo-pagina">💰 Financeiro</h1>
          <p className="subtitulo-pagina">Caixa, relatórios e status de pagamento.</p>
        </div>
        <Botao onClick={() => { setValores(VAZIO); setModalAberto(true); }}>
          + Nova transação
        </Botao>
      </div>

      {/* Filtro de período */}
      <div className={estilos.filtros}>
        <CampoTexto
          label="Início"
          name="inicio"
          tipo="date"
          value={periodo.inicio}
          onChange={(e) => setPeriodo((p) => ({ ...p, inicio: e.target.value }))}
        />
        <CampoTexto
          label="Fim"
          name="fim"
          tipo="date"
          value={periodo.fim}
          onChange={(e) => setPeriodo((p) => ({ ...p, fim: e.target.value }))}
        />
        <Botao carregando={carregandoRel} onClick={gerarRelatorio}>
          Gerar relatório
        </Botao>
      </div>

      {/* Métricas do relatório */}
      {relatorio && (
        <div className={estilos.metricas}>
          <div className={`${estilos.metrica} ${estilos.sucesso}`}>
            <span className={estilos.metricaIcone}>⬆️</span>
            <div className={estilos.metricaRotulo}>Entradas</div>
            <div className={estilos.metricaValor}>{formatarMoeda(totalEntradas)}</div>
          </div>
          <div className={`${estilos.metrica} ${estilos.erro}`}>
            <span className={estilos.metricaIcone}>⬇️</span>
            <div className={estilos.metricaRotulo}>Saídas</div>
            <div className={estilos.metricaValor}>{formatarMoeda(totalSaidas)}</div>
          </div>
          <div className={`${estilos.metrica} ${saldo >= 0 ? estilos.sol : estilos.coral}`}>
            <span className={estilos.metricaIcone}>💵</span>
            <div className={estilos.metricaRotulo}>Saldo</div>
            <div className={estilos.metricaValor}>{formatarMoeda(saldo)}</div>
          </div>
        </div>
      )}

      {relatorio ? (
        <Tabela colunas={colunas} dados={transacoes} vazio="Sem transações no período." />
      ) : (
        <p className="text-suave">Selecione um período e clique em “Gerar relatório”.</p>
      )}

      {/* Modal Nova transação */}
      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo="Nova Transação"
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao carregando={salvando} onClick={salvar}>
              Registrar
            </Botao>
          </>
        }
      >
        <CampoSelect
          label="Tipo"
          name="tipo"
          value={valores.tipo}
          onChange={aoMudar}
          erro={erros.tipo}
          placeholder="Selecione"
          opcoes={[
            { valor: 'entrada', rotulo: 'Entrada (receita)' },
            { valor: 'saida', rotulo: 'Saída (despesa)' },
          ]}
        />
        <CampoSelect
          label="Categoria"
          name="categoria"
          value={valores.categoria}
          onChange={aoMudar}
          erro={erros.categoria}
          placeholder="Selecione"
          opcoes={CATEGORIAS_FINANCEIRO.map((c) => ({ valor: c, rotulo: capitalizar(c.replace(/_/g, ' ')) }))}
        />
        <CampoTexto
          label="Valor (R$)"
          name="valor"
          tipo="number"
          step="0.01"
          value={valores.valor}
          onChange={aoMudar}
          erro={erros.valor}
        />
        <CampoSelect
          label="Método de pagamento"
          name="metodo_pagamento"
          value={valores.metodo_pagamento}
          onChange={aoMudar}
          placeholder="Selecione"
          opcoes={METODOS_PAGAMENTO.map((m) => ({ valor: m, rotulo: capitalizar(m) }))}
        />
        <CampoSelect
          label="Status"
          name="status"
          value={valores.status}
          onChange={aoMudar}
          placeholder="Selecione"
          opcoes={STATUS_FINANCEIRO.map((s) => ({ valor: s, rotulo: capitalizar(s) }))}
        />
        {valores.categoria === 'agendamento_mensal' && (
          <p className={estilos.itemDado}>💡 O backend aplica 10% de desconto nesta categoria (RF11).</p>
        )}
      </Modal>
    </div>
  );
}
