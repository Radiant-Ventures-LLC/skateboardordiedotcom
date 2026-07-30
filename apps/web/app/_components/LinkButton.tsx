import Link from "next/link";
import type { ComponentProps } from "react";

// A next/link styled like a skateAF Button. Server-safe (no hooks), so it
// can live in Server Components — the design-system <Button> renders a
// <button>, which isn't right for navigation.
type Variant = "flag" | "gold" | "outline";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  flag: "bg-flag text-paper border-void shadow-hard hover:bg-flag-600",
  gold: "bg-gold text-void border-void shadow-hard hover:bg-gold-600",
  outline: "bg-paper text-ink border-void shadow-hard hover:bg-concrete-50",
};

const SIZES: Record<Size, string> = {
  md: "text-body px-6 py-2 gap-2",
  lg: "text-lede px-10 py-4 gap-2",
};

type Props = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function LinkButton({
  variant = "flag",
  size = "md",
  className = "",
  ...props
}: Props) {
  return (
    <Link
      {...props}
      className={[
        "inline-flex items-center justify-center border-2 font-display font-semibold uppercase tracking-slogan",
        "transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
    />
  );
}
