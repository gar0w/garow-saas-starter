import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  text?: string;
  variant?: "default" | "danger";
};

export function IconButton({
  icon,
  label,
  text,
  variant = "default",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={props.type ?? "button"}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "danger"
          ? "border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-800 focus-visible:ring-red-500"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-950 focus-visible:ring-gray-400"
      } ${className}`}
    >
      {icon}
      {text && <span>{text}</span>}
    </button>
  );
}
