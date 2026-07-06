// =============================================================
// PÁGINA: Gestão de Quadras (RF14) — interno
// -------------------------------------------------------------
// CRUD de quadras. Funcionários e administradores podem criar e
// editar; a remoção é restrita ao administrador (o backend valida).
// =============================================================
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useQuadras, useFormulario } from '../../controllers';
import { Botao, CampoTexto, CampoSelect, Modal, Tabela, Badge, Carregando } from '../components';
import { formatarMoeda, capitalizar } from '../../utils/formatadores';
import { validarObrigatorio, validarNumeroPositivo } from '../../utils/validadores';
import estilos from './Paginas.module.css';

function validar(v) {
  return {
    nome: validarObrigatorio(v.nome, 'Nome'),
    tipo_piso: validarObrigatorio(v.tipo_piso, 'Tipo de piso'),
    preco_hora: validarNumeroPositivo(v.preco_hora, 'Preço/hora'),
  };
}

const VAZIO = { nome: '', tipo_piso: '', preco_hora: '', status: 'ativa' };

export default function QuadrasPage() {
  const { usuario } = useAuth();
  const { quadras, carregando, criar, atualizar, remover } = useQuadras();
  const { sucesso, erro: notifErro } = useNotificacao();

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const { valores, erros, aoMudar, validarTudo, setValores } = useFormulario(VAZIO, validar);

  function abrirNovo() {
    setEditandoId(null);
    setValores(VAZIO);
    setModalAberto(true);
  }

  function abrirEdicao(q) {
    setEditandoId(q.id);
    setValores({ nome: q.nome, tipo_piso: q.tipo_piso, preco_hora: q.preco_hora, status: q.status });
    setModalAberto(true);
  }

  async function salvar() {
    if (!validarTudo()) return;
    setSalvando(true);
    try {
      const dados = { ...valores, preco_hora: Number(valores.preco_hora) };
      if (editandoId) {
        await atualizar(editandoId, dados);
        sucesso('Quadra atualizada.');
      } else {
        await criar(dados);
        sucesso('Quadra criada.');
      }
      setModalAberto(false);
    } catch (e) {
      notifErro(e.message || 'Erro ao salvar quadra.');
    } finally {
      setSalvando(false);
    }
  }

  async function aoRemover(id) {
    if (!confirm('Remover esta quadra?')) return;
    try {
      await remover(id);
      sucesso('Quadra removida.');
    } catch (e) {
      notifErro(e.message || 'Erro ao remover (apenas administradores podem excluir).');
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'tipo_piso', titulo: 'Piso' },
    { chave: 'preco_hora', titulo: 'Preço/h', render: (q) => formatarMoeda(q.preco_hora) },
    {
      chave: 'status',
      titulo: 'Status',
      render: (q) => (
        <Badge tom={q.status === 'ativa' ? 'sucesso' : 'erro'}>{capitalizar(q.status)}</Badge>
      ),
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (q) => (
        <div className={estilos.acoesLinha}>
          <Botao variante="secundario" tamanho="pequeno" onClick={() => abrirEdicao(q)}>
            Editar
          </Botao>
          {usuario?.ehAdministrador && (
            <Botao variante="perigo" tamanho="pequeno" onClick={() => aoRemover(q.id)}>
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
          <h1 className="titulo-pagina">🏟️ Gestão de Quadras</h1>
          <p className="subtitulo-pagina">Cadastre e gerencie as quadras da arena.</p>
        </div>
        <Botao onClick={abrirNovo}>+ Nova quadra</Botao>
      </div>

      {carregando ? <Carregando /> : <Tabela colunas={colunas} dados={quadras} />}

      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={editandoId ? 'Editar Quadra' : 'Nova Quadra'}
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
        <CampoTexto
          label="Tipo de piso"
          name="tipo_piso"
          placeholder="Ex.: areia, saibro, sintético"
          value={valores.tipo_piso}
          onChange={aoMudar}
          erro={erros.tipo_piso}
        />
        <CampoTexto
          label="Preço por hora (R$)"
          name="preco_hora"
          tipo="number"
          step="0.01"
          value={valores.preco_hora}
          onChange={aoMudar}
          erro={erros.preco_hora}
        />
        <CampoSelect
          label="Status"
          name="status"
          value={valores.status}
          onChange={aoMudar}
          placeholder="Selecione"
          opcoes={[
            { valor: 'ativa', rotulo: 'Ativa' },
            { valor: 'inativa', rotulo: 'Inativa' },
          ]}
        />
      </Modal>
    </div>
  );
}
