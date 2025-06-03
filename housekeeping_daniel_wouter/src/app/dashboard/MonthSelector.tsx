"use client";

interface Props {
  selectedMonth: number;
  selectedYear: number;
  onChange: (value: { month: number; year: number }) => void;
}

export default function MonthSelector({
  selectedMonth,
  selectedYear,
  onChange,
}: Props) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => thisYear - i); // laatste 5 jaar

  return (
    <div className="mb-4 flex gap-4">
      <div className="w-1/2">
        <label htmlFor="month" className="block mb-2 text-sm text-gray-700">
          Selecteer maand:
        </label>
        <select
          id="month"
          className="border border-gray-300 rounded p-2 w-full"
          value={selectedMonth}
          onChange={(e) =>
            onChange({ month: Number(e.target.value), year: selectedYear })
          }
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("nl-NL", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      <div className="w-1/2">
        <label htmlFor="year" className="block mb-2 text-sm text-gray-700">
          Selecteer jaar:
        </label>
        <select
          id="year"
          className="border border-gray-300 rounded p-2 w-full"
          value={selectedYear}
          onChange={(e) =>
            onChange({ month: selectedMonth, year: Number(e.target.value) })
          }
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
