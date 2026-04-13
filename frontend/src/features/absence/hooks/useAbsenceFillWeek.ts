import React, { useCallback } from "react";

type UseAbsenceFillWeekProps = {
  hours: Record<string, string>;
  selectedWorkItemIds: number[];
  setHours: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export function useAbsenceFillWeek({
  hours,
  selectedWorkItemIds,
  setHours,
}: UseAbsenceFillWeekProps) {
  const handleFillWeek = useCallback(() => {
    const days = ["mon", "tue", "wed", "thu", "fri"];
    const updated = { ...hours };

    const idsToFill =
      selectedWorkItemIds.length > 0 ? selectedWorkItemIds : [null];

    for (const wId of idsToFill) {
      for (const day of days) {
        const key = wId !== null ? `${wId}-${day}` : day;
        const val = parseFloat((updated[key] ?? "0").replace(",", ".")) || 0;
        if (val === 0) {
          updated[key] = "8";
        }
      }
    }
    setHours(updated);
  }, [hours, selectedWorkItemIds, setHours]);

  return { handleFillWeek };
}
