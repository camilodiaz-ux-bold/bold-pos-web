import * as React from "react";
import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("pos-input resize-none", className)}
      {...props}
    />
  );
}

export { Textarea };
