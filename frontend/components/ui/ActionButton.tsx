import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
};

const variants = {
  primary: "bg-gray-950 text-white hover:bg-gray-800 focus-visible:ring-gray-950",
  secondary: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-400",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 focus-visible:ring-red-500",
};

export function ActionButton({
  icon,
  children,
  variant = "secondary",
  className = "",
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
