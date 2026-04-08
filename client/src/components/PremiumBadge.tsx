import React from 'react';
import { Crown, Lock } from 'lucide-react';

interface PremiumBadgeProps {
  isPremium?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PremiumBadge({ isPremium = false, size = 'md', showText = true }: PremiumBadgeProps) {
  if (!isPremium) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center gap-1">
      <Crown className={`${sizeClasses[size]} text-yellow-400`} fill="currentColor" />
      {showText && (
        <span className={`${textSizeClasses[size]} font-semibold text-yellow-400`}>
          Premium
        </span>
      )}
    </div>
  );
}

interface FeatureLockProps {
  locked?: boolean;
  message?: string;
}

export function FeatureLock({ locked = false, message = 'Premium feature' }: FeatureLockProps) {
  if (!locked) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Lock className="w-8 h-8 text-yellow-400" />
        <div className="text-sm font-semibold text-yellow-400">{message}</div>
        <div className="text-xs text-gray-400">Upgrade to Pro to unlock</div>
      </div>
    </div>
  );
}
