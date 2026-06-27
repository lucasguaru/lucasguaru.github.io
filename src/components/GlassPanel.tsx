import { HTMLAttributes, ReactNode } from 'react';

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassPanel({ children, className = '', ...props }: GlassPanelProps) {
  return (
    <div className={`glass-panel ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
