// "use client"

// import { Card } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Star } from "lucide-react"
// import { SkeletonReviewQuestionsTable } from "@/components/ui/skeleton-card"

// interface ReviewQuestionsTableProps {
//   questions: Array<{
//     question: string
//     topAnswer: string
//     count: number
//     averageRating: number
//   }>
//   isLoading: boolean
//   isRefreshing: boolean
// }

// export function ReviewQuestionsTable({ questions, isLoading, isRefreshing }: ReviewQuestionsTableProps) {
//   if (isLoading || isRefreshing) {
//     return <SkeletonReviewQuestionsTable />
//   }

//   return (
//     <Card>
//       <div className="relative overflow-x-auto hide-scrollbar p-4">
//         <Table className="min-w-full">
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[40%]">Question</TableHead>
//               <TableHead className="w-[40%]">Top Answer</TableHead>
//               <TableHead className="text-right w-[20%]">Rating</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {questions.map((item, index) => (
//               <TableRow key={index}>
//                 <TableCell className="font-medium">
//                   <div className="w-full overflow-x-auto hide-scrollbar whitespace-normal">{item.question}</div>
//                 </TableCell>
//                 <TableCell>
//                   <div className="w-full overflow-x-auto hide-scrollbar whitespace-normal">
//                     {item.topAnswer} <span className="text-muted-foreground">({item.count})</span>
//                   </div>
//                 </TableCell>
//                 <TableCell className="text-right">
//                   <div className="flex items-center justify-end">
//                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
//                       <Star className="h-3 w-3 mr-1" />
//                       {item.averageRating.toFixed(1)}
//                     </span>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </Card>
//   )
// }

"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { SkeletonReviewQuestionsTable } from "@/components/ui/skeleton-card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  getReviewQuestionsWithActualCounts,
  type ReviewQuestion,
} from "@/utils/review-data";

interface ReviewQuestionsTableProps {
  questions: ReviewQuestion[];
  isLoading: boolean;
  isRefreshing: boolean;
  selectedBranch: string;
}

export function ReviewQuestionsTable({
  questions,
  isLoading,
  isRefreshing,
  selectedBranch,
}: ReviewQuestionsTableProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [sortColumn, setSortColumn] = useState<string>("count");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (isLoading || isRefreshing) {
    return <SkeletonReviewQuestionsTable />;
  }

  // Filter questions based on selected branch
  const allQuestions = getReviewQuestionsWithActualCounts(selectedBranch);

  // Update the handleSort function to handle undefined ratings properly
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      // Default to descending for ratings, ascending for others
      setSortDirection(column === "averageRating" ? "desc" : "asc");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Helper function to render sort icon
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 inline opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline text-primary" />
    );
  };

  // Filter questions based on active tab
  let filteredQuestions =
    activeTab === "all"
      ? allQuestions
      : allQuestions.filter((q) => q.type.toLowerCase() === activeTab);

  // Sort questions based on sort column and direction
  filteredQuestions = [...filteredQuestions].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === "question") {
      comparison = a.question.localeCompare(b.question);
    } else if (sortColumn === "topAnswer") {
      comparison = a.topAnswer.localeCompare(b.topAnswer);
    } else if (sortColumn === "count") {
      comparison = a.count - b.count;
    } else if (sortColumn === "type") {
      comparison = a.type.localeCompare(b.type);
    } else if (sortColumn === "branch") {
      // For branch sorting, use the first branch or "All branches" as fallback
      const aBranch = Array.isArray(a.branch)
        ? a.branch[0]
        : a.branch || "All branches";
      const bBranch = Array.isArray(b.branch)
        ? b.branch[0]
        : b.branch || "All branches";
      comparison = aBranch.localeCompare(bBranch);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Helper function to get answers for a question
  const getAnswersForQuestion = (question: ReviewQuestion) => {
    if (question.standardizedAnswers) {
      return question.standardizedAnswers;
    }

    if (question.multipleAnswers) {
      return question.multipleAnswers;
    }

    // Fallback
    return [{ answer: question.topAnswer, count: question.count }];
  };

  // Update the renderBranchBadges function to match the answer badge style
  const renderBranchBadges = (branch: string | string[] | undefined) => {
    if (!branch) {
      return (
        <Badge variant="outline" className="text-xs font-normal">
          All branches
        </Badge>
      );
    }

    if (branch === "All branches") {
      return (
        <Badge variant="outline" className="text-xs font-normal">
          All branches
        </Badge>
      );
    }

    if (Array.isArray(branch)) {
      return (
        <div className="flex flex-wrap gap-2">
          {branch.map((b, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs font-normal whitespace-nowrap"
            >
              {b}
            </Badge>
          ))}
        </div>
      );
    }

    return (
      <Badge variant="outline" className="text-xs font-normal">
        {branch}
      </Badge>
    );
  };

  return (
    <Card>
      <div className="p-4">
        {/* Full width tabs container with content-fitting tabs */}
        <div className="w-full border-b mb-4">
          <div className="flex space-x-6">
            <button
              onClick={() => handleTabChange("all")}
              className={`py-2 px-1 text-center font-medium text-sm transition-colors relative ${
                activeTab === "all"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
              {activeTab === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange("dine-in")}
              className={`py-2 px-1 text-center font-medium text-sm transition-colors relative ${
                activeTab === "dine-in"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dine-in
              {activeTab === "dine-in" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange("delivery")}
              className={`py-2 px-1 text-center font-medium text-sm transition-colors relative ${
                activeTab === "delivery"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Delivery
              {activeTab === "delivery" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
            <button
              onClick={() => handleTabChange("takeaway")}
              className={`py-2 px-1 text-center font-medium text-sm transition-colors relative ${
                activeTab === "takeaway"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Takeaway
              {activeTab === "takeaway" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto hide-scrollbar">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("question")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Question {renderSortIcon("question")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("topAnswer")}
                  className="cursor-pointer w-[400px]"
                >
                  <div className="flex items-center">
                    Answers {renderSortIcon("topAnswer")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("type")}
                  className="cursor-pointer"
                >
                  <div className="flex items-center">
                    Type {renderSortIcon("type")}
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("branch")}
                  className="cursor-pointer w-[400px]"
                >
                  <div className="flex items-center">
                    Branch {renderSortIcon("branch")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((item, index) => {
                const answers = getAnswersForQuestion(item);

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="w-full overflow-x-auto hide-scrollbar whitespace-normal flex items-center gap-1.5">
                        {item.isRatingQuestion && (
                          <Star className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500 fill-yellow-500" />
                        )}
                        {item.question}
                        {item.allowMultipleAnswers && (
                          <Badge
                            variant="outline"
                            className="ml-1 text-xs py-0 px-1.5 h-4"
                          >
                            Multiple
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[400px]">
                      <div className="w-full overflow-x-auto hide-scrollbar">
                        <div className="flex flex-wrap gap-2">
                          {answers && answers.length > 0 ? (
                            answers.map((answer, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-normal whitespace-nowrap"
                              >
                                {answer.answer}{" "}
                                <span className="text-muted-foreground ml-1">
                                  ({answer.count})
                                </span>
                              </Badge>
                            ))
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {item.topAnswer}{" "}
                              <span className="text-muted-foreground ml-1">
                                ({item.count})
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.type === "Dine-in"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : item.type === "Delivery"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }
                      >
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[400px]">
                      {renderBranchBadges(item.branch)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
