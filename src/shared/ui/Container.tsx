import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  maxWidth?: string; // например "1000px" или "1200px"
}

export default function Container({ children, className = "" }: Props) {
  return (
    <div className={`mx-auto w-full px-4 max-w-5xl ${className}`}>
      {children}
    </div>
  );
}
