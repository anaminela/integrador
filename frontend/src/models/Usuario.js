// =============================================================
// MODEL: Usuario
// -------------------------------------------------------------
// No frontend, um "Model" representa a ENTIDADE de domínio:
// dá forma aos dados que vêm/vão para a API e concentra a lógica
// derivada (ex.: descobrir o papel efetivo do usuário).
// Isso espelha o Model do backend e mantém a arquitetura MVC.
// =============================================================
import { PERFIS } from '../utils/constantes';

export class Usuario {
  constructor(dados = {}) {
    this.id = dados.id ?? null;
    this.nome = dados.nome ?? '';
    this.email = dados.email ?? '';
    this.cpf = dados.cpf ?? '';
    this.telefone = dados.telefone ?? '';
    this.data_nascimento = dados.data_nascimento ?? '';
    this.ativo = dados.ativo ?? true;
    this.perfil = dados.perfil ?? PERFIS.CLIENTE; // "cliente" | "interno"
    this.tipo_perfil = dados.tipo_perfil ?? null; // "ADMINISTRADOR" | "FUNCIONARIO" | null
    this.criado_em = dados.criado_em ?? null;
  }

  // Papel efetivo usado para autorização na UI.
  // Internos usam tipo_perfil; clientes usam o perfil.
  get papel() {
    if (this.tipo_perfil) return this.tipo_perfil; // ADMINISTRADOR | FUNCIONARIO
    return PERFIS.CLIENTE;
  }

  get ehAdministrador() {
    return this.tipo_perfil === PERFIS.ADMINISTRADOR;
  }

  get ehFuncionario() {
    return this.tipo_perfil === PERFIS.FUNCIONARIO;
  }

  get ehInterno() {
    return this.perfil === 'interno';
  }

  get ehCliente() {
    return this.perfil === PERFIS.CLIENTE;
  }

  // Rótulo amigável do papel, para exibir na interface.
  get rotuloPapel() {
    if (this.ehAdministrador) return 'Administrador';
    if (this.ehFuncionario) return 'Funcionário';
    return 'Cliente';
  }
}
