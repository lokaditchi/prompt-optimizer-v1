/**
 * Custom hook for computing aggregate metrics from test run history.
 *
 * Provides date-range filtering and memoized metric computation
 * to power analytics dashboards.
 */

import { useMemo, useState } from 'react';
import type { AggregateMetrics } from '@/types';
import { useTestStore } from '@/store/testStore';
import {
  computeAggregateMetrics,
  filterByDateRange,
} from '@/services/metrics';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface UseMetricsReturn {
  /** Computed aggregate metrics for the selected date range. */
  metrics: AggregateMetrics;
  /** Whether metrics are being computed (always synchronous, but kept for API consistency). */
  isLoading: boolean;
  /** Current date range filter. */
  dateRange: DateRange | null;
  /** Update the date range filter. Pass null to clear and show all data. */
  setDateRange: (range: DateRange | null) => void;
}

/**
 * Hook that pulls test runs from the store and computes aggregate metrics.
 *
 * @example
 * ```tsx
 * const { metrics, dateRange, setDateRange } = useMetrics();
 *
 * return <div>Success rate: {(metrics.successRate * 100).toFixed(1)}%</div>;
 * ```
 */
export function useMetrics(): UseMetricsReturn {
  const testRuns = useTestStore((s) => s.testRuns);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const metrics = useMemo(() => {
    const filteredRuns = dateRange
      ? filterByDateRange(testRuns, dateRange.startDate, dateRange.endDate)
      : testRuns;

    return computeAggregateMetrics(filteredRuns);
  }, [testRuns, dateRange]);

  return {
    metrics,
    isLoading: false,
    dateRange,
    setDateRange,
  };
}
