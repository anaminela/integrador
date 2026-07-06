import { useState } from 'react';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useTurmas } from '../../controllers';
import { Cartao, Botao, Modal, CampoTexto, Badge, Carregando, EstadoVazio } from '../components';
import { mascararTelefone, capitalizar } from '../../utils/formatadores';
import { validarTelefone } from '../../utils/validadores';
import estilos from './Paginas.module.css';

export default function TurmasPage() {
  const { turmas, carregando, inscrever, entrarNaFila } = useTurmas();
  const { sucesso, erro: notifErro, info } = useNotificacao();

  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [telefone, setTelefone] = useState('');
  const [erroTel, setErroTel] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function confirmarInscricao() {
    const erro = validarTelefone(telefone);
    if (erro) return setErroTel(erro);
    setSalvando(true);
    try {
      await inscrever(turmaSelecionada.id, telefone);
      sucesso('Inscrição realizada com sucesso!');
      setTurmaSelecionada(null);
      setTelefone('');
    } catch (e) {
      notifErro(e.message || 'Não foi possível inscrever.');
    } finally {
      setSalvando(false);
    }
  }

  async function aoEntrarNaFila(turma) {
    try {
      await entrarNaFila(turma.id);
      info('Você entrou na fila de espera desta turma.');
    } catch (e) {
      notifErro(e.message || 'Não foi possível entrar na fila.');
    }
  }

  if (carregando) return <Carregando texto="Carregando turmas..." />;

  return (
    <div>
      <h1 className="titulo-pagina">🏐 Turmas & Treinos</h1>
      <p className="subtitulo-pagina">
        Escolha um treino e inscreva-se. Turmas lotadas possuem fila de espera.
      </p>

      {turmas.length === 0 ? (
        <EstadoVazio icone="🏆" mensagem="Nenhuma turma disponível no momento." />
      ) : (
        <div className="grade">
          {turmas.map((t) => (
            <Cartao key={t.id}>
              <div className="flex justify-between items-center">
                <h3 className={estilos.itemTitulo}>Turma {capitalizar(t.nivel)}</h3>
                <Badge tom={t.lotada ? 'erro' : 'sucesso'}>
                  {t.lotada ? 'Lotada' : `${t.vagas_disponiveis} vagas`}
                </Badge>
              </div>
              <p className={estilos.itemDado}>📆 {capitalizar(t.dia_semana)}</p>
              <p className={estilos.itemDado}>
                🕒 {t.hora_inicio} - {t.hora_fim}
              </p>
              <p className={estilos.itemDado}>
                👥 {t.matriculados}/{t.capacidade_maxima} matriculados
              </p>

              {t.lotada ? (
                <Botao
                  variante="secundario"
                  className="w-full mt-sm"
                  onClick={() => aoEntrarNaFila(t)}
                >
                  Entrar na fila de espera
                </Botao>
              ) : (
                <Botao className="w-full mt-sm" onClick={() => setTurmaSelecionada(t)}>
                  Inscrever-se
                </Botao>
              )}
            </Cartao>
          ))}
        </div>
      )}

      {/* Modal de inscrição (telefone obrigatório — RF5) */}
      <Modal
        aberto={Boolean(turmaSelecionada)}
        aoFechar={() => setTurmaSelecionada(null)}
        titulo="Inscrição em Turma"
        rodape={
          <>
            <Botao variante="fantasma" onClick={() => setTurmaSelecionada(null)}>
              Cancelar
            </Botao>
            <Botao carregando={salvando} onClick={confirmarInscricao}>
              Confirmar inscrição
            </Botao>
          </>
        }
      >
        {turmaSelecionada && (
          <div>
            <p className={estilos.itemDado}>
              Turma <strong>{capitalizar(turmaSelecionada.nivel)}</strong> —{' '}
              {capitalizar(turmaSelecionada.dia_semana)}, {turmaSelecionada.hora_inicio} às{' '}
              {turmaSelecionada.hora_fim}.
            </p>
            <CampoTexto
              label="Telefone de contato"
              name="telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => {
                setTelefone(mascararTelefone(e.target.value));
                setErroTel('');
              }}
              erro={erroTel}
            />
            <p className={estilos.itemDado}>
              Usaremos este número para avisar sobre horários e mudanças na turma.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
