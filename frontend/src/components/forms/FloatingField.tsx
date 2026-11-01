import { Search } from "lucide-react";
import type { ReactNode } from "react";

export function FloatingField({
  id,
  label,
  children,
  className = "",
  suffix,
  searchIcon = true,
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
  suffix?: ReactNode;
  searchIcon?: boolean;
}) {
  return (
    <div className={`floating-group${className ? ` ${className}` : ""}`}>
      {searchIcon && <Search className="floating-group__search-icon" size={16} aria-hidden="true" />}
      {children}
      <label htmlFor={id}>{label}</label>
      {suffix}
    </div>
  );
}
