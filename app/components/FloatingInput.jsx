"use client";

/**
 * Floating label input field with glassmorphic backdrop blur.
 */
export default function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  id,
  maxLength,
  inputMode,
  autoFocus = false,
  disabled = false,
  className = "",
}) {
  return (
    <div className={`float-label ${className}`} suppressHydrationWarning>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={label}
        maxLength={maxLength}
        inputMode={inputMode}
        autoFocus={autoFocus}
        disabled={disabled}
        autoComplete="off"
        className="neo-input"
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
