export function WhatsNew() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-[27px] font-bold tracking-[-0.03em]">What's new</h1>
        <p className="mt-2.5 max-w-[72ch] text-[13.5px] font-medium text-muted-foreground">
          Competitor AI moves, newest first. Significant launches will wear the accent; routine updates stay quiet.
        </p>
      </header>
      <div className="reveal max-w-[620px] rounded-xl border border-dashed bg-card px-8 py-12 text-center">
        <div className="mx-auto mb-4 h-2.5 w-2.5 rounded-full bg-live shadow-[0_0_0_5px_rgba(23,147,106,0.14)]" />
        <h3 className="mb-2 text-[15px] font-bold">Monitoring is live</h3>
        <p className="mx-auto max-w-[46ch] text-[13px] font-medium leading-[1.6] text-muted-foreground">
          No competitor AI moves have been flagged yet. When the monitor detects a change on a competitor&rsquo;s site, it lands here with its date, capability, and source.
        </p>
      </div>
    </div>
  )
}
