import Link from 'next/link';

interface PlaceholderProps {
  title: string;
  description: string;
}

export function ComingSoonPage({ title, description }: PlaceholderProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm sm:text-base text-[color:var(--color-text-muted)] mb-6 sm:mb-8">{description}</p>

      <div className="glass-panel p-6 sm:p-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs mb-4">
          Coming soon
        </div>
        <p className="text-[color:var(--color-text-secondary)]">
          This module is under construction. Head back to the{' '}
          <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
            dashboard
          </Link>{' '}
          for now.
        </p>
      </div>
    </div>
  );
}
