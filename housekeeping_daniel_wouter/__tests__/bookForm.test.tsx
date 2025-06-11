import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BookForm, { BookFormData } from "@/app/books/BookForm";
import "@testing-library/jest-dom";

const defaultData: BookFormData = {
  name: "Testboek",
  description: "Beschrijving",
};

describe("BookForm", () => {
  it("renders fields with initial data", () => {
    render(<BookForm initialData={defaultData} onSubmit={jest.fn()} />);
    expect(screen.getByRole("textbox", { name: /naam/i })).toHaveValue(
      "Testboek"
    );
    expect(screen.getByRole("textbox", { name: /omschrijving/i })).toHaveValue(
      "Beschrijving"
    );
    expect(
      screen.getByRole("button", { name: /opslaan/i })
    ).toBeInTheDocument();
  });

  it("shows global error if provided", () => {
    render(
      <BookForm
        initialData={defaultData}
        onSubmit={jest.fn()}
        globalError="Foutmelding"
      />
    );
    expect(screen.getByText("Foutmelding")).toBeInTheDocument();
  });

  it("validates required name field", () => {
    render(
      <BookForm
        initialData={{ ...defaultData, name: "" }}
        onSubmit={jest.fn()}
      />
    );
    fireEvent.change(screen.getByRole("textbox", { name: /naam/i }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /opslaan/i }));
    expect(screen.getByText(/naam is verplicht/i)).toBeInTheDocument();
  });

  it("validates min/max name length", () => {
    render(
      <BookForm
        initialData={{ ...defaultData, name: "ab" }}
        onSubmit={jest.fn()}
      />
    );
    fireEvent.change(screen.getByRole("textbox", { name: /naam/i }), {
      target: { value: "ab" },
    });
    fireEvent.click(screen.getByRole("button", { name: /opslaan/i }));
    expect(screen.getByText(/minimaal 3 tekens/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /naam/i }), {
      target: { value: "a".repeat(51) },
    });
    fireEvent.click(screen.getByRole("button", { name: /opslaan/i }));
    expect(screen.getByText(/maximaal 50 tekens/i)).toBeInTheDocument();
  });

  it("validates description max length", () => {
    render(
      <BookForm
        initialData={{ ...defaultData, description: "a".repeat(201) }}
        onSubmit={jest.fn()}
      />
    );
    fireEvent.change(screen.getByRole("textbox", { name: /omschrijving/i }), {
      target: { value: "a".repeat(201) },
    });
    fireEvent.click(screen.getByRole("button", { name: /opslaan/i }));
    expect(screen.getByText(/maximaal 200 tekens/i)).toBeInTheDocument();
  });

  it("calls onSubmit with valid data", () => {
    const onSubmit = jest.fn();
    render(<BookForm initialData={defaultData} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /opslaan/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Testboek",
        description: "Beschrijving",
        errors: undefined,
      })
    );
  });

  it("disables fields and button when loading", () => {
    render(<BookForm initialData={defaultData} onSubmit={jest.fn()} loading />);
    expect(screen.getByRole("textbox", { name: /naam/i })).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /omschrijving/i })
    ).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveTextContent(/bezig/i);
  });

  it("shows custom submit button label", () => {
    render(
      <BookForm
        initialData={defaultData}
        onSubmit={jest.fn()}
        submitButtonLabel="Aanmaken"
      />
    );
    expect(
      screen.getByRole("button", { name: /aanmaken/i })
    ).toBeInTheDocument();
  });

  it("shows and updates character counter for description", () => {
    render(
      <BookForm
        initialData={{ ...defaultData, description: "" }}
        onSubmit={jest.fn()}
      />
    );
    const textarea = screen.getByRole("textbox", { name: /omschrijving/i });
    expect(screen.getByText("0/500")).toBeInTheDocument();
    fireEvent.change(textarea, { target: { value: "1234" } });
    expect(screen.getByText("4/500")).toBeInTheDocument();
  });
});
