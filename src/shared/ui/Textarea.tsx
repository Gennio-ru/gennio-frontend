import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  errored?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", errored, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "block w-full rounded-field bg-base-200 px-3 py-2 text-base text-base-content",
            "placeholder:text-base-content/60 focus:border-primary focus:outline-none focus:ring-0",
            errored && "border-b border-b-[var(--color-error)]!",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
