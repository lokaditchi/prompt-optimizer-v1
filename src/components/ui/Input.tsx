/**
 * Input — Text input / textarea with label, helper text, and error state.
 *
 * Supports an icon prefix, auto-resizing textarea, and focus/error animations.
 */

import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import './Input.css';

type SharedInputProps = {
  /** Visible label text. */
  label?: string;
  /** Helper text rendered below the input. */
  helperText?: string;
  /** Error message — triggers error styling when set. */
  error?: string;
  /** Leading icon element. */
  icon?: ReactNode;
  /** Render as input or textarea. */
  as?: 'input' | 'textarea';
  /** Enable auto-resize for textarea. */
  autoResize?: boolean;
};

type InputFieldProps = SharedInputProps &
  (
    | ({ as?: 'input' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>)
    | ({ as: 'textarea' } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>)
  );

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputFieldProps>(
  (
    {
      label,
      helperText,
      error,
      icon,
      as = 'input',
      autoResize = false,
      className = '',
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = `input-${generatedId}`;
    const helperId = `helper-${generatedId}`;
    const errorId = `error-${generatedId}`;

    const [focused, setFocused] = useState(false);
    const internalRef = useRef<HTMLTextAreaElement>(null);

    const handleAutoResize = useCallback((el: HTMLTextAreaElement | null) => {
      if (el && autoResize) {
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight}px`;
      }
    }, [autoResize]);

    const rootClasses = [
      'input-field',
      focused && 'input-field--focused',
      error && 'input-field--error',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const controlClasses = [
      'input-field__control',
      icon && 'input-field__control--has-icon',
      as === 'textarea' && 'input-field__control--textarea',
      as === 'textarea' && autoResize && 'input-field__control--textarea-autoresize',
    ]
      .filter(Boolean)
      .join(' ');

    const describedBy = [
      helperText ? helperId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(true);
      if (as === 'input') {
        (onFocus as InputHTMLAttributes<HTMLInputElement>['onFocus'])?.(e as React.FocusEvent<HTMLInputElement>);
      } else {
        (onFocus as TextareaHTMLAttributes<HTMLTextAreaElement>['onFocus'])?.(e as React.FocusEvent<HTMLTextAreaElement>);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false);
      if (as === 'input') {
        (onBlur as InputHTMLAttributes<HTMLInputElement>['onBlur'])?.(e as React.FocusEvent<HTMLInputElement>);
      } else {
        (onBlur as TextareaHTMLAttributes<HTMLTextAreaElement>['onBlur'])?.(e as React.FocusEvent<HTMLTextAreaElement>);
      }
    };

    const sharedProps = {
      id: inputId,
      className: controlClasses,
      'aria-label': label || (rest as Record<string, unknown>)['aria-label'] as string | undefined,
      'aria-invalid': !!error,
      'aria-describedby': describedBy,
      onFocus: handleFocus,
      onBlur: handleBlur,
    };

    return (
      <div className={rootClasses}>
        {label && (
          <label className="input-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}

        <div className="input-field__wrapper">
          {icon && <span className="input-field__icon" aria-hidden="true">{icon}</span>}

          {as === 'textarea' ? (
            <textarea
              {...sharedProps}
              {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
              ref={(el) => {
                // Forward ref
                if (typeof ref === 'function') ref(el);
                else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
                handleAutoResize(el);
              }}
              onInput={(e) => {
                handleAutoResize(e.currentTarget);
                (rest as TextareaHTMLAttributes<HTMLTextAreaElement>).onInput?.(e);
              }}
            />
          ) : (
            <input
              {...sharedProps}
              {...(rest as InputHTMLAttributes<HTMLInputElement>)}
              ref={ref as React.Ref<HTMLInputElement>}
            />
          )}
        </div>

        {error && (
          <p id={errorId} className="input-field__error" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="input-field__helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputFieldProps };
