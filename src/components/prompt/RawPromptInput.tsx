import { Sparkles } from 'lucide-react';
import { useProject } from '../../hooks/useProject';

export function RawPromptInput() {
  const { rawPrompt, setRawPrompt, promptStatus } = useProject();
  const disabled = promptStatus === 'enhancing' || promptStatus === 'planning';

  return (
    <div className="relative">
      <div className="absolute top-3 left-4 flex items-center gap-2 text-masa-text-muted pointer-events-none">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Raw Input</span>
      </div>
      <textarea
        value={rawPrompt}
        onChange={(e) => setRawPrompt(e.target.value)}
        disabled={disabled}
        placeholder="Describe what you want to build... Be as messy as you want. MASA AI will turn it into the perfect prompt."
        className="w-full min-h-[140px] pt-10 pb-4 px-4 bg-masa-card border border-masa-border rounded-xl text-masa-text placeholder:text-masa-text-muted/60 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:border-masa-accent/50 focus:ring-1 focus:ring-masa-accent/20 transition-all disabled:opacity-50"
      />
    </div>
  );
}
