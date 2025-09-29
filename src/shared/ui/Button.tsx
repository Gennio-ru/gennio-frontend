import { ButtonHTMLAttributes } from "react";

export default function Button({
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`h-10 rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white hover:bg-neutral-950 disabled:opacity-70 ${
        className ?? ""
      }`}
    />
  );
}
