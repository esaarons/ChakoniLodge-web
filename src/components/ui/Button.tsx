import type { ComponentPropsWithoutRef } from "react";

type Variant = "solid" | "light" | "outline-light" | "outline" | "link" | "link-light";

const base =
  "inline-flex items-center justify-center gap-3 text-sm font-semibold tracking-wide transition-[color,background-color,border-color,transform] duration-500 ease-soft active:scale-[0.97] active:duration-100";

const variants: Record<Variant, string> = {
  solid: "min-h-12 rounded-full bg-forest px-7 text-ivory hover:bg-forest-deep",
  light: "min-h-12 rounded-full bg-ivory px-7 text-forest hover:bg-paper",
  outline: "min-h-12 rounded-full border border-forest/30 px-7 text-forest hover:border-forest hover:bg-forest hover:text-ivory",
  "outline-light":
    "min-h-12 rounded-full border border-ivory/50 px-7 text-ivory hover:border-ivory hover:bg-ivory hover:text-forest",
  link: "group/link py-2 text-forest",
  "link-light": "group/link py-2 text-ivory",
};

function Label({ children, variant }: { children: React.ReactNode; variant: Variant }) {
  if (variant !== "link" && variant !== "link-light") return <>{children}</>;
  return (
    <>
      <span className="underline decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-500 group-hover/link:decoration-transparent">
        {children}
      </span>
      <span aria-hidden="true" className="transition-transform duration-500 ease-soft group-hover/link:translate-x-1">
        →
      </span>
    </>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<"a"> & { variant?: Variant };

export function ButtonLink({ variant = "solid", className = "", children, ...props }: ButtonLinkProps) {
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      <Label variant={variant}>{children}</Label>
    </a>
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: Variant };

export function Button({ variant = "solid", className = "", children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>
      <Label variant={variant}>{children}</Label>
    </button>
  );
}
