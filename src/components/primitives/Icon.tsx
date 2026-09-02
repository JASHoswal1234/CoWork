/**
 * Icon Component
 * 
 * Wrapper for Lucide icons with consistent styling
 */

import React from 'react';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Settings,
  TrendingUp,
  GraduationCap,
  LucideIcon
} from 'lucide-react';

export type IconName = 
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'painting'
  | 'cleaning'
  | 'repair'
  | 'demand-intelligence'
  | 'skill-intelligence';

const iconMap: Record<IconName, LucideIcon> = {
  plumbing: Wrench,
  electrical: Zap,
  carpentry: Hammer,
  painting: Paintbrush,
  cleaning: Sparkles,
  repair: Settings,
  'demand-intelligence': TrendingUp,
  'skill-intelligence': GraduationCap,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, className = '', strokeWidth = 1.5 }: IconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
