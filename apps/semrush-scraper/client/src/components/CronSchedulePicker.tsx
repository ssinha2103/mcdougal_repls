import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface CronSchedulePickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CRON_PRESETS = [
  {
    label: "Daily at 2 AM",
    value: "0 2 * * *",
    description: "Runs every day at 2:00 AM",
  },
  {
    label: "Daily at 6 AM",
    value: "0 6 * * *",
    description: "Runs every day at 6:00 AM",
  },
  {
    label: "Twice Daily (2 AM & 2 PM)",
    value: "0 2,14 * * *",
    description: "Runs at 2:00 AM and 2:00 PM every day",
  },
  {
    label: "Every 6 Hours",
    value: "0 */6 * * *",
    description: "Runs every 6 hours (12 AM, 6 AM, 12 PM, 6 PM)",
  },
  {
    label: "Weekly on Monday at 2 AM",
    value: "0 2 * * 1",
    description: "Runs every Monday at 2:00 AM",
  },
  {
    label: "Monthly on 1st at 2 AM",
    value: "0 2 1 * *",
    description: "Runs on the 1st of every month at 2:00 AM",
  },
  {
    label: "Custom",
    value: "custom",
    description: "Enter your own cron expression",
  },
];

export function CronSchedulePicker({ value, onChange, error }: CronSchedulePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [customValue, setCustomValue] = useState<string>(value);

  useEffect(() => {
    const preset = CRON_PRESETS.find((p) => p.value === value);
    if (preset && preset.value !== "custom") {
      setSelectedPreset(preset.value);
      setCustomValue(value);
    } else {
      setSelectedPreset("custom");
      setCustomValue(value);
    }
  }, [value]);

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    if (presetValue !== "custom") {
      setCustomValue(presetValue);
      onChange(presetValue);
    }
  };

  const handleCustomChange = (newValue: string) => {
    setCustomValue(newValue);
    onChange(newValue);
  };

  const getCurrentDescription = () => {
    const preset = CRON_PRESETS.find((p) => p.value === value);
    if (preset && preset.value !== "custom") {
      return preset.description;
    }

    if (!value || value.trim() === "") {
      return "Enter a cron expression";
    }

    return parseCronExpression(value);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="cron-preset" data-testid="label-cron-preset">
          Schedule Preset
        </Label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger id="cron-preset" data-testid="select-cron-preset">
            <SelectValue placeholder="Select a preset" />
          </SelectTrigger>
          <SelectContent>
            {CRON_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPreset === "custom" && (
        <div>
          <Label htmlFor="cron-expression" data-testid="label-cron-expression">
            Cron Expression
          </Label>
          <Input
            id="cron-expression"
            data-testid="input-cron-expression"
            value={customValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="0 2 * * *"
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <p className="text-sm text-destructive mt-1" data-testid="text-cron-error">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="text-sm text-muted-foreground" data-testid="text-cron-description">
        {getCurrentDescription()}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Cron format: minute hour day month weekday</p>
        <p>Example: "0 2 * * *" = 2:00 AM every day</p>
      </div>
    </div>
  );
}

function parseCronExpression(expression: string): string {
  const parts = expression.split(" ");
  if (parts.length !== 5) {
    return "Invalid cron expression format";
  }

  const [minute, hour, day, month, weekday] = parts;

  const minuteStr = minute === "*" ? "every minute" : `at minute ${minute}`;
  const hourStr = hour === "*" ? "every hour" : `at ${hour}:${minute.padStart(2, "0")}`;

  if (day !== "*" && month === "*" && weekday === "*") {
    return `Runs on day ${day} of every month ${hourStr}`;
  }

  if (day === "*" && month === "*" && weekday !== "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const weekdayName = days[parseInt(weekday)] || `day ${weekday}`;
    return `Runs every ${weekdayName} ${hourStr}`;
  }

  if (day === "*" && month === "*" && weekday === "*") {
    if (hour === "*" && minute === "*") {
      return "Runs every minute";
    }
    if (hour === "*") {
      return `Runs every hour ${minuteStr}`;
    }
    return `Runs every day ${hourStr}`;
  }

  return `Custom schedule: ${expression}`;
}
