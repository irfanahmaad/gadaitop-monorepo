import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

function Input({
  className,
  type,
  icon,
  ...props
}: React.ComponentProps<"input"> & { icon?: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="absolute left-0 top-1/2 aspect-square -translate-y-1/2 text-muted-foreground/60 h-full border-r border-input flex items-center justify-center">
        {icon}
      </div>

      <input
        type={type}
        data-slot="input"
        className={cn(
          "!pl-16 lg:pl-16",
          "file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring/30 focus-visible:ring-ring/20 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
