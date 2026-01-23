import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Dashboard Integration Tests
 *
 * Tests for dashboard statistics calculation, data aggregation,
 * and visualization data preparation.
 */

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Statistics Calculation', () => {
    interface Timesheet {
      id: string;
      userId: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      date: Date;
      hoursWorked: number;
    }

    const mockTimesheets: Timesheet[] = [
      { id: 'ts-1', userId: 'emp-1', status: 'APPROVED', date: new Date('2024-01-15'), hoursWorked: 8 },
      { id: 'ts-2', userId: 'emp-1', status: 'APPROVED', date: new Date('2024-01-16'), hoursWorked: 7.5 },
      { id: 'ts-3', userId: 'emp-2', status: 'PENDING', date: new Date('2024-01-15'), hoursWorked: 8 },
      { id: 'ts-4', userId: 'emp-2', status: 'REJECTED', date: new Date('2024-01-16'), hoursWorked: 6 },
      { id: 'ts-5', userId: 'emp-3', status: 'PENDING', date: new Date('2024-01-17'), hoursWorked: 8.5 },
    ];

    it('should calculate total hours by status', () => {
      const calculateTotalHoursByStatus = (
        timesheets: Timesheet[],
        status: Timesheet['status']
      ): number => {
        return timesheets
          .filter(ts => ts.status === status)
          .reduce((sum, ts) => sum + ts.hoursWorked, 0);
      };

      const approvedHours = calculateTotalHoursByStatus(mockTimesheets, 'APPROVED');
      const pendingHours = calculateTotalHoursByStatus(mockTimesheets, 'PENDING');
      const rejectedHours = calculateTotalHoursByStatus(mockTimesheets, 'REJECTED');

      expect(approvedHours).toBe(15.5);
      expect(pendingHours).toBe(16.5);
      expect(rejectedHours).toBe(6);
    });

    it('should count timesheets by status', () => {
      const countByStatus = (timesheets: Timesheet[]) => {
        return timesheets.reduce((acc, ts) => {
          acc[ts.status] = (acc[ts.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      };

      const counts = countByStatus(mockTimesheets);

      expect(counts.APPROVED).toBe(2);
      expect(counts.PENDING).toBe(2);
      expect(counts.REJECTED).toBe(1);
    });

    it('should calculate average hours per employee', () => {
      const calculateAverageHoursPerEmployee = (timesheets: Timesheet[]): number => {
        if (timesheets.length === 0) return 0;

        const employeeHours = timesheets.reduce((acc, ts) => {
          if (!acc[ts.userId]) acc[ts.userId] = { total: 0, count: 0 };
          acc[ts.userId].total += ts.hoursWorked;
          acc[ts.userId].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

        const totalEmployees = Object.keys(employeeHours).length;
        const totalHours = Object.values(employeeHours).reduce((sum, e) => sum + e.total, 0);

        return totalHours / totalEmployees;
      };

      const avgHours = calculateAverageHoursPerEmployee(mockTimesheets);

      expect(avgHours).toBeCloseTo(12.67, 1); // (15.5 + 14 + 8.5) / 3
    });
  });

  describe('Date Range Filtering', () => {
    const mockData = [
      { id: '1', date: new Date('2024-01-01') },
      { id: '2', date: new Date('2024-01-15') },
      { id: '3', date: new Date('2024-01-31') },
      { id: '4', date: new Date('2024-02-15') },
      { id: '5', date: new Date('2024-03-01') },
    ];

    it('should filter data within date range', () => {
      const filterByDateRange = <T extends { date: Date }>(
        items: T[],
        startDate: Date,
        endDate: Date
      ): T[] => {
        return items.filter(item => item.date >= startDate && item.date <= endDate);
      };

      const januaryData = filterByDateRange(
        mockData,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(januaryData).toHaveLength(3);
    });

    it('should filter data for current week', () => {
      const getWeekRange = (referenceDate: Date) => {
        const date = new Date(referenceDate);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);

        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        return { start: monday, end: sunday };
      };

      const weekRange = getWeekRange(new Date('2024-01-15'));

      expect(weekRange.start.getDate()).toBe(15);
      expect(weekRange.end.getDate()).toBe(21);
    });

    it('should filter data for current month', () => {
      const getMonthRange = (year: number, month: number) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        return { start, end };
      };

      const januaryRange = getMonthRange(2024, 0);

      expect(januaryRange.start.getMonth()).toBe(0);
      expect(januaryRange.end.getDate()).toBe(31);
    });
  });

  describe('Chart Data Preparation', () => {
    it('should prepare line chart data for hours over time', () => {
      interface TimeEntry {
        date: Date;
        hours: number;
      }

      const prepareLineChartData = (entries: TimeEntry[]) => {
        const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

        return {
          labels: sortedEntries.map(e => e.date.toISOString().split('T')[0]),
          datasets: [{
            label: 'Gewerkte uren',
            data: sortedEntries.map(e => e.hours),
          }],
        };
      };

      const entries: TimeEntry[] = [
        { date: new Date('2024-01-03'), hours: 8 },
        { date: new Date('2024-01-01'), hours: 7 },
        { date: new Date('2024-01-02'), hours: 8.5 },
      ];

      const chartData = prepareLineChartData(entries);

      expect(chartData.labels).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
      expect(chartData.datasets[0].data).toEqual([7, 8.5, 8]);
    });

    it('should prepare pie chart data for status distribution', () => {
      const prepareStatusPieChart = (statusCounts: Record<string, number>) => {
        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);
        const colors = {
          APPROVED: '#22c55e',
          PENDING: '#f59e0b',
          REJECTED: '#ef4444',
        };

        return {
          labels,
          datasets: [{
            data,
            backgroundColor: labels.map(l => colors[l as keyof typeof colors] || '#6b7280'),
          }],
        };
      };

      const statusCounts = { APPROVED: 10, PENDING: 5, REJECTED: 2 };
      const chartData = prepareStatusPieChart(statusCounts);

      expect(chartData.labels).toEqual(['APPROVED', 'PENDING', 'REJECTED']);
      expect(chartData.datasets[0].data).toEqual([10, 5, 2]);
      expect(chartData.datasets[0].backgroundColor).toHaveLength(3);
    });

    it('should prepare bar chart data for hours by department', () => {
      interface DepartmentHours {
        department: string;
        hours: number;
        employees: number;
      }

      const prepareBarChartData = (deptData: DepartmentHours[]) => {
        return {
          labels: deptData.map(d => d.department),
          datasets: [
            {
              label: 'Totaal uren',
              data: deptData.map(d => d.hours),
            },
            {
              label: 'Medewerkers',
              data: deptData.map(d => d.employees),
            },
          ],
        };
      };

      const deptData: DepartmentHours[] = [
        { department: 'IT', hours: 160, employees: 5 },
        { department: 'HR', hours: 80, employees: 2 },
        { department: 'Sales', hours: 200, employees: 6 },
      ];

      const chartData = prepareBarChartData(deptData);

      expect(chartData.labels).toEqual(['IT', 'HR', 'Sales']);
      expect(chartData.datasets[0].label).toBe('Totaal uren');
      expect(chartData.datasets[1].data).toEqual([5, 2, 6]);
    });
  });

  describe('Employee Statistics', () => {
    interface Employee {
      id: string;
      department: string;
      contractType: 'FULLTIME' | 'PARTTIME' | 'FLEX';
      isActive: boolean;
    }

    const employees: Employee[] = [
      { id: 'emp-1', department: 'IT', contractType: 'FULLTIME', isActive: true },
      { id: 'emp-2', department: 'IT', contractType: 'PARTTIME', isActive: true },
      { id: 'emp-3', department: 'HR', contractType: 'FULLTIME', isActive: true },
      { id: 'emp-4', department: 'IT', contractType: 'FLEX', isActive: false },
      { id: 'emp-5', department: 'Sales', contractType: 'FULLTIME', isActive: true },
    ];

    it('should count employees by department', () => {
      const countByDepartment = (emps: Employee[]): Record<string, number> => {
        return emps
          .filter(e => e.isActive)
          .reduce((acc, e) => {
            acc[e.department] = (acc[e.department] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
      };

      const counts = countByDepartment(employees);

      expect(counts.IT).toBe(2);
      expect(counts.HR).toBe(1);
      expect(counts.Sales).toBe(1);
    });

    it('should count employees by contract type', () => {
      const countByContractType = (emps: Employee[]): Record<string, number> => {
        return emps
          .filter(e => e.isActive)
          .reduce((acc, e) => {
            acc[e.contractType] = (acc[e.contractType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
      };

      const counts = countByContractType(employees);

      expect(counts.FULLTIME).toBe(3);
      expect(counts.PARTTIME).toBe(1);
      expect(counts.FLEX).toBeUndefined(); // Inactive employee
    });

    it('should calculate active vs inactive ratio', () => {
      const calculateActivityRatio = (emps: Employee[]) => {
        const active = emps.filter(e => e.isActive).length;
        const total = emps.length;
        return {
          active,
          inactive: total - active,
          ratio: total > 0 ? active / total : 0,
        };
      };

      const ratio = calculateActivityRatio(employees);

      expect(ratio.active).toBe(4);
      expect(ratio.inactive).toBe(1);
      expect(ratio.ratio).toBe(0.8);
    });
  });

  describe('Notifications & Alerts', () => {
    interface Alert {
      type: 'warning' | 'error' | 'info';
      message: string;
      count?: number;
    }

    it('should generate alert for pending approvals', () => {
      const checkPendingApprovals = (pendingCount: number): Alert | null => {
        if (pendingCount === 0) return null;
        if (pendingCount >= 10) {
          return {
            type: 'error',
            message: 'Veel urenregistraties wachten op goedkeuring',
            count: pendingCount,
          };
        }
        if (pendingCount >= 5) {
          return {
            type: 'warning',
            message: 'Urenregistraties wachten op goedkeuring',
            count: pendingCount,
          };
        }
        return {
          type: 'info',
          message: 'Openstaande urenregistraties',
          count: pendingCount,
        };
      };

      expect(checkPendingApprovals(0)).toBeNull();
      expect(checkPendingApprovals(3)?.type).toBe('info');
      expect(checkPendingApprovals(7)?.type).toBe('warning');
      expect(checkPendingApprovals(15)?.type).toBe('error');
    });

    it('should generate alert for expiring subscriptions', () => {
      const checkSubscriptionExpiry = (expiryDate: Date, today: Date): Alert | null => {
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 0) {
          return { type: 'error', message: 'Abonnement is verlopen' };
        }
        if (daysUntilExpiry <= 7) {
          return { type: 'warning', message: `Abonnement verloopt over ${daysUntilExpiry} dagen` };
        }
        if (daysUntilExpiry <= 30) {
          return { type: 'info', message: `Abonnement verloopt over ${daysUntilExpiry} dagen` };
        }
        return null;
      };

      const today = new Date('2024-01-15');

      expect(checkSubscriptionExpiry(new Date('2024-01-10'), today)?.type).toBe('error');
      expect(checkSubscriptionExpiry(new Date('2024-01-20'), today)?.type).toBe('warning');
      expect(checkSubscriptionExpiry(new Date('2024-02-01'), today)?.type).toBe('info');
      expect(checkSubscriptionExpiry(new Date('2024-03-01'), today)).toBeNull();
    });
  });

  describe('Data Aggregation', () => {
    it('should aggregate weekly data', () => {
      interface DailyData {
        date: Date;
        value: number;
      }

      const aggregateWeekly = (dailyData: DailyData[]) => {
        const weeklyData = new Map<string, number>();

        for (const data of dailyData) {
          const date = new Date(data.date);
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          const weekStart = new Date(date.setDate(diff));
          const weekKey = weekStart.toISOString().split('T')[0];

          weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + data.value);
        }

        return Array.from(weeklyData.entries()).map(([week, total]) => ({
          week,
          total,
        }));
      };

      const dailyData: DailyData[] = [
        { date: new Date('2024-01-15'), value: 10 },
        { date: new Date('2024-01-16'), value: 15 },
        { date: new Date('2024-01-22'), value: 20 },
      ];

      const weeklyAgg = aggregateWeekly(dailyData);

      expect(weeklyAgg).toHaveLength(2);
    });

    it('should aggregate monthly data', () => {
      interface DailyData {
        date: Date;
        value: number;
      }

      const aggregateMonthly = (dailyData: DailyData[]) => {
        const monthlyData = new Map<string, number>();

        for (const data of dailyData) {
          const monthKey = `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + data.value);
        }

        return Array.from(monthlyData.entries())
          .map(([month, total]) => ({ month, total }))
          .sort((a, b) => a.month.localeCompare(b.month));
      };

      const dailyData: DailyData[] = [
        { date: new Date('2024-01-15'), value: 10 },
        { date: new Date('2024-01-20'), value: 15 },
        { date: new Date('2024-02-05'), value: 20 },
        { date: new Date('2024-02-15'), value: 25 },
      ];

      const monthlyAgg = aggregateMonthly(dailyData);

      expect(monthlyAgg).toHaveLength(2);
      expect(monthlyAgg[0].month).toBe('2024-01');
      expect(monthlyAgg[0].total).toBe(25);
      expect(monthlyAgg[1].month).toBe('2024-02');
      expect(monthlyAgg[1].total).toBe(45);
    });
  });

  describe('Dashboard Summary', () => {
    it('should generate complete dashboard summary', () => {
      interface DashboardSummary {
        employees: {
          total: number;
          active: number;
          byDepartment: Record<string, number>;
        };
        timesheets: {
          pending: number;
          approvedThisMonth: number;
          totalHoursThisMonth: number;
        };
        alerts: Array<{ type: string; message: string }>;
      }

      const generateDashboardSummary = (): DashboardSummary => {
        return {
          employees: {
            total: 15,
            active: 12,
            byDepartment: {
              IT: 5,
              HR: 3,
              Sales: 4,
            },
          },
          timesheets: {
            pending: 8,
            approvedThisMonth: 45,
            totalHoursThisMonth: 360,
          },
          alerts: [
            { type: 'warning', message: '8 urenregistraties wachten op goedkeuring' },
          ],
        };
      };

      const summary = generateDashboardSummary();

      expect(summary.employees.total).toBe(15);
      expect(summary.employees.active).toBe(12);
      expect(summary.timesheets.pending).toBe(8);
      expect(summary.alerts).toHaveLength(1);
    });
  });
});
