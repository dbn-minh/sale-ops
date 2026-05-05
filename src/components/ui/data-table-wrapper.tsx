import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type DataTableWrapperProps = {
  title: string;
  description: string;
  columns: string[];
  children?: ReactNode;
  emptyState?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function DataTableWrapper({
  title,
  description,
  columns,
  children,
  emptyState,
  headerActions,
  footer,
  className,
}: DataTableWrapperProps) {
  return (
    <section className={cx("app-panel overflow-hidden", className)}>
      <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-6 text-muted">
            {description}
          </p>
        </div>
        {headerActions ? <div className="flex items-center gap-3">{headerActions}</div> : null}
      </div>

      <div className="app-scrollbar overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {children ? (
              children
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState ?? (
                    <div className="px-6 py-10 text-sm text-muted">
                      No records available yet.
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {footer ? <div className="border-t border-line px-5 py-3 text-[12px] text-muted sm:px-6">{footer}</div> : null}
    </section>
  );
}
