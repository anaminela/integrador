export function validarEmail(email) {
  if (!email) return 'E-mail é obrigatório.';
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) ? '' : 'E-mail inválido.';
}

export function validarCPF(cpf) {
  if (!cpf) return 'CPF é obrigatório.';
  const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return regex.test(cpf) ? '' : 'CPF deve estar no formato 000.000.000-00.';
}

export function validarSenha(senha) {
  if (!senha) return 'Senha é obrigatória.';
  return senha.length >= 6 ? '' : 'A senha deve ter no mínimo 6 caracteres.';
}

export function validarObrigatorio(valor, nomeCampo = 'Campo') {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return `${nomeCampo} é obrigatório.`;
  }
  return '';
}

export function validarTelefone(telefone) {
  if (!telefone) return 'Telefone é obrigatório.';
  const digitos = telefone.replace(/\D/g, '');
  return digitos.length >= 10 ? '' : 'Telefone inválido.';
}

export function validarNumeroPositivo(valor, nomeCampo = 'Valor') {
  if (valor === '' || valor === undefined || valor === null) {
    return `${nomeCampo} é obrigatório.`;
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) return `${nomeCampo} deve ser um número.`;
  return numero > 0 ? '' : `${nomeCampo} deve ser maior que zero.`;
}

export function validarNaoNegativo(valor, nomeCampo = 'Valor') {
  if (valor === '' || valor === undefined || valor === null) {
    return `${nomeCampo} é obrigatório.`;
  }
  const numero = Number(valor);
  if (Number.isNaN(numero)) return `${nomeCampo} deve ser um número.`;
  return numero >= 0 ? '' : `${nomeCampo} não pode ser negativo.`;
}

export function formularioValido(erros) {
  return Object.values(erros).every((mensagem) => !mensagem);
}
