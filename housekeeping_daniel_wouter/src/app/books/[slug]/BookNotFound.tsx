"use client";

export default function BookNotFound() {
  return (
    <div className="p-10 flex flex-col items-center gap-4 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700">
        Geen gegevens gevonden
      </h2>
      <p className="text-gray-400 text-base">
        We kunnen het gevraagde boek helaas niet vinden.
        <br />
        Probeer het opnieuw of zoek naar een ander boek.
      </p>
    </div>
  );
}
