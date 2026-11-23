import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type Base = { id: string; label: string; error?: string; hint?: string; required?: boolean; className?: string };

function Wrap({ id, label, error, hint, required, className = "", children }: Base & { children: ReactNode }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? (
          <span className="text-bronze" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="meta">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({ id, label, error, hint, required, className, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <input id={id} name={id} className="input" required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </Wrap>
  );
}

export function TextArea({ id, label, error, hint, required, className, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <textarea id={id} name={id} className="input min-h-28 resize-y" required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} {...rest} />
    </Wrap>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  required,
  className,
  options,
  placeholder,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <Wrap id={id} label={label} error={error} hint={hint} required={required} className={className}>
      <select id={id} name={id} className="input" required={required} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} {...rest}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
