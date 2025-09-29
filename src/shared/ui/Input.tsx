import { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm focus:border-neutral-900 focus:bg-white focus:outline-none ${
        props.className ?? ""
      }`}
    />
  );
}
