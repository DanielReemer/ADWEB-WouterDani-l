import { render, screen, fireEvent } from "@testing-library/react";
import MonthSelector from "../src/app/dashboard/MonthSelector";
import '@testing-library/jest-dom';


describe("MonthSelector", () => {
  it("roept onChange aan met juiste maand en jaar", () => {
    const handleChange = jest.fn();

    render(
      <MonthSelector
        selectedMonth={3}
        selectedYear={2024}
        onChange={handleChange}
      />
    );

    const maandSelect = screen.getByLabelText(/selecteer maand/i);
    const jaarSelect = screen.getByLabelText(/selecteer jaar/i);

    fireEvent.change(maandSelect, { target: { value: "5" } }); // juni
    expect(handleChange).toHaveBeenCalledWith({ month: 5, year: 2024 });

    fireEvent.change(jaarSelect, { target: { value: "2023" } });
    expect(handleChange).toHaveBeenCalledWith({ month: 3, year: 2023 });
  });
});
