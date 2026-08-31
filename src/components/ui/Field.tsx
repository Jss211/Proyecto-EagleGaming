import { forwardRef, type InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, ...inputProps }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="field">
        <label htmlFor={fieldId} className="field__label">
          {label}
        </label>
        <input
          id={fieldId}
          ref={ref}
          className="field__input"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...inputProps}
        />
        {error && (
          <p id={`${fieldId}-error`} className="field__error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";
