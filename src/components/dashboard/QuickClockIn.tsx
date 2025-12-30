"use client";

import { useState, useEffect, useCallback, memo } from "react";

interface ActiveTimesheet {
  id: string;
  startTime: Date;
  startLat?: number;
  startLng?: number;
}

// Memoized component to prevent unnecessary re-renders
export const QuickClockIn = memo(function QuickClockIn() {
  const [isWorking, setIsWorking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timesheetId, setTimesheetId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isLoading, setIsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Check for active timesheet on mount
  useEffect(() => {
    const stored = localStorage.getItem("activeTimesheet");
    if (stored) {
      try {
        const data: ActiveTimesheet = JSON.parse(stored);
        // Validate that ID exists before restoring state
        if (data.id && typeof data.id === 'string' && data.id.length > 0) {
          setIsWorking(true);
          setStartTime(new Date(data.startTime));
          setTimesheetId(data.id);
        } else {
          // Invalid data, remove from localStorage
          localStorage.removeItem("activeTimesheet");
        }
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

      // Validate that we got a valid ID from the API
      if (!data.id || typeof data.id !== 'string' || data.id.length === 0) {
        throw new Error("Server response bevat geen geldige ID");
      }

      const activeData: ActiveTimesheet = {
        id: data.id,
        startTime: now,
        startLat: location?.lat,
        startLng: location?.lng,
      };

      localStorage.setItem("activeTimesheet", JSON.stringify(activeData));
      setIsWorking(true);
      setStartTime(now);
      setTimesheetId(data.id);
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
      // First try to get ID from state, fallback to localStorage
      let currentTimesheetId = timesheetId;

      if (!currentTimesheetId) {
        const stored = localStorage.getItem("activeTimesheet");
        if (!stored) throw new Error("Geen actieve registratie gevonden");

        const activeData: ActiveTimesheet = JSON.parse(stored);
        if (!activeData.id || typeof activeData.id !== 'string' || activeData.id.length === 0) {
          // Clear invalid data and reset state
          localStorage.removeItem("activeTimesheet");
          setIsWorking(false);
          setStartTime(null);
          setTimesheetId(null);
          setElapsedTime("00:00:00");
          throw new Error("Ongeldige registratie data. Start een nieuwe registratie.");
        }
        currentTimesheetId = activeData.id;
      }

      const location = await captureLocation();
      const now = new Date();

      const response = await fetch(`/api/timesheets/${currentTimesheetId}`, {
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
      setTimesheetId(null);
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
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-2xl p-6 text-white shadow-lg backdrop-blur-xl border border-white/20">
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
            <div className="text-sm text-purple-100">
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
            className="w-full backdrop-blur-sm bg-white/90 dark:bg-white/10 text-red-600 dark:text-red-400 font-semibold py-4 rounded-xl hover:bg-white dark:hover:bg-white/20 transition-colors flex items-center justify-center min-h-[56px] disabled:opacity-50 border border-white/50 dark:border-red-500/30 shadow-lg"
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
          className="w-full backdrop-blur-sm bg-white/90 dark:bg-white/10 text-purple-600 dark:text-purple-300 font-semibold py-4 rounded-xl hover:bg-white dark:hover:bg-white/20 transition-colors flex items-center justify-center min-h-[56px] disabled:opacity-50 border border-white/50 dark:border-purple-500/30 shadow-lg"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 dark:border-purple-400" />
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

      <div className="mt-3 text-xs text-purple-100 text-center flex items-center justify-center">
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
});

QuickClockIn.displayName = "QuickClockIn";
