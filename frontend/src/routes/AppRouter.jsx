// =============================================================
// ROTEADOR PRINCIPAL DA APLICAÇÃO
// -------------------------------------------------------------
// Define TODAS as rotas do frontend usando o React Router.
//   • Rotas públicas: login, cadastro, recuperação de senha
//   • Rotas protegidas: envolvidas por <RotaProtegida> e pelo
//     <LayoutPrincipal> (menu + topo)
//   • Autorização por papel via prop "papeis"
// =============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PERFIS } from '../utils/constantes';
import RotaProtegida from './RotaProtegida';
import LayoutPrincipal from '../views/layouts/LayoutPrincipal';

// --- Páginas públicas (autenticação) ---
import LoginPage from '../views/pages/LoginPage';
import RegistroPage from '../views/pages/RegistroPage';
import RecuperarSenhaPage from '../views/pages/RecuperarSenhaPage';

// --- Páginas comuns (cliente + internos) ---
import DashboardPage from '../views/pages/DashboardPage';
import AgendamentosPage from '../views/pages/AgendamentosPage';
import TurmasPage from '../views/pages/TurmasPage';
import CardapioPage from '../views/pages/CardapioPage';
import NotificacoesPage from '../views/pages/NotificacoesPage';

// --- Páginas internas (funcionário + admin) ---
import PainelProfessorPage from '../views/pages/PainelProfessorPage';
import GestaoAgendamentosPage from '../views/pages/GestaoAgendamentosPage';
import QuadrasPage from '../views/pages/QuadrasPage';
import ProdutosPage from '../views/pages/ProdutosPage';
import FinanceiroPage from '../views/pages/FinanceiroPage';

// --- Páginas administrativas (só admin) ---
import UsuariosPage from '../views/pages/UsuariosPage';
import AdminTurmasPage from '../views/pages/AdminTurmasPage';
import AuditoriaPage from '../views/pages/AuditoriaPage';

// --- Páginas utilitárias ---
import SemPermissaoPage from '../views/pages/SemPermissaoPage';
import NaoEncontradaPage from '../views/pages/NaoEncontradaPage';

const INTERNOS = [PERFIS.FUNCIONARIO, PERFIS.ADMINISTRADOR];
const SO_ADMIN = [PERFIS.ADMINISTRADOR];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- ROTAS PÚBLICAS ---------- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegistroPage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />

        {/* ---------- ROTAS PROTEGIDAS (com layout) ---------- */}
        <Route
          element={
            <RotaProtegida>
              <LayoutPrincipal />
            </RotaProtegida>
          }
        >
          {/* Comuns a todos os autenticados */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          <Route path="/turmas" element={<TurmasPage />} />
          <Route path="/cardapio" element={<CardapioPage />} />
          <Route path="/notificacoes" element={<NotificacoesPage />} />

          {/* Internos (funcionário + admin) */}
          <Route
            path="/painel-professor"
            element={
              <RotaProtegida papeis={INTERNOS}>
                <PainelProfessorPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/gestao-agendamentos"
            element={
              <RotaProtegida papeis={INTERNOS}>
                <GestaoAgendamentosPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/quadras"
            element={
              <RotaProtegida papeis={INTERNOS}>
                <QuadrasPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/produtos"
            element={
              <RotaProtegida papeis={INTERNOS}>
                <ProdutosPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/financeiro"
            element={
              <RotaProtegida papeis={INTERNOS}>
                <FinanceiroPage />
              </RotaProtegida>
            }
          />

          {/* Administrativas (só admin) */}
          <Route
            path="/usuarios"
            element={
              <RotaProtegida papeis={SO_ADMIN}>
                <UsuariosPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/admin-turmas"
            element={
              <RotaProtegida papeis={SO_ADMIN}>
                <AdminTurmasPage />
              </RotaProtegida>
            }
          />
          <Route
            path="/auditoria"
            element={
              <RotaProtegida papeis={SO_ADMIN}>
                <AuditoriaPage />
              </RotaProtegida>
            }
          />

          {/* Utilitárias dentro do layout */}
          <Route path="/sem-permissao" element={<SemPermissaoPage />} />
        </Route>

        {/* 404 global */}
        <Route path="*" element={<NaoEncontradaPage />} />
        <Route path="/inicio" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
