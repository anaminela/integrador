// =============================================================
// PÁGINA: Recuperação de Senha (RF10)
// -------------------------------------------------------------
// Fluxo em duas etapas:
//   1) Solicitar token por e-mail (POST /auth/esqueci-senha)
//   2) Redefinir a senha com e-mail + token + nova senha
//      (POST /auth/redefinir-senha)
// No mock o backend retorna o token como "token_simulado_para_teste".
// =============================================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { authService } from '../../services';
import { Botao, CampoTexto, Alerta } from '../components';
import { validarEmail, validarSenha } from '../../utils/validadores';
import estilos from './Auth.module.css';

export default function RecuperarSenhaPage() {
  const { sucesso } = useNotificacao();
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1); // 1 = solicitar, 2 = redefinir
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [info, setInfo] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function solicitar(e) {
    e.preventDefault();
    setErro('');
    setInfo('');
    const erroEmail = validarEmail(email);
    if (erroEmail) return setErro(erroEmail);

    setEnviando(true);
    try {
      const resp = await authService.esqueciSenha(email.trim());
      // No mock, o backend devolve o token para testes.
      const tokenTeste = resp.token_simulado_para_teste;
      if (tokenTeste) {
        setToken(tokenTeste);
        setInfo(`Token de teste gerado automaticamente: ${tokenTeste}`);
      } else {
        setInfo('Se o e-mail existir, você receberá um token de recuperação.');
      }
      setEtapa(2);
    } catch (e2) {
      setErro(e2.message || 'Não foi possível solicitar a recuperação.');
    } finally {
      setEnviando(false);
    }
  }

  async function redefinir(e) {
    e.preventDefault();
    setErro('');
    if (!token) return setErro('Informe o token recebido por e-mail.');
    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) return setErro(erroSenha);

    setEnviando(true);
    try {
      await authService.redefinirSenha(email.trim(), token.trim(), novaSenha);
      sucesso('Senha redefinida com sucesso! Faça login.');
      navigate('/login');
    } catch (e2) {
      setErro(e2.message || 'Não foi possível redefinir a senha.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.hero}>
        <span className={estilos.heroLogo}>🔑</span>
        <h1>Recuperar acesso</h1>
        <p>Enviaremos um token para o seu e-mail. Use-o para definir uma nova senha.</p>
      </div>

      <div className={estilos.formLado}>
        <div className={estilos.formCaixa}>
          <h2 className={estilos.formTitulo}>
            {etapa === 1 ? 'Esqueci minha senha' : 'Redefinir senha'}
          </h2>
          <p className={estilos.formSub}>
            {etapa === 1
              ? 'Informe seu e-mail para receber o token.'
              : 'Digite o token recebido e a nova senha.'}
          </p>

          <Alerta tipo="erro">{erro}</Alerta>
          <Alerta tipo="info">{info}</Alerta>

          {etapa === 1 ? (
            <form onSubmit={solicitar}>
              <CampoTexto
                label="E-mail"
                name="email"
                tipo="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Botao type="submit" carregando={enviando} className="w-full">
                Enviar token
              </Botao>
            </form>
          ) : (
            <form onSubmit={redefinir}>
              <CampoTexto
                label="Token (6 dígitos)"
                name="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <CampoTexto
                label="Nova senha"
                name="novaSenha"
                tipo="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
              <Botao type="submit" carregando={enviando} className="w-full">
                Redefinir senha
              </Botao>
            </form>
          )}

          <p className={estilos.rodapeLink}>
            <Link to="/login" className={estilos.linkForte}>
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
