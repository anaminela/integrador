import { useState } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useUsuarios, useAdmins, useFormulario } from '../../controllers';
import { Botao, CampoTexto, CampoSelect, Modal, Tabela, Badge, Carregando } from '../components';
import { mascararCPF, mascararTelefone, capitalizar } from '../../utils/formatadores';
import {
  validarEmail,
  validarCPF,
  validarSenha,
  validarObrigatorio,
  validarTelefone,
} from '../../utils/validadores';
import { TIPOS_PERFIL_INTERNO } from '../../utils/constantes';
import estilos from './Paginas.module.css';

function validarInterno(v, exigeSenha) {
  return {
    nome: validarObrigatorio(v.nome, 'Nome'),
    email: validarEmail(v.email),
    cpf: validarCPF(v.cpf),
    telefone: validarTelefone(v.telefone),
    tipo_perfil: validarObrigatorio(v.tipo_perfil, 'Tipo de perfil'),
    senha: exigeSenha ? validarSenha(v.senha) : '',
  };
}

const VAZIO = { nome: '', email: '', cpf: '', telefone: '', tipo_perfil: 'FUNCIONARIO', senha: '' };

export default function UsuariosPage() {
  const [aba, setAba] = useState('clientes');
  return (
    <div>
      <h1 className="titulo-pagina">👥 Administração de Usuários</h1>
      <p className="subtitulo-pagina">Gerencie clientes e a equipe interna.</p>

      <div className="flex gap-sm mb-md wrap">
        <Botao variante={aba === 'clientes' ? 'primario' : 'fantasma'} onClick={() => setAba('clientes')}>
          Clientes
        </Botao>
        <Botao variante={aba === 'internos' ? 'primario' : 'fantasma'} onClick={() => setAba('internos')}>
          Equipe interna
        </Botao>
      </div>

      {aba === 'clientes' ? <AbaClientes /> : <AbaInternos />}
    </div>
  );
}

// ---------- Aba: Clientes ----------
function AbaClientes() {
  const { usuarios, carregando, remover } = useUsuarios();
  const { sucesso, erro } = useNotificacao();

  async function desativar(id) {
    if (!confirm('Desativar este cliente?')) return;
    try {
      await remover(id);
      sucesso('Cliente desativado.');
    } catch (e) {
      erro(e.message);
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'email', titulo: 'E-mail' },
    { chave: 'cpf', titulo: 'CPF' },
    {
      chave: 'ativo',
      titulo: 'Situação',
      render: (u) => <Badge tom={u.ativo ? 'sucesso' : 'erro'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (u) =>
        u.ativo ? (
          <Botao variante="perigo" tamanho="pequeno" onClick={() => desativar(u.id)}>
            Desativar
          </Botao>
        ) : (
          '—'
        ),
    },
  ];

  if (carregando) return <Carregando />;
  return <Tabela colunas={colunas} dados={usuarios} vazio="Nenhum cliente cadastrado." />;
}

// ---------- Aba: Internos ----------
function AbaInternos() {
  const { admins, carregando, criar, atualizar, reativar, remover } = useAdmins();
  const { sucesso, erro } = useNotificacao();

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const { valores, erros, aoMudar, definirCampo, setValores, setErros } = useFormulario(VAZIO);

  function abrirNovo() {
    setEditandoId(null);
    setValores(VAZIO);
    setErros({});
    setModalAberto(true);
  }
  function abrirEdicao(u) {
    setEditandoId(u.id);
    setValores({
      nome: u.nome,
      email: u.email,
      cpf: u.cpf,
      telefone: u.telefone,
      tipo_perfil: u.tipo_perfil,
      senha: '',
    });
    setErros({});
    setModalAberto(true);
  }

  async function salvar() {
    const novosErros = validarInterno(valores, !editandoId);
    setErros(novosErros);
    if (Object.values(novosErros).some(Boolean)) return;

    setSalvando(true);
    try {
      const dados = { ...valores };
      if (editandoId && !dados.senha) delete dados.senha; // não troca senha se vazio
      if (editandoId) {
        await atualizar(editandoId, dados);
        sucesso('Usuário interno atualizado.');
      } else {
        await criar(dados);
        sucesso('Usuário interno criado.');
      }
      setModalAberto(false);
    } catch (e) {
      erro(e.message || 'Erro ao salvar usuário interno.');
    } finally {
      setSalvando(false);
    }
  }

  async function aoReativar(id) {
    try {
      await reativar(id);
      sucesso('Usuário reativado.');
    } catch (e) {
      erro(e.message);
    }
  }
  async function aoRemover(id) {
    if (!confirm('Desativar este usuário interno?')) return;
    try {
      await remover(id);
      sucesso('Usuário desativado.');
    } catch (e) {
      erro(e.message);
    }
  }

  const colunas = [
    { chave: 'nome', titulo: 'Nome' },
    { chave: 'email', titulo: 'E-mail' },
    {
      chave: 'tipo_perfil',
      titulo: 'Perfil',
      render: (u) => <Badge tom="info">{capitalizar(u.tipo_perfil || '')}</Badge>,
    },
    {
      chave: 'ativo',
      titulo: 'Situação',
      render: (u) => <Badge tom={u.ativo ? 'sucesso' : 'erro'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>,
    },
    {
      chave: 'acoes',
      titulo: 'Ações',
      render: (u) => (
        <div className={estilos.acoesLinha}>
          <Botao variante="secundario" tamanho="pequeno" onClick={() => abrirEdicao(u)}>
            Editar
          </Botao>
          {u.ativo ? (
            <Botao variante="perigo" tamanho="pequeno" onClick={() => aoRemover(u.id)}>
              Desativar
            </Botao>
          ) : (
            <Botao variante="sucesso" tamanho="pequeno" onClick={() => aoReativar(u.id)}>
              Reativar
            </Botao>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-md">
        <span className="text-suave">Equipe: administradores e funcionários.</span>
        <Botao onClick={abrirNovo}>+ Novo interno</Botao>
      </div>

      {carregando ? <Carregando /> : <Tabela colunas={colunas} dados={admins} />}

      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo={editandoId ? 'Editar Usuário Interno' : 'Novo Usuário Interno'}
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
          label="E-mail"
          name="email"
          tipo="email"
          value={valores.email}
          onChange={aoMudar}
          erro={erros.email}
        />
        <div className="flex gap-md wrap">
          <div style={{ flex: 1, minWidth: 150 }}>
            <CampoTexto
              label="CPF"
              name="cpf"
              placeholder="000.000.000-00"
              value={valores.cpf}
              onChange={(e) => definirCampo('cpf', mascararCPF(e.target.value))}
              erro={erros.cpf}
            />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <CampoTexto
              label="Telefone"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={valores.telefone}
              onChange={(e) => definirCampo('telefone', mascararTelefone(e.target.value))}
              erro={erros.telefone}
            />
          </div>
        </div>
        <CampoSelect
          label="Tipo de perfil"
          name="tipo_perfil"
          value={valores.tipo_perfil}
          onChange={aoMudar}
          erro={erros.tipo_perfil}
          placeholder="Selecione"
          opcoes={TIPOS_PERFIL_INTERNO.map((t) => ({ valor: t, rotulo: capitalizar(t) }))}
        />
        <CampoTexto
          label={editandoId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
          name="senha"
          tipo="password"
          value={valores.senha}
          onChange={aoMudar}
          erro={erros.senha}
        />
      </Modal>
    </div>
  );
}
