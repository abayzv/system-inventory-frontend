"use client";

import useSWR from "swr";
import { FileText, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { swrFetcher, type ReportTransaction } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function ReportsPage() {
  const {
    data: reportsData,
    error,
    isLoading,
  } = useSWR<{ data: ReportTransaction[]; message: string }>(
    "/reports",
    swrFetcher,
  );

  const reports = reportsData?.data || [];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "STOCK_IN":
        return (
          <Badge variant="outline" className="gap-1">
            <ArrowDownToLine className="h-3 w-3" />
            Stock In
          </Badge>
        );
      case "STOCK_OUT":
        return (
          <Badge variant="outline" className="gap-1">
            <ArrowUpFromLine className="h-3 w-3" />
            Stock Out
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">
          Failed to load reports. Make sure the backend is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Transaction Reports
        </h1>
        <p className="text-muted-foreground">
          View completed and cancelled transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            All completed (DONE) and cancelled transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-sm">
                        {report.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(report.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {report.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">
                                {item.product?.name || item.product_id}
                              </span>
                              <span className="text-muted-foreground">
                                {" "}
                                x {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No completed transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
