/**
 * Utility functions for Date of Birth & Age validation (18+ requirement).
 */

export interface AgeValidationResult {
  valid: boolean;
  age: number;
  isAdult: boolean;
  message: string;
  formattedDate: string;
}

export function calculateAge(birthDateString: string): AgeValidationResult {
  if (!birthDateString || birthDateString.trim() === '') {
    return {
      valid: false,
      age: 0,
      isAdult: false,
      message: 'Por favor, selecione a sua data de nascimento.',
      formattedDate: ''
    };
  }

  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) {
    return {
      valid: false,
      age: 0,
      isAdult: false,
      message: 'Data de nascimento inválida.',
      formattedDate: ''
    };
  }

  const today = new Date();
  
  if (birthDate > today) {
    return {
      valid: false,
      age: 0,
      isAdult: false,
      message: 'A data de nascimento não pode ser no futuro.',
      formattedDate: ''
    };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age > 120) {
    return {
      valid: false,
      age,
      isAdult: false,
      message: 'Por favor verifique o ano de nascimento introduzido.',
      formattedDate: ''
    };
  }

  const formattedDate = birthDate.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const isAdult = age >= 18;

  return {
    valid: isAdult,
    age,
    isAdult,
    message: isAdult 
      ? `Idade comprovada: ${age} anos (Maior de 18 anos ✓)`
      : `Idade calculada: ${age} anos. É obrigatório ter pelo menos 18 anos para se cadastrar e investir.`,
    formattedDate
  };
}

/**
 * Returns the maximum date string (YYYY-MM-DD) allowed for an 18+ adult.
 */
export function getMax18YearsAgoDateString(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
}
