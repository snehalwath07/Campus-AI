import React from 'react';

interface PasswordStrengthProps {
  password?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  if (!password) return null;

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);

  const getLabel = () => {
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Weak Password', color: 'bg-red-500', textColor: 'text-red-400' };
      case 2:
        return { text: 'Moderate Password', color: 'bg-amber-500', textColor: 'text-amber-400' };
      case 3:
      case 4:
        return { text: 'Strong Password', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
      default:
        return { text: 'Weak Password', color: 'bg-red-500', textColor: 'text-red-400' };
    }
  };

  const labelInfo = getLabel();

  return (
    <div className="w-full flex flex-col gap-1.5 mt-1 text-left">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-zinc-400">Security Index:</span>
        <span className={labelInfo.textColor}>{labelInfo.text}</span>
      </div>
      <div className="h-1 w-full bg-zinc-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${labelInfo.color}`}
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>
      <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-2.5 gap-y-0.5 leading-tight">
        <span className={password.length >= 8 ? 'text-emerald-500 font-medium' : ''}>• 8+ chars</span>
        <span className={/[A-Z]/.test(password) ? 'text-emerald-500 font-medium' : ''}>• A-Z uppercase</span>
        <span className={/[0-9]/.test(password) ? 'text-emerald-500 font-medium' : ''}>• 0-9 number</span>
        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-500 font-medium' : ''}>• Special char</span>
      </div>
    </div>
  );
};

export default PasswordStrength;
