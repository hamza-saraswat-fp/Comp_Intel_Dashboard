// Full-screen boot state shown while the dashboard fetches its data from Supabase,
// and the fallback if that fetch fails. Rendered by main.tsx before <App />.
export function Splash({ label, detail, error }: { label: string; detail?: string; error?: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <div className={`text-[15px] font-bold tracking-[-0.01em] ${error ? "text-red-700" : "text-[#00034D]"}`}>
          {label}
        </div>
        {detail && <div className="mt-2 max-w-[46ch] text-[12.5px] font-medium text-muted-foreground">{detail}</div>}
      </div>
    </div>
  )
}
