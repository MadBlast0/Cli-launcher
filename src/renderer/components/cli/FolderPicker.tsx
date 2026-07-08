import { useState, useEffect } from 'react'
import { FolderIcon } from 'lucide-react'

interface FolderPickerProps {
  onFolderChange: (folder: string | null) => void
}

export function FolderPicker({ onFolderChange }: FolderPickerProps) {
  const [folder, setFolder] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.getSavedFolder().then(setFolder)
  }, [])

  const handlePick = async () => {
    const result = await window.electronAPI.selectFolder()
    if (result) {
      setFolder(result)
      onFolderChange(result)
    }
  }

  return (
    <button
      className="mac-input w-full flex items-center gap-2.5 px-3 py-2.5 text-left group hover:border-border-strong transition-colors"
      onClick={handlePick}
    >
      <span className="flex items-center justify-center w-6 h-6 rounded-none bg-muted text-muted-foreground shrink-0 group-hover:text-foreground transition-colors">
        <FolderIcon size={13} />
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-medium tracking-wide text-muted-foreground">
          Working directory
        </span>
        <span className={`text-[12px] font-mono truncate ${folder ? 'text-foreground' : 'text-muted-foreground'}`}>
          {folder || 'Select a folder…'}
        </span>
      </div>
    </button>
  )
}
