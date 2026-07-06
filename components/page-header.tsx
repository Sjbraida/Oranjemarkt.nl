export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <h1 className="text-2xl font-bold text-foreground text-balance">{title}</h1>
      {subtitle ? <p className="text-sm text-muted-foreground text-pretty">{subtitle}</p> : null}
    </div>
  )
}
