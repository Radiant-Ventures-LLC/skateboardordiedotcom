import type { ButtonHTMLAttributes } from "react";

// A <button> styled like LinkButton and the waitlist submit. Used instead of
// skateAF's <Button>, which renders with the wrong font and text color inside
// the app for now (logged in Notion).
type Variant = "flag" | "outline";
type Size = "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  flag: "bg-flag text-paper hover:bg-flag-600",
  outline: "bg-paper text-ink hover:bg-concrete-50",
};

// Padding is forced with `!` because skateAF's unlayered reset currently
// zeroes button padding (Notion: "Spacing and padding utilities lose to
// skateAF's reset"). Drop the `!` once that's fixed.
const SIZES: Record<Size, string> = {
  md: "text-body px-6! py-2!",
  lg: "text-lede px-10! py-4!",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

export function ActionButton({
  variant = "flag",
  size = "md",
  block = false,
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      {...props}
      className={[
        "inline-flex items-center justify-center border-2 border-void font-display font-semibold uppercase tracking-slogan shadow-hard",
        "transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        block ? "w-full" : "",
        className,
      ].join(" ")}
    />
  );
}
