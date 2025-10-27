export interface TimeRangeOption {
  id: string;
  label: string;
  value: string;
}

export const defaultTimeRanges: TimeRangeOption[] = [
  {
    id: "today",
    label: "Today",
    value: "today",
    statLable: "today",
  },
  {
    id: "week",
    label: "This Week",
    value: "this_week",
  },
  {
    id: "month",
    label: "This Month",
    value: "this_month",
  },
  {
    id: "last-month",
    label: "Last Month",
    value: "last_month",
  },
  {
    id: "all",
    label: "All Time",
    value: "all_weeks",
  },
];

/**
 * Gets the label for a time range value
 * @param {string} value - The time range value
 * @param {TimeRangeOption[]} options - The available time range options
 * @returns {string} - The label for the time range value
 */
export function getTimeRangeLabel(
  value: string,
  options = defaultTimeRanges
): string {
  const option = options.find((o) => o.value === value);
  return option?.label || value;
}
