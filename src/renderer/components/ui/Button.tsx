import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: ReactNode
  loading?: boolean
}

const variantStyles = {
  primary: 'mac-btn-primary',
  secondary: 'mac-btn-soft',
  destructive: 'bg-destructive/12 text-destructive border border-destructive/25 hover:bg-destructive/20',
  ghost: 'bg-transparent text-foreground hover:bg-accent-soft',
}

const sizeStyles = {
  xs: 'text-[11px] px-2 py-1.5 gap-1.5',
  sm: 'text-[12px] px-3 py-1.5 gap-1.5',
  md: 'text-[13px] px-4 py-2 gap-2',
  lg: 'text-[14px] px-5 py-2.5 gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`mac-btn inline-flex items-center justify-center font-semibold rounded-[3px] whitespace-nowrap
        ${variantStyles[variant]} ${sizeStyles[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="inline-flex w-4 h-4 items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
