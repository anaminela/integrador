// =============================================================
// FORMATADORES (helpers de apresentação)
// -------------------------------------------------------------
// Funções puras que convertem dados "crus" em texto amigável
// para exibição na interface (moeda, datas, CPF, etc).
// São puras: mesma entrada → mesma saída, sem efeitos colaterais.
// =============================================================

// Formata um número como moeda brasileira (R$).
export function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// Converte "YYYY-MM-DD" em "DD/MM/YYYY".
export function formatarData(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

// Formata data e hora (ISO completo) em "DD/MM/YYYY HH:MM".
export function formatarDataHora(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Aplica a máscara de CPF (000.000.000-00) enquanto o usuário digita.
export function mascararCPF(valor) {
  return valor
    .replace(/\D/g, '') // remove tudo que não é dígito
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Aplica máscara simples de telefone: (00) 00000-0000.
export function mascararTelefone(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// Retorna a data de hoje no formato aceito pelo <input type="date"> (YYYY-MM-DD).
export function dataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Primeira letra maiúscula (ex.: "cliente" → "Cliente").
export function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
