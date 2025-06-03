"use client";

interface Props {
  selectedMonth: number;
  onChange: (month: number) => void;
}

export default function MonthSelector({ selectedMonth, onChange }: Props) {
  return (
    <div className="mb-4">
      <label htmlFor="month"  className="block mb-2 text-sm text-gray-700">Selecteer maand:</label>
      <select
        id="month"
        className="border border-gray-300 rounded p-2 w-full"
        value={selectedMonth}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            {new Date(0, i).toLocaleString("nl-NL", { month: "long" })}
          </option>
        ))}
      </select>
    </div>
  );
}
