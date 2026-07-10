import { cn, statusColor, statusLabel } from '@/lib/utils';

export function Badge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex rounded px-2 py-0.5 text-xs font-medium', statusColor(status))}>
      {statusLabel(status)}
    </span>
  );
}
