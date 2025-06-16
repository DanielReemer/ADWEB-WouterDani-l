interface Props {
  income: number;
  expense: number;
}

export default function Statistics({ income, expense }: Props) {
  const balance = income - expense;

  return (
    <div className="mb-6 bg-gray-100 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Statistieken</h2>
      <p> Inkomsten: €{income.toFixed(2)}</p>
      <p> Uitgaven: €{expense.toFixed(2)}</p>
      <p> Saldo: €{balance.toFixed(2)}</p>
    </div>
  );
}
