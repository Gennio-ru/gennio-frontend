import { forwardRef, TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  errorText?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", errorText, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={
            "block w-full rounded-field bg-base-200 px-3 py-2 text-sm text-base-content " +
            "placeholder:text-base-content/50 focus:border-primary focus:outline-none focus:ring-0 " +
            (errorText ? "border-error focus:border-error " : "") +
            className
          }
          {...props}
        />
        {errorText && <p className="mt-1 text-xs text-error">{errorText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
