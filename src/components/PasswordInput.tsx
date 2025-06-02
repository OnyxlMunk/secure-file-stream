
import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PasswordValidator, PasswordValidation } from '@/utils/passwordValidator';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  className?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter secure password",
  showStrength = true,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const validation: PasswordValidation = PasswordValidator.validate(value);

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="password" className="text-sm font-medium">
        Password
      </Label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Password Strength</span>
            <span className={cn(
              'font-medium',
              validation.score < 40 ? 'text-red-500' :
              validation.score < 70 ? 'text-yellow-500' :
              validation.score < 90 ? 'text-blue-500' : 'text-green-500'
            )}>
              {PasswordValidator.getStrengthLabel(validation.score)}
            </span>
          </div>
          
          <Progress
            value={validation.score}
            className="h-2"
          />
          
          {validation.errors.length > 0 && (
            <ul className="text-xs text-red-500 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
