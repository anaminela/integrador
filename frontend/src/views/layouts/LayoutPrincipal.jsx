import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { itensParaPapel } from './itensMenu';
import estilos from './LayoutPrincipal.module.css';

export default function LayoutPrincipal() {
  const { usuario, logout } = useAuth();
  const { naoLidas } = useNotificacao();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false); // controle mobile

  const itens = itensParaPapel(usuario?.papel);

  const grupos = itens.reduce((acc, item) => {
    const chave = item.grupo || 'Principal';
    (acc[chave] = acc[chave] || []).push(item);
    return acc;
  }, {});

  async function aoSair() {
    await logout();
    navigate('/login');
  }

  return (
    <div className={estilos.wrapper}>
      {/* ---------- BARRA LATERAL ---------- */}
      <aside className={`${estilos.sidebar} ${menuAberto ? estilos.aberto : ''}`}>
        <div className={estilos.marca}>
          <span className={estilos.logo}>🏝️</span>
          <div>
            <strong>G2 Arena</strong>
            <small>Beach</small>
          </div>
        </div>

        <nav className={estilos.nav}>
          {Object.entries(grupos).map(([grupo, lista]) => (
            <div key={grupo} className={estilos.grupo}>
              {grupo !== 'Principal' && <span className={estilos.grupoTitulo}>{grupo}</span>}
              {lista.map((item) => (
                <NavLink
                  key={item.caminho}
                  to={item.caminho}
                  end={item.caminho === '/'}
                  className={({ isActive }) =>
                    `${estilos.link} ${isActive ? estilos.ativo : ''}`
                  }
                  onClick={() => setMenuAberto(false)}
                >
                  <span className={estilos.icone}>{item.icone}</span>
                  {item.rotulo}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Sombra que fecha o menu no mobile */}
      {menuAberto && <div className={estilos.backdrop} onClick={() => setMenuAberto(false)} />}

      {/* ---------- ÁREA DIREITA ---------- */}
      <div className={estilos.conteudo}>
        {/* Topo */}
        <header className={estilos.topo}>
          <button
            className={estilos.hamburguer}
            onClick={() => setMenuAberto((v) => !v)}
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div className={estilos.topoDireita}>
            <NavLink to="/notificacoes" className={estilos.sino} aria-label="Notificações">
              🔔
              {naoLidas > 0 && <span className={estilos.contador}>{naoLidas}</span>}
            </NavLink>

            <div className={estilos.usuario}>
              <span className={estilos.avatar}>{usuario?.nome?.charAt(0)?.toUpperCase()}</span>
              <div className={estilos.usuarioInfo}>
                <strong>{usuario?.nome}</strong>
                <small>{usuario?.rotuloPapel}</small>
              </div>
            </div>

            <button className={estilos.sair} onClick={aoSair}>
              Sair
            </button>
          </div>
        </header>

        {/* Conteúdo da página atual */}
        <main className={estilos.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
