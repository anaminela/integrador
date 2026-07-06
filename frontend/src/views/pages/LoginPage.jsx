import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { Botao, CampoTexto, Alerta } from '../components';
import estilos from './Auth.module.css';

export default function LoginPage() {
  const { login, autenticado } = useAuth();
  const { sucesso } = useNotificacao();
  const navigate = useNavigate();
  const location = useLocation();

  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/" replace />;

  const destino = location.state?.de || '/';

  async function aoEnviar(e) {
    e.preventDefault();
    setErro('');
    if (!loginInput || !senha) {
      setErro('Informe login e senha.');
      return;
    }
    setEnviando(true);
    try {
      const resp = await login(loginInput.trim(), senha);
      sucesso(`Bem-vindo(a), ${resp.usuario.nome}!`);
      navigate(destino, { replace: true });
    } catch (e2) {
      setErro(e2.message || 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      {/* Lado visual */}
      <div className={estilos.hero}>
        <span className={estilos.heroLogo}>🏝️</span>
        <h1>G2 Arena Beach</h1>
        <p>Gestão completa das suas quadras poliesportivas em Xanxerê/SC.</p>
        <div className={estilos.heroLista}>
          <span className={estilos.heroItem}>📅 Agende quadras em tempo real</span>
          <span className={estilos.heroItem}>🏐 Turmas e treinos com professores</span>
          <span className={estilos.heroItem}>🥤 Cardápio e serviços no local</span>
        </div>
      </div>

      {/* Formulário */}
      <div className={estilos.formLado}>
        <div className={estilos.formCaixa}>
          <h2 className={estilos.formTitulo}>Entrar</h2>
          <p className={estilos.formSub}>Acesse com seu CPF ou e-mail cadastrado.</p>

          <Alerta tipo="erro">{erro}</Alerta>

          <form onSubmit={aoEnviar}>
            <CampoTexto
              label="CPF ou E-mail"
              name="login"
              placeholder="ana.lima@email.com"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              autoComplete="username"
            />
            <CampoTexto
              label="Senha"
              name="senha"
              tipo="password"
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
            />
            <div className="flex justify-between items-center mb-md">
              <Link to="/recuperar-senha" className={estilos.linkForte}>
                Esqueci minha senha
              </Link>
            </div>
            <Botao type="submit" carregando={enviando} className="w-full">
              Entrar
            </Botao>
          </form>

          <p className={estilos.rodapeLink}>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className={estilos.linkForte}>
              Cadastre-se
            </Link>
          </p>

          <div className={estilos.dica}>
            <strong>Ambiente de testes:</strong> cliente <code>ana.lima@email.com</code> / senha{' '}
            <code>senha123</code>. A API deve estar rodando em{' '}
            <code>http://localhost:3000</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
