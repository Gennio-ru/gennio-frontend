import { ButtonHTMLAttributes } from "react";

export default function Button({
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`h-10 rounded-field bg-primary px-4 text-sm font-medium text-white hover:bg-primary/80 disabled:opacity-70 cursor-pointer ${
        className ?? ""
      }`}
    />
  );
}
