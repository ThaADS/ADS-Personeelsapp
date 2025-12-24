"use client";

interface Employee {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  department: string | null;
  position: string | null;
  role: string;
  employeeId: string | null;
  startDate: string | null;
  image: string | null;
}

interface EmployeeCardProps {
  employee: Employee;
  canManage: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function EmployeeCard({ employee, canManage, onView, onEdit }: EmployeeCardProps) {
  const getRoleBadgeConfig = (role: string) => {
    switch (role) {
      case "TENANT_ADMIN":
        return {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-800 dark:text-purple-300",
          label: "Admin",
        };
      case "MANAGER":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-300",
          label: "Manager",
        };
      case "USER":
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-800 dark:text-gray-300",
          label: "Medewerker",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-700",
          text: "text-gray-800 dark:text-gray-300",
          label: role,
        };
    }
  };

  const roleConfig = getRoleBadgeConfig(employee.role);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Avatar + Name */}
      <div className="flex items-start space-x-3 mb-3">
        {employee.image ? (
          <img
            src={employee.image}
            alt={employee.name || "Avatar"}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {getInitials(employee.name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {employee.name || "Geen naam"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {employee.email}
          </div>
          {employee.employeeId && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              #{employee.employeeId}
            </div>
          )}
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${roleConfig.bg} ${roleConfig.text}`}
        >
          {roleConfig.label}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Afdeling
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {employee.department || "-"}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Functie
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {employee.position || "-"}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        {employee.phone && (
          <a
            href={`tel:${employee.phone}`}
            className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 min-h-[44px]"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            {employee.phone}
          </a>
        )}
        <a
          href={`mailto:${employee.email}`}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 min-h-[44px]"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {employee.email}
        </a>
      </div>

      {/* Start Date */}
      {employee.startDate && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          In dienst sinds {formatDate(employee.startDate)}
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="flex space-x-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onView(employee.id)}
            className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 min-h-[44px] flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Bekijken
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(employee.id)}
              className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/50 min-h-[44px] flex items-center justify-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Bewerken
            </button>
          )}
        </div>
      )}
    </div>
  );
}
