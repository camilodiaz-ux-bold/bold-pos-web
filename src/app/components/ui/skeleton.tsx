import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-[var(--radius-8)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
