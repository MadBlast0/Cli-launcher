export function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          CLI Launcher
        </span>
        <div className="loader-track">
          <div className="loader-bar" />
        </div>
      </div>
    </div>
  )
}
