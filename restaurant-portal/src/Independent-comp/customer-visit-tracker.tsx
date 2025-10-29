"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { UserCheck, Calendar, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface CustomerVisit {
  id: string;
  phoneNumber: string;
  visitDate: string;
  branch: string;
}

interface CustomerVisitTrackerProps {
  phoneNumber: string;
  onVisitAdded: () => void;
  selectedBranch?: string;
}

export function CustomerVisitTracker({
  phoneNumber,
  onVisitAdded,
  selectedBranch,
}: CustomerVisitTrackerProps) {
  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVisitedToday, setHasVisitedToday] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer visits on component mount
  // useEffect(() => {
  //   if (phoneNumber) {
  //     fetchCustomerVisits()
  //   }
  // }, [phoneNumber])

  // Check if customer has already visited today
  // useEffect(() => {
  //   if (visits.length > 0) {
  //     const today = new Date().toISOString().split("T")[0]
  //     const visitedToday = visits.some(visit => visit.visitDate.startsWith(today))
  //     setHasVisitedToday(visitedToday)
  //   }
  // }, [visits])

  // Fetch customer visits from backend (mocked)
  const fetchCustomerVisits = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data - in a real app, this would come from your backend
      const mockVisits: CustomerVisit[] = [];

      setVisits(mockVisits);
    } catch (err) {
      console.error("Error fetching customer visits:", err);
      setError("Failed to fetch customer visit history");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new visit for the customer
  const addVisit = async () => {
    if (hasVisitedToday) {
      toast({
        title: "Visit already recorded",
        description: "This customer has already visited today",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newVisit: CustomerVisit = {
        id: `v${Date.now()}`,
        phoneNumber,
        visitDate: new Date().toISOString(),
        branch: selectedBranch || "Gulberg",
      };

      setVisits((prev) => [newVisit, ...prev]);

      toast({
        title: "Visit recorded",
        description: "Customer visit has been successfully recorded",
      });

      onVisitAdded();
    } catch (err) {
      console.error("Error adding customer visit:", err);
      toast({
        title: "Error",
        description: "Failed to record customer visit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Visit Tracker</h3>
          <p className="text-sm text-muted-foreground">
            Track and manage customer visits for loyalty rewards
          </p>
        </div>
        <Badge variant="outline" className="px-2 py-1">
          {visits.length} Total Visits
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasVisitedToday && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Already Visited Today</AlertTitle>
          <AlertDescription>
            This customer has already visited today. Only one visit can be
            recorded per day.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Visit History</CardTitle>
          <CardDescription>Recent visits by this customer</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading visit history...
            </div>
          ) : visits.length > 0 ? (
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{visit.branch}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(visit.visitDate).toLocaleDateString()}
                        </span>
                        <Clock className="h-3 w-3 ml-1" />
                        <span>
                          {new Date(visit.visitDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatDistanceToNow(new Date(visit.visitDate), {
                      addSuffix: true,
                    })}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No visit history found
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        onClick={addVisit}
        disabled={isLoading || hasVisitedToday}
      >
        {isLoading ? "Recording Visit..." : "Record New Visit"}
      </Button>
    </div>
  );
}
