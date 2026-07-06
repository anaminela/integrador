// =============================================================
// MIDDLEWARE: autenticar
// Responsabilidade: interceptar requisições, verificar o JWT
// e popular req.usuario com o payload decodificado.
//
// ONDE ESTE ARQUIVO SE ENCAIXA NA ARQUITETURA MVC:
// Middleware não é M, V nem C — é uma camada transversal.
// Pense nele como um segurança na porta de cada sala:
//
//   Requisição → [autenticar] → Controller → Model → Resposta
//                    ↑
//              Está aqui. Barra a entrada se o token for inválido.
//              Libera e enriquece req com req.usuario se for válido.
//
// USO NAS ROTAS:
//   // Protege uma rota inteira:
//   router.get("/", autenticar, Controller.listar)
//
//   // Protege e exige perfil específico:
//   router.post("/", autenticar, exigirPerfil("ADMINISTRADOR"), Controller.criar)
//
// O Express executa os handlers em sequência — se autenticar
// chamar next(), o próximo handler (Controller) é executado.
// Se chamar res.status(401).json(...), a cadeia para ali.
// =============================================================

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "quadras_dev_secret_2024";

// ------------------------------------------------------------------
// MIDDLEWARE PRINCIPAL: autenticar
// Lê o header Authorization, valida o JWT e injeta req.usuario.
// ------------------------------------------------------------------
const autenticar = (req, res, next) => {
  // O token deve vir no header:  Authorization: Bearer <token>
  // Convenção "Bearer" é o padrão OAuth2/JWT para APIs REST.
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "erro",
      mensagem: "Token de autenticação não fornecido.",
      instrucao: "Envie o header: Authorization: Bearer <seu_token>",
    });
  }

  // Extrai apenas o token, descartando o prefixo "Bearer "
  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify(token, segredo) → payload decodificado
    // Lança erro se: token expirado, assinatura inválida, malformado
    const payload = jwt.verify(token, JWT_SECRET);

    // Injeta o payload decodificado em req.usuario.
    // A partir daqui, qualquer Controller pode acessar:
    //   req.usuario.id, req.usuario.perfil, req.usuario.tipo_perfil
    req.usuario = payload;

    next(); // token válido → passa para o próximo handler
  } catch (erro) {
    // jwt.verify lança tipos específicos de erro:
    //   TokenExpiredError → token expirou
    //   JsonWebTokenError → token inválido/adulterado
    //   NotBeforeError    → token ainda não é válido
    const expirado = erro.name === "TokenExpiredError";

    return res.status(401).json({
      status: "erro",
      mensagem: expirado
        ? "Token expirado. Faça login novamente."
        : "Token inválido.",
    });
  }
};

// ------------------------------------------------------------------
// MIDDLEWARE FÁBRICA: exigirPerfil(...perfisPermitidos)
//
// Retorna um middleware que bloqueia acesso se req.usuario não
// tiver o tipo_perfil esperado. Sempre usado APÓS autenticar.
//
// É uma "fábrica de middlewares" — uma função que recebe
// parâmetros e devolve outra função (closure).
// Isso permite reutilizar a mesma lógica com perfis diferentes:
//
//   exigirPerfil("ADMINISTRADOR")           → só admin
//   exigirPerfil("ADMINISTRADOR","FUNCIONARIO") → ambos
//
// ------------------------------------------------------------------
const exigirPerfil = (...perfisPermitidos) => {
  return (req, res, next) => {
    const { perfil, tipo_perfil } = req.usuario;

    // Clientes (perfil="cliente") nunca têm tipo_perfil.
    // Admins/Funcionários têm tipo_perfil = "ADMINISTRADOR" | "FUNCIONARIO".
    // A verificação abrange os dois campos:
    const temAcesso =
      perfisPermitidos.includes(perfil) ||
      perfisPermitidos.includes(tipo_perfil);

    if (!temAcesso) {
      return res.status(403).json({  // 403 Forbidden: autenticado mas sem permissão
        status: "erro",
        mensagem: "Acesso negado. Seu perfil não tem permissão para esta ação.",
        seu_perfil: tipo_perfil ?? perfil,
        perfis_permitidos: perfisPermitidos,
      });
    }

    next(); // perfil autorizado → segue para o Controller
  };
};

module.exports = { autenticar, exigirPerfil };
