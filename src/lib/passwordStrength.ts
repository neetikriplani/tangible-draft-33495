// Password strength calculation utility

export type PasswordStrength = 'low' | 'medium' | 'high';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;

  if (password.length < 8) {
    feedback.push("Use at least 8 characters");
  }

  // Uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Lowercase letters
  if (/[a-z]/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Numbers
  if (/\d/.test(password)) {
    score += 15;
  } else {
    feedback.push("Add numbers");
  }

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 20;
  } else {
    feedback.push("Add special characters");
  }

  // Determine strength
  let strength: PasswordStrength;
  if (score >= 80) {
    strength = 'high';
    if (feedback.length === 0) {
      feedback.push("Strong password!");
    }
  } else if (score >= 50) {
    strength = 'medium';
  } else {
    strength = 'low';
  }

  return { strength, score, feedback };
}
