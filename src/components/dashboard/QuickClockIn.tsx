"use client";

import { useState, useEffect, useCallback } from "react";

interface ActiveTimesheet {
  id: string;
  startTime: Date;
  startLat?: number;
  startLng?: number;
}

export function QuickClockIn() {
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isLoading, setIsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Check for active timesheet on mount
  useEffect(() => {
    const stored = localStorage.getItem("activeTimesheet");
    if (stored) {
      try {
        const data: ActiveTimesheet = JSON.parse(stored);
        setIsWorking(true);
        setStartTime(new Date(data.startTime));
      } catch {
        localStorage.removeItem("activeTimesheet");
      }
    }
  }, []);

  // Update elapsed time every second
  useEffect(() => {
    if (!isWorking || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, startTime]);

  const captureLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      setGpsStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsStatus("success");
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setGpsStatus("error");
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, []);

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      const location = await captureLocation();
      const now = new Date();

      const response = await fetch("/api/timesheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: now.toISOString().split("T")[0],
          startTime: now.toTimeString().slice(0, 5),
          endTime: now.toTimeString().slice(0, 5), // Will be updated on clock out
          breakDuration: 0,
          description: "Quick Clock In",
          startLat: location?.lat,
          startLng: location?.lng,
        }),
      });

      if (!response.ok) throw new Error("Fout bij starten");

      const data = await response.json();

      const activeData: ActiveTimesheet = {
        id: data.id,
        startTime: now,
        startLat: location?.lat,
        startLng: location?.lng,
      };

      localStorage.setItem("activeTimesheet", JSON.stringify(activeData));
      setIsWorking(true);
      setStartTime(now);
    } catch (error) {
      console.error("Clock in error:", error);
      alert("Kon niet inklokken. Probeer opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem("activeTimesheet");
      if (!stored) throw new Error("Geen actieve registratie gevonden");

      const activeData: ActiveTimesheet = JSON.parse(stored);
      const location = await captureLocation();
      const now = new Date();

      const response = await fetch(`/api/timesheets/${activeData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: now.toTimeString().slice(0, 5),
          endLat: location?.lat,
          endLng: location?.lng,
          breakDuration: 0,
        }),
      });

      if (!response.ok) throw new Error("Fout bij stoppen");

      localStorage.removeItem("activeTimesheet");
      setIsWorking(false);
      setStartTime(null);
      setElapsedTime("00:00:00");

      // Show success message
      alert("Uren succesvol geregistreerd!");
    } catch (error) {
      console.error("Clock out error:", error);
      alert("Kon niet uitklokken. Probeer opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700 rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Snel Registreren
      </h3>

      {isWorking ? (
        <>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-2 font-mono">{elapsedTime}</div>
            <div className="text-sm text-blue-100">
              Gestart om{" "}
              {startTime?.toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <button
            onClick={handleClockOut}
            disabled={isLoading}
            className="w-full bg-white text-red-600 font-semibold py-4 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center min-h-[56px] disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
            ) : (
              <>
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                Uitklokken
              </>
            )}
          </button>
        </>
      ) : (
        <button
          onClick={handleClockIn}
          disabled={isLoading}
          className="w-full bg-white text-blue-600 font-semibold py-4 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center min-h-[56px] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          ) : (
            <>
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Inklokken
            </>
          )}
        </button>
      )}

      <div className="mt-3 text-xs text-blue-100 text-center flex items-center justify-center">
        {gpsStatus === "loading" && (
          <>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
            GPS locatie wordt bepaald...
          </>
        )}
        {gpsStatus === "success" && (
          <>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            GPS locatie vastgelegd
          </>
        )}
        {gpsStatus === "error" && (
          <>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            GPS niet beschikbaar
          </>
        )}
        {gpsStatus === "idle" && "GPS locatie wordt automatisch vastgelegd"}
      </div>
    </div>
  );
}
