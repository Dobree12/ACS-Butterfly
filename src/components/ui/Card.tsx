import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export default function Card({ children, className, style }: Props) {
  return (
    <div className={`card${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </div>
  );
}
