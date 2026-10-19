import type { CourtId } from "./schemas";
import { COURTS } from "./schemas";
import { Building2 } from "lucide-react";

interface CourtSelectorProps {
  value: CourtId;
  onChange: (court: CourtId) => void;
  disabled?: boolean;
  className?: string;
}

export default function CourtSelector({
  value,
  onChange,
  disabled = false,
  className,
}: CourtSelectorProps) {
  return (
    <div className={`deadline-field flex flex-col gap-1.5 ${className || ""}`}>
      <label
        htmlFor="deadline-court"
        className="text-xs font-semibold text-foreground flex items-center gap-1.5"
      >
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <span>Comarca / Jurisdição</span>
      </label>
      <select
        id="deadline-court"
        value={value}
        onChange={(event) => onChange(event.target.value as CourtId)}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {COURTS.map((court) => (
          <option key={court.id} value={court.id}>
            {court.label} ({court.state})
          </option>
        ))}
      </select>
    </div>
  );
}

