/**
 * Button — Premium button component with variants, sizes, and micro-interactions.
 *
 * Supports primary (cyan gradient), secondary (outlined), ghost, and danger variants.
 * Includes loading spinner state, icon placement, and motion animations.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual variant. */
  variant?: ButtonVariant;
  /** Size preset. */
  size?: ButtonSize;
  /** Show a loading spinner and disable interaction. */
  loading?: boolean;
  /** Optional icon element. */
  icon?: ReactNode;
  /** Icon placement relative to label text. */
  iconPosition?: 'left' | 'right';
  /** Stretch to fill container width. */
  fullWidth?: boolean;
  /** Button label content. */
  children?: ReactNode;
}

const hoverScale = 1.025;
const tapScale = 0.975;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      'button',
      `button--${variant}`,
      `button--${size}`,
      fullWidth && 'button--full-width',
      loading && 'button--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const iconNode = icon ? (
      <span className={`button__icon button__icon--${size}`}>{icon}</span>
    ) : null;

    // Spinner sizes mapped to button size
    const spinnerSize = { sm: 14, md: 16, lg: 18 }[size];

    return (
      <motion.button
        ref={ref}
        id={id}
        className={classes}
        disabled={disabled || loading}
        whileHover={disabled || loading ? undefined : { scale: hoverScale, y: -1 }}
        whileTap={disabled || loading ? undefined : { scale: tapScale }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        {...(rest as Omit<HTMLMotionProps<'button'>, 'ref'>)}
      >
        {loading && (
          <span className="button__spinner" aria-hidden="true">
            <Loader2 size={spinnerSize} />
          </span>
        )}
        <span className="button__content">
          {iconPosition === 'left' && iconNode}
          {children}
          {iconPosition === 'right' && iconNode}
        </span>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
