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
            "block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 " +
            "placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-0 " +
            (errorText ? "border-red-500 focus:border-red-500 " : "") +
            className
          }
          {...props}
        />
        {errorText && <p className="mt-1 text-xs text-red-600">{errorText}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
