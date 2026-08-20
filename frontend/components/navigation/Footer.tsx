type FooterProps = {
  tone?: "light" | "dark";
};

export function Footer({ tone = "light" }: FooterProps) {
  const dark = tone === "dark";

  return (
    <footer
      className={dark
        ? "border-t border-zinc-800 px-6 py-5 text-sm text-zinc-500"
        : "border-t border-gray-200 px-6 py-5 text-sm text-gray-500"}
    >
      <div className="mx-auto max-w-6xl">
        Simple project management for focused teams.
      </div>
    </footer>
  );
}
