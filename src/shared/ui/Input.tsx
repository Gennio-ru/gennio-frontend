import { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-field bg-base-200 text-base-content 
        px-3 text-sm 
          focus:outline-none
        appearance-none
        ${props.className ?? ""}`}
    />
  );
}
