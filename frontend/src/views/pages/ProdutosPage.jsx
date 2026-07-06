import { useAuth } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useProdutos, useFormulario } from '../../controllers';
import { produtoService } from '../../services';
import { Botao, CampoTexto, CampoSelect, Modal, Tabela, Badge, Carregando } from '../components';
import { formatarMoeda, formatarData, dataHoje } from '../../utils/formatadores';
import { validarObrigatorio, validarNaoNegativo } from '../../utils/validadores';
import estilos from './Paginas.module.css';

function validarProd(v) {
  return {
    nome: validarObrigatorio(v.nome, 'Nome'),
    categoria: validarObrigatorio(v.categoria, 'Categoria'),
    estoque_minimo: validarNaoNegativo(v.estoque_minimo, 'Estoque mínimo'),
    preco_custo: validarNaoNegativo(v.preco_custo, 'Preço de custo'),
    preco_venda: validarNaoNegativo(v.preco_venda, 'Preço de venda'),
  };
}

const VAZIO = {
  nome: '',
  descricao: '',
  categoria: '',
  quantidade: 0,
  estoque_minimo: '',
  preco_custo: '',
  preco_venda: '',
};

export default function ProdutosPage() {
  const { usuario } = useAuth();
  const { produtos, carregando, criar, atualizar, remover, movimentar } = useProdutos();
  const { sucesso, erro: notifErro } = useNotificacao();

  const [aba, setAba] = useState('estoque');
  const [alertas, setAlertas] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [periodo, setPeriodo] = useState({ inicio: dataHoje(), fim: dataHoje() });

  // Modal de CRUD.
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const { valores, erros, aoMudar, validarTudo, setValores } = useFormulario(VAZIO, validarProd);

  // Modal de movimentação.
  const [movProduto, setMovProduto] = useState(null);
  const [mov, setMov] = useState({ tipo: 'saida', quantidade: 1, valor_unitario: '' });
  const [movSalvando, setMovSalvando] = useState(false);

  // Carrega alertas ao abrir a aba.
  useEffect(() => {
    if (aba === 'alertas') {
      produtoService
        .alertas()
        .then((r) => setAlertas(r.data ?? r ?? []))
        .catch((e) => notifErro(e.message));
    }
  }, [aba, notifErro]);

  async function gerarRelatorio() {
    try {
      const r = await produtoService.relatorio(periodo.inicio, periodo.fim);
      setRelatorio(r.data ?? r);
    } catch (e) {
      notifErro(e.message || 'Erro ao gerar relatório.');
    }
  }

  function abrirNovo() {
    setEditandoId(null);
    setValores(VAZIO);
    setModalAberto(true);
  }
  function abrirEdicao(p) {
    setEditandoId(p.id);
    setValores({
      nome: p.nome,
      descricao: p.descricao,
      categoria: p.categoria,
      quantidade: p.quantidade,
      estoque_minimo: p.estoque_minimo,
      preco_custo: p.preco_custo,
      preco_venda: p.preco_venda,
    });
    setModalAberto(true);
  }

  async function salvar() {
    if (!validarTudo()) return;
    setSalvando(true);
    try {
      const dados = {
        ...valores,
        estoque_minimo: Number(valores.estoque_minimo),
        preco_custo: Number(valores.preco_custo),
        preco_venda: Number(valores.preco_venda),
      };
      if (editandoId) {
        await atualizar(editandoId, dados);
        sucesso('Produto atualizado.');
      } else {
        await criar(dados);
        sucesso('Produto criado.');
      }
      setModalAberto(false);
    } catch (e) {
      notifErro(e.message || 'Erro ao salvar produto.');
    } finally {
      setSalvando(false);
    }
  }

  async function aoRemover(id) {
    if (!confirm('Remover este produto?')) return;
    try {
      await remover(id);
      sucesso('Produto removido.');
    } catch (e) {
      notifErro(e.message);
    }
  }

  function abrirMovimentacao(p) {
    setMovProduto(p);
    setMov({ tipo: 'saida', quantidade: 1, valor_unitario: p.preco_venda });
  }

  async function confirmarMovimentacao() {
    setMovSalvando(true);
    try {
      await movimentar(movProduto.id, {
        tipo: mov.tipo,
        quantidade: Number(mov.quantidade),
        valor_unitario: Number(mov.valor_unitario),
      });
      sucesso(`Movimentação de ${mov.tipo} registrada.`);
      setMovProduto(null);
    } catch (e) {
      notifErro(e.message || 'Erro ao movimentar estoque.');
    } finally {
      setMovSalvando(false);
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Produto' },
    { chave: 'categoria', titulo: 'Categoria' },
    {
      chave: 'quantidade',
      titulo: 'Estoque',
      render: (p) => (
        <span>
          {p.quantidade}{' '}
          {p.quantidade <= p.estoque_minimo && <Badge tom="alerta">baixo</Badge>}
        </span>
      ),
    },
    { chave: 'estoque_minimo', titulo: 'Mínimo' },
    { chave: 'preco_venda', titulo: 'Venda', render: (p) => formatarMoeda(p.preco_venda) },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (p) => (
        <div className={estilos.acoesLinha}>
          <Botao variante="secundario" tamanho="pequeno" onClick={() => abrirMovimentacao(p)}>
            Movimentar
          </Botao>
          <Botao variante="fantasma" tamanho="pequeno" onClick={() => abrirEdicao(p)}>
            Editar
          </Botao>
          {usuario?.ehAdministrador && (
            <Botao variante="perigo" tamanho="pequeno" onClick={() => aoRemover(p.id)}>
              Remover
            </Botao>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={estilos.cabecalhoPagina}>
        <div>
          <h1 className="titulo-pagina">📦 Produtos & Estoque</h1>
          <p className="subtitulo-pagina">Controle o estoque, vendas e alertas da lanchonete/bar.</p>
        </div>
        {usuario?.ehAdministrador && <Botao onClick={abrirNovo}>+ Novo produto</Botao>}
      </div>

      {/* Abas */}
      <div className="flex gap-sm mb-md wrap">
        <Botao variante={aba === 'estoque' ? 'primario' : 'fantasma'} onClick={() => setAba('estoque')}>
          Estoque
        </Botao>
        <Botao variante={aba === 'alertas' ? 'primario' : 'fantasma'} onClick={() => setAba('alertas')}>
          Alertas de estoque
        </Botao>
        <Botao variante={aba === 'relatorio' ? 'primario' : 'fantasma'} onClick={() => setAba('relatorio')}>
          Relatório
        </Botao>
      </div>

      {/* Conteúdo por aba */}
      {aba === 'estoque' &&
        (carregando ? <Carregando /> : <Tabela colunas={colunas} dados={produtos} />)}

      {aba === 'alertas' && (
        <Tabela
          vazio="Nenhum produto no estoque mínimo. 👍"
          colunas={[
            { chave: 'nome', titulo: 'Produto' },
            { chave: 'quantidade', titulo: 'Atual' },
            { chave: 'estoque_minimo', titulo: 'Mínimo' },
          ]}
          dados={alertas}
        />
      )}

      {aba === 'relatorio' && (
        <div>
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
            <Botao onClick={gerarRelatorio}>Gerar relatório</Botao>
          </div>
          {relatorio && (
            <Tabela
              vazio="Sem movimentações no período."
              colunas={[
                { chave: 'produto_id', titulo: 'Produto' },
                { chave: 'tipo', titulo: 'Tipo' },
                { chave: 'quantidade', titulo: 'Qtd' },
                { chave: 'valor_total', titulo: 'Total', render: (m) => formatarMoeda(m.valor_total) },
                { chave: 'data', titulo: 'Data', render: (m) => formatarData(m.data) },
              ]}
              dados={relatorio.movimentacoes ?? (Array.isArray(relatorio) ? relatorio : [])}
            />
          )}
        </div>
      )}

      {/* Modal CRUD */}
      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={editandoId ? 'Editar Produto' : 'Novo Produto'}
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setModalAberto(false)}>
              Cancelar
            </Botao>
            <Botao carregando={salvando} onClick={salvar}>
              Salvar
            </Botao>
          </>
        }
      >
        <CampoTexto label="Nome" name="nome" value={valores.nome} onChange={aoMudar} erro={erros.nome} />
        <CampoTexto label="Descrição" name="descricao" value={valores.descricao} onChange={aoMudar} />
        <CampoTexto
          label="Categoria"
          name="categoria"
          placeholder="Ex.: Bebidas, Lanches, Pratos"
          value={valores.categoria}
          onChange={aoMudar}
          erro={erros.categoria}
        />
        <div className="flex gap-md wrap">
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoTexto
              label="Estoque mínimo"
              name="estoque_minimo"
              tipo="number"
              value={valores.estoque_minimo}
              onChange={aoMudar}
              erro={erros.estoque_minimo}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoTexto
              label="Preço de custo (R$)"
              name="preco_custo"
              tipo="number"
              step="0.01"
              value={valores.preco_custo}
              onChange={aoMudar}
              erro={erros.preco_custo}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoTexto
              label="Preço de venda (R$)"
              name="preco_venda"
              tipo="number"
              step="0.01"
              value={valores.preco_venda}
              onChange={aoMudar}
              erro={erros.preco_venda}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Movimentação */}
      <Modal
        aberto={Boolean(movProduto)}
        aoFechar={() => setMovProduto(null)}
        titulo={`Movimentar: ${movProduto?.nome ?? ''}`}
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setMovProduto(null)}>
              Cancelar
            </Botao>
            <Botao carregando={movSalvando} onClick={confirmarMovimentacao}>
              Registrar
            </Botao>
          </>
        }
      >
        {movProduto && (
          <div>
            <p className={estilos.itemDado}>Estoque atual: {movProduto.quantidade} unidade(s).</p>
            <CampoSelect
              label="Tipo de movimentação"
              name="tipo"
              value={mov.tipo}
              onChange={(e) => setMov((m) => ({ ...m, tipo: e.target.value }))}
              placeholder="Selecione"
              opcoes={[
                { valor: 'entrada', rotulo: 'Entrada (compra/reposição)' },
                { valor: 'saida', rotulo: 'Saída (venda/consumo)' },
              ]}
            />
            <CampoTexto
              label="Quantidade"
              name="quantidade"
              tipo="number"
              min="1"
              value={mov.quantidade}
              onChange={(e) => setMov((m) => ({ ...m, quantidade: e.target.value }))}
            />
            <CampoTexto
              label="Valor unitário (R$)"
              name="valor_unitario"
              tipo="number"
              step="0.01"
              value={mov.valor_unitario}
              onChange={(e) => setMov((m) => ({ ...m, valor_unitario: e.target.value }))}
            />
            {mov.tipo === 'saida' && (
              <p className={estilos.itemDado}>
                💡 A saída lança uma receita automática no financeiro (RF8.1).
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
