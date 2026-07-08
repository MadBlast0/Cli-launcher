import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search CLIs…',
}: SearchInputProps) {
  return (
    <div className="mac-input flex items-center gap-2 px-3 py-2">
      <Search size={15} className="text-muted-foreground shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-foreground text-[13px] font-[450] outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
