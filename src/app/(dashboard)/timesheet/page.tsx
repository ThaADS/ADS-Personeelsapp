"use client";

import { useState } from "react";
// import { useSession } from "next-auth/react"; // Not needed yet
import Link from "next/link";

// Voorbeeld tijdregistratie data (in een echte applicatie zou dit uit de database komen)
const timesheetData = [
  {
    id: "1",
    date: "2025-07-18",
    startTime: "08:00",
    endTime: "17:00",
    breakDuration: 60,
    description: "Werkzaamheden bij klant ABC",
    status: "APPROVED",
    locationVerified: true,
    startLocation: "Kantoor CKW",
    endLocation: "Kantoor CKW",
  },
  {
    id: "2",
    date: "2025-07-17",
    startTime: "08:30",
    endTime: "16:30",
    breakDuration: 45,
    description: "Installatie bij klant XYZ",
    status: "APPROVED",
    locationVerified: true,
    startLocation: "Kantoor CKW",
    endLocation: "Klant XYZ, Amsterdam",
  },
  {
    id: "3",
    date: "2025-07-16",
    startTime: "09:00",
    endTime: "17:30",
    breakDuration: 60,
    description: "Onderhoud systemen",
    status: "APPROVED",
    locationVerified: true,
    startLocation: "Kantoor CKW",
    endLocation: "Kantoor CKW",
  },
];

export default function TimesheetPage() {
  
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    breakDuration: 30,
    description: "",
  });

  // Functie om de status kleur te bepalen
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Functie om de status in het Nederlands weer te geven
  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Goedgekeurd";
      case "PENDING":
        return "In behandeling";
      case "REJECTED":
        return "Afgekeurd";
      default:
        return status;
    }
  };

  // Functie om het formulier te verwerken
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier zou de data naar de API gestuurd worden
    console.log("Nieuwe tijdregistratie:", formData);
    
    // Reset formulier en sluit het
    setFormData({
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      breakDuration: 30,
      description: "",
    });
    setShowNewEntryForm(false);
  };

  // Functie om formuliergegevens bij te werken
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Paginatitel */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tijdregistratie</h1>
          <button
            onClick={() => setShowNewEntryForm(!showNewEntryForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showNewEntryForm ? "Annuleren" : "Nieuwe registratie"}
          </button>
        </div>
      </div>

      {/* Formulier voor nieuwe tijdregistratie */}
      {showNewEntryForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Nieuwe tijdregistratie
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Datum
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Starttijd
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Eindtijd
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="breakDuration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pauze (minuten)
                </label>
                <input
                  type="number"
                  name="breakDuration"
                  id="breakDuration"
                  min="0"
                  max="120"
                  value={formData.breakDuration}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Omschrijving werkzaamheden
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Opslaan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RouteVision integratie informatie */}
      <div className="bg-blue-50 shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              RouteVision GPS-verificatie
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Tijdregistraties worden automatisch geverifieerd met GPS-gegevens
                uit RouteVision. De locatiegegevens worden om de 15 minuten
                bijgewerkt tijdens werkuren.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tijdregistratie tabel */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">
            Recente tijdregistraties
          </h2>
        </div>
        <div className="border-t border-gray-200">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Datum
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tijd
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Omschrijving
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          GPS Verificatie
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Acties
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timesheetData.map((entry) => {
                        // Bereken de totale werktijd in uren
                        const startTime = new Date(`${entry.date}T${entry.startTime}`);
                        const endTime = new Date(`${entry.date}T${entry.endTime}`);
                        const totalMinutes =
                          (endTime.getTime() - startTime.getTime()) / (1000 * 60) -
                          entry.breakDuration;
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;

                        return (
                          <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(entry.date).toLocaleDateString("nl-NL")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {`${hours}u ${minutes}m (${entry.startTime}-${entry.endTime}, ${entry.breakDuration}m pauze)`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                  entry.status
                                )}`}
                              >
                                {getStatusText(entry.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.locationVerified ? (
                                <span className="text-green-500 flex items-center">
                                  <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Geverifieerd
                                </span>
                              ) : (
                                <span className="text-red-500 flex items-center">
                                  <svg
                                    className="h-5 w-5 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  Niet geverifieerd
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/timesheet/${entry.id}`}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
