// =============================================================
// PÁGINA: Central de Notificações (RF13 / RF14 in-app)
// -------------------------------------------------------------
// Substitui os lembretes por WhatsApp (fora do escopo) por uma
// central in-app. Mostra as notificações acumuladas na sessão e,
// para internos, permite "buscar" lembretes/alertas do backend e
// adicioná-los à central.
// =============================================================
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { notificacaoService } from '../../services';
import { Cartao, Botao, Badge, EstadoVazio } from '../components';
import { formatarDataHora } from '../../utils/formatadores';
import estilos from './Paginas.module.css';

export default function NotificacoesPage() {
  const { usuario } = useAuth();
  const { central, marcarTodasLidas, limparCentral, adicionarNaCentral, sucesso, erro } =
    useNotificacao();
  const [buscando, setBuscando] = useState(false);

  // Internos podem disparar a consulta de lembretes/alertas no backend.
  async function buscarDoBackend() {
    setBuscando(true);
    try {
      const [lembretes, alertas] = await Promise.allSettled([
        notificacaoService.lembretes(),
        notificacaoService.alertas(),
      ]);

      const novas = [];
      if (lembretes.status === 'fulfilled') {
        const lista = lembretes.value.data ?? lembretes.value.lembretes ?? [];
        lista.forEach((l) =>
          novas.push({ mensagem: l.mensagem ?? JSON.stringify(l), tipo: 'info' }),
        );
      }
      if (alertas.status === 'fulfilled') {
        const lista = alertas.value.data ?? alertas.value.alertas ?? [];
        lista.forEach((a) =>
          novas.push({ mensagem: a.mensagem ?? JSON.stringify(a), tipo: 'alerta' }),
        );
      }

      if (novas.length) {
        adicionarNaCentral(novas);
        sucesso(`${novas.length} notificação(ões) carregada(s).`);
      } else {
        sucesso('Nenhuma nova notificação no momento.');
      }
    } catch (e) {
      erro(e.message || 'Erro ao buscar notificações.');
    } finally {
      setBuscando(false);
    }
  }

  const tomPorTipo = { sucesso: 'sucesso', erro: 'erro', alerta: 'alerta', info: 'info' };

  return (
    <div>
      <div className={estilos.cabecalhoPagina}>
        <div>
          <h1 className="titulo-pagina">🔔 Notificações</h1>
          <p className="subtitulo-pagina">Lembretes e avisos do sistema (in-app).</p>
        </div>
        <div className="flex gap-sm wrap">
          {usuario?.ehInterno && (
            <Botao variante="secundario" carregando={buscando} onClick={buscarDoBackend}>
              Buscar lembretes/alertas
            </Botao>
          )}
          <Botao variante="fantasma" onClick={marcarTodasLidas}>
            Marcar todas como lidas
          </Botao>
          <Botao variante="fantasma" onClick={limparCentral}>
            Limpar
          </Botao>
        </div>
      </div>

      {central.length === 0 ? (
        <EstadoVazio icone="📭" mensagem="Você não tem notificações no momento." />
      ) : (
        <div className="flex flex-col gap-sm">
          {central.map((n) => (
            <Cartao key={n.id}>
              <div className="flex justify-between items-center gap-md">
                <div>
                  <p style={{ fontWeight: n.lida ? 400 : 600 }}>{n.mensagem}</p>
                  <small className="text-suave">{formatarDataHora(n.data)}</small>
                </div>
                <Badge tom={tomPorTipo[n.tipo] || 'neutro'}>{n.lida ? 'lida' : 'nova'}</Badge>
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </div>
  );
}
