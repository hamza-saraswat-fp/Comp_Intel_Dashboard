import type { Competitor } from "@/data"

const DOMAINS: Record<string, string> = {
  servicetitan: "servicetitan.com",
  "housecall-pro": "housecallpro.com",
  jobber: "getjobber.com",
}
const INITIALS: Record<string, string> = {
  fieldpulse: "FP",
  servicetitan: "ST",
  "housecall-pro": "HP",
  jobber: "JB",
}
const LOGO_TOKEN = "pk_D0FOaWqaQY2TXnfdJJzcsA"

export function LogoMark({ c, size = 22 }: { c: Competitor; size?: number }) {
  const style = { width: size, height: size }
  if (c.is_fieldpulse) {
    return (
      <span className="inline-flex shrink-0 overflow-hidden rounded-md bg-white" style={style}>
        <img src="/fp-icon.svg" alt="FieldPulse" className="h-full w-full object-cover" />
      </span>
    )
  }
  const url = `https://img.logo.dev/${DOMAINS[c.slug]}?token=${LOGO_TOKEN}&size=${size * 2}&format=png&retina=true`
  return (
    <span className="relative inline-flex shrink-0 overflow-hidden rounded-md bg-white" style={style}>
      <span className="absolute inset-0 z-0 flex items-center justify-center bg-[#e7e9f3] text-[9px] font-bold text-navy">
        {INITIALS[c.slug]}
      </span>
      <img
        src={url}
        alt={c.name}
        loading="lazy"
        className="relative z-10 h-full w-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
      />
    </span>
  )
}
