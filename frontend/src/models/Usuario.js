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

  get papel() {
    if (this.tipo_perfil) return this.tipo_perfil;
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

  get rotuloPapel() {
    if (this.ehAdministrador) return 'Administrador';
    if (this.ehFuncionario) return 'Funcionário';
    return 'Cliente';
  }
}
