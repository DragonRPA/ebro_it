import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id
}) => {
  const inputId = id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <label 
      htmlFor={inputId} 
      className={`toggle-switch-container ${disabled ? 'disabled' : ''}`}
    >
      <div className="toggle-switch">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="toggle-switch-slider"></span>
      </div>
      {label && <span className="toggle-switch-label">{label}</span>}
    </label>
  );
};
