type EmptyStateProps = {
  title: string;
  description: string;
  hint?: string;
};

export function EmptyState({
  title,
  description,
  hint,
}: EmptyStateProps) {
  return (
    <div className="m-5 rounded-xl border border-dashed border-line bg-surface-muted px-6 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-sm font-semibold text-brand">
        SO
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-foreground">{title}</h3>
      <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted">{description}</p>
      {hint ? <p className="mt-4 text-[13px] font-medium text-foreground">{hint}</p> : null}
    </div>
  );
}
