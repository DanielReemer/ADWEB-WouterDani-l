import { render, screen } from "@testing-library/react";
import Statistics from "../src/app/dashboard/Statistics";
import '@testing-library/jest-dom';

describe("Statistics", () => {
  it("toont inkomsten, uitgaven en balans correct", () => {
    render(<Statistics income={1500} expense={400} />);

    expect(screen.getByText(/inkomsten/i)).toHaveTextContent("€1500.00");
    expect(screen.getByText(/uitgaven/i)).toHaveTextContent("€400.00");
    expect(screen.getByText(/saldo/i)).toHaveTextContent("€1100.00");
  });
});
