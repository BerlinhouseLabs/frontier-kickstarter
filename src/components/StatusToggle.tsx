interface StatusToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function StatusToggle({
  checked,
  onChange,
  label = "Show Revoked",
}: StatusToggleProps) {
  const trackStyles = `
    relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full 
    border-2 border-transparent transition-colors duration-200 ease-in-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 
    focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900
    ${checked ? "bg-primary-600" : "bg-surface-700"}
  `;

  const thumbStyles = `
    pointer-events-none inline-block h-5 w-5 transform rounded-full 
    bg-white shadow-lg ring-0 transition duration-200 ease-in-out
    ${checked ? "translate-x-5" : "translate-x-0"}
  `;

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={trackStyles}
      >
        <span className={thumbStyles} />
      </button>
      <span className="text-sm text-surface-200">{label}</span>
    </label>
  );
}
