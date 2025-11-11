import { cn } from "@/lib/utils";
import { forwardRef, TextareaHTMLAttributes, useEffect, useState } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  errored?: boolean;
  errorMessage?: string;
  showLimit?: boolean;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = "",
      errored,
      errorMessage,
      maxLength,
      showLimit = true,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [length, setLength] = useState(
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
        ? defaultValue.length
        : 0
    );

    useEffect(() => {
      if (typeof value === "string") {
        setLength(value.length);
      }
    }, [value]);

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      setLength(e.target.value.length);
      onChange?.(e);
    };

    const hasError = errored || !!errorMessage;

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={cn(
            "block w-full rounded-field bg-base-200 px-3 py-2 text-base text-base-content",
            "placeholder:text-base-content/60 focus:border-primary focus:outline-none focus:ring-0",
            hasError && "border-b border-b-[var(--color-error)]!",
            className
          )}
          {...props}
        />

        {(maxLength && showLimit) || errorMessage ? (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span
              className={cn(
                "text-error",
                !errorMessage && "invisible" // чтобы счётчик не прыгал
              )}
            >
              {errorMessage}
            </span>

            {maxLength && showLimit && (
              <span
                className={cn(
                  "text-base-content/60",
                  length >= maxLength && "text-error"
                )}
              >
                {length}/{maxLength}
              </span>
            )}
          </div>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
