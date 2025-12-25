import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import { buttonHover, buttonTap } from "../lib/animations";

type ButtonVariant = "primary" | "secondary" | "danger" | "danger-solid" | "ghost";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25",
  secondary: "bg-surface-700/50 hover:bg-surface-700 text-surface-100",
  danger: "bg-danger/10 hover:bg-danger/20 text-danger",
  "danger-solid": "bg-danger hover:bg-danger/90 text-white shadow-lg shadow-danger/25",
  ghost: "hover:bg-surface-700/50 text-surface-400 hover:text-surface-200",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      loading,
      icon,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "flex items-center justify-center gap-2 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    const sizeStyles = children ? "px-4 py-2.5" : "p-2";

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled ? buttonHover : undefined}
        whileTap={!disabled ? buttonTap : undefined}
        className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
