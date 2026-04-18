import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "default", size = "md", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-transparent text-sm font-semibold transition-[transform,colors,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 dark:focus-visible:ring-offset-[var(--color-bento-dark)]",
          variant === "default" &&
            "border-[color:var(--color-ink)] bg-[var(--color-accent)] text-white shadow-[4px_4px_0_0_var(--color-ink)] hover:translate-y-[2px] hover:bg-[var(--color-accent-hover)] hover:shadow-[2px_2px_0_0_var(--color-ink)] active:translate-y-[3px] active:shadow-[1px_1px_0_0_var(--color-ink)] dark:border-stone-100 dark:shadow-[4px_4px_0_0_rgb(244_240_234/0.85)] dark:hover:shadow-[2px_2px_0_0_rgb(244_240_234/0.85)] dark:active:shadow-[1px_1px_0_0_rgb(244_240_234/0.85)]",
          variant === "outline" &&
            "border-[color:var(--color-ink)] bg-[var(--color-bento)] text-[var(--color-ink)] shadow-[3px_3px_0_0_var(--color-ink)] hover:translate-y-[2px] hover:bg-[var(--color-accent-soft)] hover:shadow-[1px_1px_0_0_var(--color-ink)] active:translate-y-[3px] active:shadow-none dark:border-stone-200 dark:bg-stone-900 dark:text-stone-50 dark:shadow-[3px_3px_0_0_rgb(244_240_234/0.5)] dark:hover:bg-stone-800 dark:hover:shadow-[1px_1px_0_0_rgb(244_240_234/0.5)] dark:active:shadow-none",
          variant === "ghost" &&
            "border-transparent bg-transparent text-[var(--color-ink)] hover:translate-y-px hover:bg-black/5 dark:text-stone-100 dark:hover:bg-white/10",
          variant === "destructive" &&
            "border-[color:var(--color-ink)] bg-red-700 text-white shadow-[3px_3px_0_0_var(--color-ink)] hover:translate-y-[2px] hover:bg-red-800 hover:shadow-[1px_1px_0_0_var(--color-ink)] active:translate-y-[3px] active:shadow-none dark:border-stone-100 dark:shadow-[3px_3px_0_0_rgb(244_240_234/0.85)] dark:hover:shadow-[1px_1px_0_0_rgb(244_240_234/0.85)] dark:active:shadow-none",
          size === "sm" && "h-9 px-3 text-xs",
          size === "md" && "h-11 px-4 py-2",
          size === "lg" && "h-12 px-6 text-base",
          size === "icon" && "h-11 w-11",
          className
        )}
        {...props}
      />
    );
  }
);
