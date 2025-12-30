"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ApprovalItem, PaginationData } from "@/types/approval";
import { fetchApprovals, processApprovals } from "@/lib/services/approval-service";

// Componenten importeren
import ActionBar from "@/components/approvals/ActionBar";
import ApprovalTabs from "@/components/approvals/ApprovalTabs";
import ApprovalList from "@/components/approvals/ApprovalList";
import CommentModal from "@/components/approvals/CommentModal";
import Pagination from "@/components/approvals/Pagination";

export default function ApprovalsPage() {
  useSession(); // Sessie check voor authenticatie
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginering
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve");
  const [modalTitle, setModalTitle] = useState("");

  // Tellers voor tabbladen
  const [counts, setCounts] = useState({
    all: 0,
    timesheet: 0,
    vacation: 0,
    sickleave: 0,
  });

  // Haal goedkeuringen op bij het laden van de pagina en wanneer activeTab of pagination verandert
  useEffect(() => {
    const loadApprovals = async () => {
      setIsLoading(true);
      try {
        const response = await fetchApprovals(
          activeTab === "all" ? "all" : activeTab,
          "PENDING",
          pagination.page,
          pagination.limit
        );

        setApprovals(response.items);
        setPagination(response.pagination);

        // Update de tellers voor de tabbladen
        const newCounts = {
          all: response.pagination.total,
          timesheet: 0,
          vacation: 0,
          sickleave: 0,
        };

        // Als we op het "all" tabblad zijn, haal dan de aantallen op voor de andere tabbladen
        // OPTIMIZED: Fetch counts in parallel instead of sequentially (3x faster)
        if (activeTab === "all") {
          try {
            const [timesheetResponse, vacationResponse, sickleaveResponse] = await Promise.all([
              fetchApprovals("timesheet", "PENDING", 1, 1),
              fetchApprovals("vacation", "PENDING", 1, 1),
              fetchApprovals("sickleave", "PENDING", 1, 1),
            ]);

            newCounts.timesheet = timesheetResponse.pagination.total;
            newCounts.vacation = vacationResponse.pagination.total;
            newCounts.sickleave = sickleaveResponse.pagination.total;
          } catch (error) {
            console.error("Error fetching tab counts:", error);
          }
        } else {
          // Als we op een specifiek tabblad zijn, weten we het aantal voor dat tabblad
          newCounts[activeTab as keyof typeof newCounts] = response.pagination.total;
        }

        setCounts(newCounts);
        setError(null);
      } catch (error) {
        console.error("Error fetching approvals:", error);
        setError("Er is een fout opgetreden bij het ophalen van de goedkeuringen.");
      } finally {
        setIsLoading(false);
      }
    };

    loadApprovals();
  }, [activeTab, pagination.page, pagination.limit]);

  // Functie om een item te selecteren/deselecteren
  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Functie om alle items te selecteren/deselecteren
  const toggleSelectAll = () => {
    if (selectedItems.length === approvals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(approvals.map((approval) => approval.id));
    }
  };

  // Functie om de pagina te wijzigen
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  // Functie om het modaal te openen voor goedkeuren
  const openApproveModal = () => {
    setModalAction("approve");
    setModalTitle(`${selectedItems.length} item(s) goedkeuren`);
    setModalOpen(true);
  };

  // Functie om het modaal te openen voor afkeuren
  const openRejectModal = () => {
    setModalAction("reject");
    setModalTitle(`${selectedItems.length} item(s) afkeuren`);
    setModalOpen(true);
  };

  // Functie om een enkel item goed te keuren
  const handleApprove = (id: string) => {
    setSelectedItems([id]);
    openApproveModal();
  };

  // Functie om een enkel item af te keuren
  const handleReject = (id: string) => {
    setSelectedItems([id]);
    openRejectModal();
  };

  // Functie om geselecteerde items te verwerken met opmerking
  const handleProcessWithComment = async (comment: string) => {
    setIsLoading(true);
    try {
      await processApprovals({
        ids: selectedItems,
        action: modalAction,
        comment: comment.trim() || undefined,
      });

      // Herlaad de goedkeuringen na verwerking
      const response = await fetchApprovals(
        activeTab === "all" ? "all" : activeTab,
        "PENDING",
        pagination.page,
        pagination.limit
      );

      setApprovals(response.items);
      setPagination(response.pagination);
      setSelectedItems([]);
      setModalOpen(false);
    } catch (error) {
      console.error("Error processing approvals:", error);
      setError(`Er is een fout opgetreden bij het ${modalAction === "approve" ? "goedkeuren" : "afkeuren"} van de items.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actie balk met titel en knoppen */}
      <ActionBar
        selectedCount={selectedItems.length}
        onApprove={openApproveModal}
        onReject={openRejectModal}
      />

      {/* Foutmelding indien nodig */}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabbladen en goedkeuringslijst */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <ApprovalTabs
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setPagination({ ...pagination, page: 1 }); // Reset naar eerste pagina bij tabwissel
          }}
          counts={counts}
        />

        <ApprovalList
          approvals={approvals}
          selectedItems={selectedItems}
          toggleItemSelection={toggleItemSelection}
          toggleSelectAll={toggleSelectAll}
          handleApprove={handleApprove}
          handleReject={handleReject}
          isLoading={isLoading}
        />

        {/* Paginering */}
        {!isLoading && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Smart validation informatie */}
      <div className="backdrop-blur-sm bg-blue-500/10 dark:bg-blue-500/10 shadow-lg rounded-2xl border border-blue-500/20 p-6">
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
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Slimme validatie
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <p>
                Het systeem markeert automatisch afwijkende registraties zoals:
              </p>
              <ul className="list-disc pl-5 mt-1">
                <li>Tijdregistraties buiten normale werkuren</li>
                <li>Ongebruikelijk lange of korte werkperiodes</li>
                <li>Patroonafwijkingen die menselijke controle vereisen</li>
                <li>Ontbrekende GPS-verificatie</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modaal voor opmerkingen */}
      <CommentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleProcessWithComment}
        title={modalTitle}
        actionType={modalAction}
      />
    </div>
  );
}
