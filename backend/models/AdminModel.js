let admins = [
  {
    id: 1,
    nome: "Roberto Admin",
    email: "roberto.admin@quadras.com",
    cpf: "111.111.111-11",
    telefone: "(11) 91111-0001",
    data_nascimento: "1980-06-15",
    // Hash bcrypt de "senha123" — mesma senha dos seeds de UsuarioModel
    senha: "123456",
    tipo_perfil: "ADMINISTRADOR",
    ativo: true,
    perfil: "interno",           // distingue deste model vs UsuarioModel
    criado_em: new Date("2024-01-01T08:00:00Z"),
  },
  {
    id: 2,
    nome: "Fernanda Coach",
    email: "fernanda.coach@quadras.com",
    cpf: "222.222.222-22",
    telefone: "(11) 92222-0002",
    data_nascimento: "1992-11-03",
    senha: "123456",
    tipo_perfil: "FUNCIONARIO",
    ativo: true,
    perfil: "interno",
    criado_em: new Date("2024-01-05T09:00:00Z"),
  },
];

let proximoId = 3;

const TIPOS_PERFIL_VALIDOS = ["ADMINISTRADOR", "FUNCIONARIO"];

const semSenha = (admin) => {
  const { senha, ...resto } = admin;
  return resto;
};

const AdminModel = {

  TIPOS_PERFIL_VALIDOS,

  findAll(tipo_perfil = null) {
    const lista = tipo_perfil
      ? admins.filter((a) => a.tipo_perfil === tipo_perfil)
      : [...admins];
    return lista.map(semSenha);
  },


  findById(id) {
    const admin = admins.find((a) => a.id === id);
    return admin ? semSenha(admin) : undefined;
  },


  findByEmail(email) {
    return admins.find((a) => a.email === email.toLowerCase());
  },


  existePorCampo(campo, valor, excluirId = null) {
    return admins.some(
      (a) => a[campo] === valor && a.id !== excluirId
    );
  },


  create(dados) {
    const novoAdmin = {
      id: proximoId++,
      nome: dados.nome,
      email: dados.email.toLowerCase(),
      cpf: dados.cpf,
      telefone: dados.telefone,
      data_nascimento: dados.data_nascimento ?? null,
      senha: dados.senha,                       // hash bcrypt
      tipo_perfil: dados.tipo_perfil,           // "ADMINISTRADOR" | "FUNCIONARIO"
      ativo: true,
      perfil: "interno",
      criado_em: new Date(),
    };
    admins.push(novoAdmin);
    return semSenha(novoAdmin);
  },


  update(id, dadosAtualizados) {
    const index = admins.findIndex((a) => a.id === id);
    if (index === -1) return null;


    const { perfil, criado_em, ...atualizacaoSegura } = dadosAtualizados;

    admins[index] = { ...admins[index], ...atualizacaoSegura };
    return semSenha(admins[index]);
  },


  deactivate(id) {
    const index = admins.findIndex((a) => a.id === id);
    if (index === -1) return false;
    admins[index].ativo = false;
    return true;
  },

  reactivate(id) {
    const index = admins.findIndex((a) => a.id === id);
    if (index === -1) return false;
    admins[index].ativo = true;
    return true;
  },
};

module.exports = AdminModel;
