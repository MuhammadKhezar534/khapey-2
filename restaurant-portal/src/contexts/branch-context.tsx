"use client";

import { useGetBranches } from "@/hooks/dasboard/useGetBranches";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";

// Define the branches array
export const branches = [
  "All branches",
  "Gulberg",
  "DHA Phase 5",
  "Johar Town",
  "MM Alam Road",
  "Bahria Town",
];
export const actualBranches = branches.filter(
  (branch) => branch !== "All branches"
);

const allBranches = { _id: undefined, branchName: "All branches" };

type BranchContextType = {
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  displayBranchName: string;
  hasSingleBranch: boolean;
  actualBranches: Branch[]; // Add this to the context type
  isLoading: boolean;
};

export interface Branch {
  _id: string | null | undefined;
  branchName: string;
  city?: string;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(allBranches);

  const { branches, isLoading } = useGetBranches();

  const withAllBranches = [allBranches, ...branches];

  const displayBranchName = selectedBranch?.branchName || "All branches";

  const hasSingleBranch = withAllBranches.length === 1;

  useEffect(() => {
    if (hasSingleBranch && !selectedBranch) {
      setSelectedBranch(withAllBranches[0]);
    }
  }, [hasSingleBranch, selectedBranch]);

  const contextValue = React.useMemo(
    () => ({
      selectedBranch,
      setSelectedBranch,
      displayBranchName,
      hasSingleBranch,
      isLoading,
      actualBranches: withAllBranches, // Add this to the context value
    }),
    [selectedBranch, displayBranchName, hasSingleBranch]
  );

  return (
    <BranchContext.Provider value={contextValue}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
}
