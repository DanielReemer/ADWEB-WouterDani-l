import { render, screen, fireEvent } from "@testing-library/react";
import MonthSelector from "../src/app/dashboard/MonthSelector";
import '@testing-library/jest-dom';


describe("MonthSelector", () => {
  it("roept onChange aan met juiste maand bij selectie", () => {
    const handleChange = jest.fn();

    render(<MonthSelector selectedMonth={0} onChange={handleChange} />);

    const select = screen.getByLabelText(/selecteer maand/i);
    fireEvent.change(select, { target: { value: "5" } }); // Juni (index 5)

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("toont de juiste geselecteerde maand", () => {
    render(<MonthSelector selectedMonth={2} onChange={() => {}} />); // Maart
    const select = screen.getByLabelText(/selecteer maand/i);
    expect(select).toHaveValue("2");
  });
});
