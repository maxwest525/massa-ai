import { Globe } from 'lucide-react'

export default function ScraperTab() {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center">
        <Globe size={32} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
        <h3 className="text-lg font-semibold mb-1">Web Scraper</h3>
        <p className="text-[13px] text-[var(--color-text-muted)]">Configurable scraping engine — coming in next release</p>
      </div>
    </div>
  )
}
