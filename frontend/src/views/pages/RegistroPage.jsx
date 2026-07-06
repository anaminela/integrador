import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificacao } from '../../contexts/NotificacaoContext';
import { useFormulario } from '../../controllers';
import { usuarioService } from '../../services';
import { Botao, CampoTexto, Alerta } from '../components';
import { mascararCPF, mascararTelefone } from '../../utils/formatadores';
import {
  validarEmail,
  validarCPF,
  validarSenha,
  validarTelefone,
  validarObrigatorio,
} from '../../utils/validadores';
import estilos from './Auth.module.css';

function validar(v) {
  return {
    nome: validarObrigatorio(v.nome, 'Nome'),
    email: validarEmail(v.email),
    cpf: validarCPF(v.cpf),
    telefone: validarTelefone(v.telefone),
    senha: validarSenha(v.senha),
    confirmarSenha:
      v.senha !== v.confirmarSenha ? 'As senhas não coincidem.' : '',
    aceite_termos: v.aceite_termos ? '' : 'É necessário aceitar os termos.',
  };
}

export default function RegistroPage() {
  const { autenticado } = useAuth();
  const { sucesso } = useNotificacao();
  const navigate = useNavigate();
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { valores, erros, aoMudar, definirCampo, validarTudo } = useFormulario(
    {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      data_nascimento: '',
      senha: '',
      confirmarSenha: '',
      aceite_termos: false,
    },
    validar,
  );

  if (autenticado) return <Navigate to="/" replace />;

  async function aoEnviar(e) {
    e.preventDefault();
    setErroGeral('');
    if (!validarTudo()) return;

    setEnviando(true);
    try {
      await usuarioService.cadastrar({
        nome: valores.nome,
        email: valores.email,
        cpf: valores.cpf,
        telefone: valores.telefone,
        data_nascimento: valores.data_nascimento || undefined,
        senha: valores.senha,
        aceite_termos: valores.aceite_termos,
      });
      sucesso('Cadastro realizado! Faça login para continuar.');
      navigate('/login');
    } catch (e2) {
      setErroGeral(e2.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.hero}>
        <span className={estilos.heroLogo}>🏖️</span>
        <h1>Crie sua conta</h1>
        <p>Cadastre-se para agendar quadras, entrar em turmas e aproveitar a estrutura da arena.</p>
      </div>

      <div className={estilos.formLado}>
        <div className={estilos.formCaixa}>
          <h2 className={estilos.formTitulo}>Cadastro de Cliente</h2>
          <p className={estilos.formSub}>Preencha seus dados para começar.</p>

          <Alerta tipo="erro">{erroGeral}</Alerta>

          <form onSubmit={aoEnviar}>
            <CampoTexto
              label="Nome completo"
              name="nome"
              value={valores.nome}
              onChange={aoMudar}
              erro={erros.nome}
            />
            <CampoTexto
              label="E-mail"
              name="email"
              tipo="email"
              value={valores.email}
              onChange={aoMudar}
              erro={erros.email}
            />
            <div className="flex gap-md wrap">
              <div style={{ flex: 1, minWidth: 160 }}>
                <CampoTexto
                  label="CPF"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={valores.cpf}
                  onChange={(e) => definirCampo('cpf', mascararCPF(e.target.value))}
                  erro={erros.cpf}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
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
            <CampoTexto
              label="Data de nascimento (opcional)"
              name="data_nascimento"
              tipo="date"
              value={valores.data_nascimento}
              onChange={aoMudar}
            />
            <div className="flex gap-md wrap">
              <div style={{ flex: 1, minWidth: 160 }}>
                <CampoTexto
                  label="Senha"
                  name="senha"
                  tipo="password"
                  value={valores.senha}
                  onChange={aoMudar}
                  erro={erros.senha}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <CampoTexto
                  label="Confirmar senha"
                  name="confirmarSenha"
                  tipo="password"
                  value={valores.confirmarSenha}
                  onChange={aoMudar}
                  erro={erros.confirmarSenha}
                />
              </div>
            </div>

            <label className="flex items-center gap-sm mb-md" style={{ fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                name="aceite_termos"
                checked={valores.aceite_termos}
                onChange={aoMudar}
              />
              Li e aceito os termos de uso e a política de privacidade.
            </label>
            {erros.aceite_termos && (
              <p style={{ color: 'var(--cor-erro)', fontSize: '0.8rem', marginTop: '-8px' }}>
                {erros.aceite_termos}
              </p>
            )}

            <Botao type="submit" carregando={enviando} className="w-full mt-sm">
              Criar conta
            </Botao>
          </form>

          <p className={estilos.rodapeLink}>
            Já tem conta?{' '}
            <Link to="/login" className={estilos.linkForte}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
