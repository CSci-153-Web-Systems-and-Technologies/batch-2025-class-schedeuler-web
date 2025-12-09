interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string | number;
  max?: string | number;
  description?: string;
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  description
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border-2 outline-none transition-colors duration-200"
        style={{ backgroundColor: "#78AFE9", borderColor: "#4169E1", color: "white" }}
        onFocus={(e) => e.target.style.borderColor = "#3151B0"}
        onBlur={(e) => e.target.style.borderColor = "#4169E1"}
      />
      {description && (
        <p className="text-xs mt-1 text-[#4169E1]">
          {description}
        </p>
      )}
    </div>
  );
}