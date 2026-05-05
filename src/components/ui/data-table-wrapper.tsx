import { Children, type ReactNode } from "react";
import { cx } from "@/lib/cx";

type DataTableWrapperProps = {
  title: string;
  description: string;
  columns: string[];
  children?: ReactNode;
  mobileCards?: ReactNode;
  emptyState?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  stickyHeader?: boolean;
  stickyHeaderOffsetClassName?: string;
};

export function DataTableWrapper({
  title,
  description,
  columns,
  children,
  mobileCards,
  emptyState,
  headerActions,
  footer,
  className,
  stickyHeader = false,
  stickyHeaderOffsetClassName = "top-0",
}: DataTableWrapperProps) {
  const hasMobileCards = Children.count(mobileCards) > 0;
  const stickyOffsetClassName =
    stickyHeaderOffsetClassName === "top-16" ? "top-16" : "top-0";

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
        {headerActions ? (
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
            {headerActions}
          </div>
        ) : null}
      </div>

      {hasMobileCards ? (
        <div className="space-y-3 p-4 md:hidden">{mobileCards}</div>
      ) : null}

      <div className={cx("app-scrollbar overflow-x-auto", hasMobileCards ? "hidden md:block" : "")}>
        <table className="min-w-full border-collapse">
          <thead
            className={cx(
              "bg-surface-muted",
              stickyHeader && "sticky z-10",
              stickyHeader && stickyOffsetClassName,
            )}
          >
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
