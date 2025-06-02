
export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
}

export class PasswordValidator {
  static readonly MIN_LENGTH = 12;
  static readonly REQUIRED_PATTERNS = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    numbers: /[0-9]/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  };

  static validate(password: string): PasswordValidation {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += 25;
    }

    // Pattern checks
    if (!this.REQUIRED_PATTERNS.uppercase.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 15;
    }

    if (!this.REQUIRED_PATTERNS.lowercase.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 15;
    }

    if (!this.REQUIRED_PATTERNS.numbers.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 15;
    }

    if (!this.REQUIRED_PATTERNS.special.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 15;
    }

    // Repetition check
    if (/(.)\1{3,}/.test(password)) {
      errors.push('Password cannot contain more than 3 consecutive identical characters');
      score -= 10;
    } else {
      score += 15;
    }

    return {
      isValid: errors.length === 0,
      score: Math.max(0, Math.min(100, score)),
      errors,
    };
  }

  static getStrengthLabel(score: number): string {
    if (score < 40) return 'Weak';
    if (score < 70) return 'Fair';
    if (score < 90) return 'Good';
    return 'Strong';
  }

  static getStrengthColor(score: number): string {
    if (score < 40) return 'bg-red-500';
    if (score < 70) return 'bg-yellow-500';
    if (score < 90) return 'bg-blue-500';
    return 'bg-green-500';
  }
}
