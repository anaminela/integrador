// =============================================================
// VALIDADORES DE FORMULÁRIO
// -------------------------------------------------------------
// Replicam no frontend as regras de validação do backend
// (ver seção 5 da ANALISE_BACKEND.md). Cada função retorna
// uma string de erro (ou "" quando o valor é válido), permitindo
// montar objetos de erro por campo de forma consistente.
// =============================================================

// E-mail: formato básico xxx@yyy.zzz
export function validarEmail(email) {
  if (!email) return 'E-mail é obrigatório.';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? '' : 'E-mail inválido.';
}

// CPF: precisa estar no formato 000.000.000-00 (validação de máscara).
export function validarCPF(cpf) {
  if (!cpf) return 'CPF é obrigatório.';
  const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return regex.test(cpf) ? '' : 'CPF deve estar no formato 000.000.000-00.';
}

// Senha: mínimo de 6 caracteres.
export function validarSenha(senha) {
  if (!senha) return 'Senha é obrigatória.';
  return senha.length >= 6 ? '' : 'A senha deve ter no mínimo 6 caracteres.';
}

// Campo obrigatório genérico.
export function validarObrigatorio(valor, nomeCampo = 'Campo') {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return `${nomeCampo} é obrigatório.`;
  }
  return '';
}

// Telefone: exige ao menos 10 dígitos.
export function validarTelefone(telefone) {
  if (!telefone) return 'Telefone é obrigatório.';
  const digitos = telefone.replace(/\D/g, '');
  return digitos.length >= 10 ? '' : 'Telefone inválido.';
}

// Número positivo (para preços, quantidades, etc).
export function validarNumeroPositivo(valor, nomeCampo = 'Valor') {
  if (valor === '' || valor === undefined || valor === null) {
    return `${nomeCampo} é obrigatório.`;
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) return `${nomeCampo} deve ser um número.`;
  return numero > 0 ? '' : `${nomeCampo} deve ser maior que zero.`;
}

// Número não negativo (>= 0) — usado em estoque mínimo, preço de custo, etc.
export function validarNaoNegativo(valor, nomeCampo = 'Valor') {
  if (valor === '' || valor === undefined || valor === null) {
    return `${nomeCampo} é obrigatório.`;
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) return `${nomeCampo} deve ser um número.`;
  return numero >= 0 ? '' : `${nomeCampo} não pode ser negativo.`;
}

// Utilitário: recebe um objeto de erros e diz se o formulário é válido.
// Válido = todos os valores são strings vazias.
export function formularioValido(erros) {
  return Object.values(erros).every((mensagem) => !mensagem);
}
