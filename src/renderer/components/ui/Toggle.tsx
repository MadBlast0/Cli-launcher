interface ToggleProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  label?: string
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`relative w-11 h-6 rounded-[3px] border border-border transition-colors duration-200
          ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-[2px] bg-primary-foreground shadow-sm transition-transform duration-200
            ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
        />
      </button>
      {label && (
        <span className="text-[13px] font-medium text-foreground">{label}</span>
      )}
    </label>
  )
}
