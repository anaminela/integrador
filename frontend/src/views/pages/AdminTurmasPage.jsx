import { useState, useEffect } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useTurmas, useFormulario } from '../../controllers';
import { quadraService, adminService } from '../../services';
import { Botao, CampoTexto, CampoSelect, Modal, Tabela, Badge, Carregando } from '../components';
import { capitalizar } from '../../utils/formatadores';
import { NIVEIS_TURMA } from '../../utils/constantes';
import { validarObrigatorio } from '../../utils/validadores';
import estilos from './Paginas.module.css';

const DIAS = [
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
  'domingo',
];

function validar(v) {
  const erros = {
    quadra_id: validarObrigatorio(v.quadra_id, 'Quadra'),
    professor_id: validarObrigatorio(v.professor_id, 'Professor'),
    dia_semana: validarObrigatorio(v.dia_semana, 'Dia da semana'),
    hora_inicio: validarObrigatorio(v.hora_inicio, 'Hora início'),
    hora_fim: validarObrigatorio(v.hora_fim, 'Hora fim'),
    nivel: validarObrigatorio(v.nivel, 'Nível'),
    capacidade_maxima: '',
  };
  const cap = Number(v.capacidade_maxima);
  if (!cap || cap < 3 || cap > 6) erros.capacidade_maxima = 'Capacidade deve ser entre 3 e 6.';
  return erros;
}

const VAZIO = {
  quadra_id: '',
  professor_id: '',
  dia_semana: '',
  hora_inicio: '',
  hora_fim: '',
  nivel: 'iniciante',
  capacidade_maxima: 4,
};

export default function AdminTurmasPage() {
  const { turmas, carregando, criar } = useTurmas();
  const { sucesso, erro: notifErro } = useNotificacao();

  const [quadras, setQuadras] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { valores, erros, aoMudar, validarTudo, setValores } = useFormulario(VAZIO, validar);

  // Carrega quadras e professores (internos) para os selects.
  useEffect(() => {
    quadraService.listar().then((r) => setQuadras(r.data ?? r ?? []));
    adminService
      .listar()
      .then((r) => setProfessores(r.data ?? r ?? []))
      .catch(() => {});
  }, []);

  function abrirNovo() {
    setValores(VAZIO);
    setModalAberto(true);
  }

  async function salvar() {
    if (!validarTudo()) return;
    setSalvando(true);
    try {
      await criar({
        ...valores,
        quadra_id: Number(valores.quadra_id),
        professor_id: Number(valores.professor_id),
        capacidade_maxima: Number(valores.capacidade_maxima),
      });
      sucesso('Turma cadastrada com sucesso.');
      setModalAberto(false);
    } catch (e) {
      notifErro(e.message || 'Erro ao cadastrar turma.');
    } finally {
      setSalvando(false);
    }
  }

  const colunas = [
    { chave: 'nivel', titulo: 'Nível', render: (t) => <Badge tom="info">{capitalizar(t.nivel)}</Badge> },
    { chave: 'dia_semana', titulo: 'Dia', render: (t) => capitalizar(t.dia_semana) },
    { chave: 'horario', titulo: 'Horário', render: (t) => `${t.hora_inicio} - ${t.hora_fim}` },
    {
      chave: 'capacidade',
      titulo: 'Vagas',
      render: (t) => `${t.matriculados}/${t.capacidade_maxima}`,
    },
  ];

  return (
    <div>
      <div className={estilos.cabecalhoPagina}>
        <div>
          <h1 className="titulo-pagina">➕ Cadastro de Turmas</h1>
          <p className="subtitulo-pagina">Crie e visualize as turmas/treinos da arena.</p>
        </div>
        <Botao onClick={abrirNovo}>+ Nova turma</Botao>
      </div>

      {carregando ? <Carregando /> : <Tabela colunas={colunas} dados={turmas} vazio="Nenhuma turma cadastrada." />}

      <Modal
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        titulo="Nova Turma"
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
        <CampoSelect
          label="Quadra"
          name="quadra_id"
          value={valores.quadra_id}
          onChange={aoMudar}
          erro={erros.quadra_id}
          placeholder="Selecione a quadra"
          opcoes={quadras.map((q) => ({ valor: String(q.id), rotulo: q.nome }))}
        />
        <CampoSelect
          label="Professor"
          name="professor_id"
          value={valores.professor_id}
          onChange={aoMudar}
          erro={erros.professor_id}
          placeholder="Selecione o professor"
          opcoes={professores.map((p) => ({
            valor: String(p.id),
            rotulo: `${p.nome}${p.tipo_perfil ? ` (${capitalizar(p.tipo_perfil)})` : ''}`,
          }))}
        />
        <CampoSelect
          label="Dia da semana"
          name="dia_semana"
          value={valores.dia_semana}
          onChange={aoMudar}
          erro={erros.dia_semana}
          placeholder="Selecione"
          opcoes={DIAS.map((d) => ({ valor: d, rotulo: capitalizar(d) }))}
        />
        <div className="flex gap-md wrap">
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoTexto
              label="Hora início"
              name="hora_inicio"
              tipo="time"
              value={valores.hora_inicio}
              onChange={aoMudar}
              erro={erros.hora_inicio}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoTexto
              label="Hora fim"
              name="hora_fim"
              tipo="time"
              value={valores.hora_fim}
              onChange={aoMudar}
              erro={erros.hora_fim}
            />
          </div>
        </div>
        <div className="flex gap-md wrap">
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoSelect
              label="Nível"
              name="nivel"
              value={valores.nivel}
              onChange={aoMudar}
              erro={erros.nivel}
              placeholder="Selecione"
              opcoes={NIVEIS_TURMA.map((n) => ({ valor: n, rotulo: capitalizar(n) }))}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <CampoTexto
              label="Capacidade (3–6)"
              name="capacidade_maxima"
              tipo="number"
              min="3"
              max="6"
              value={valores.capacidade_maxima}
              onChange={aoMudar}
              erro={erros.capacidade_maxima}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
