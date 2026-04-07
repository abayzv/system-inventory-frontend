"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Play, CheckCircle, XCircle } from "lucide-react";
import {
  stockInApi,
  swrFetcher,
  type StockInTransaction,
  type Product,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function StockInPage() {
  const { data: productData } = useSWR<{ data: Product[]; message: string }>(
    "/products",
    swrFetcher,
  );
  const products = productData?.data || [];
  console.log("Products:", products); // Debug log for products data
  const {
    data: stockInTransactions,
    error,
    isLoading,
    mutate,
  } = useSWR<{ data: StockInTransaction[]; message: string }>(
    "/stock-in",
    swrFetcher,
  );
  const transactions = stockInTransactions?.data || [];

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !quantity) return;

    setIsCreating(true);
    try {
      await stockInApi.create([
        { product_id: selectedProduct, quantity: parseInt(quantity) },
      ]);
      await mutate();
      setSelectedProduct("");
      setQuantity("");
    } catch (err) {
      console.error("Failed to create stock in:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "IN_PROGRESS" | "DONE" | "CANCELLED",
  ) => {
    setUpdatingId(id);
    try {
      await stockInApi.updateStatus(id, status);
      await mutate();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return <Badge variant="secondary">Created</Badge>;
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-500 text-white hover:bg-blue-600">
            In Progress
          </Badge>
        );
      case "DONE":
        return (
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Done
          </Badge>
        );
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProductName = (productId: string) => {
    const product = products?.find((p) => p.id === productId);
    return product?.name || productId;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">
          Failed to load data. Make sure the backend is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock In</h1>
        <p className="text-muted-foreground">
          Receive inventory into the warehouse
        </p>
      </div>

      {/* Create Stock In Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Stock In
          </CardTitle>
          <CardDescription>Add items to incoming stock</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-32 space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={isCreating || !selectedProduct || !quantity}
            >
              {isCreating && <Spinner className="mr-2 h-4 w-4" />}
              Create Stock In
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Stock In Transactions</CardTitle>
          <CardDescription>
            Manage transactions that are not yet completed or cancelled
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
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {tx.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              {getProductName(item.product_id)} x{" "}
                              {item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {tx.status === "CREATED" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(tx.id, "IN_PROGRESS")
                                }
                                disabled={updatingId === tx.id}
                              >
                                {updatingId === tx.id ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  <Play className="mr-1 h-4 w-4" />
                                )}
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusUpdate(tx.id, "CANCELLED")
                                }
                                disabled={updatingId === tx.id}
                              >
                                {updatingId === tx.id ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  <XCircle className="mr-1 h-4 w-4" />
                                )}
                                Cancel
                              </Button>
                            </>
                          )}
                          {tx.status === "IN_PROGRESS" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  handleStatusUpdate(tx.id, "DONE")
                                }
                                disabled={updatingId === tx.id}
                              >
                                {updatingId === tx.id ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                )}
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleStatusUpdate(tx.id, "CANCELLED")
                                }
                                disabled={updatingId === tx.id}
                              >
                                {updatingId === tx.id ? (
                                  <Spinner className="h-4 w-4" />
                                ) : (
                                  <XCircle className="mr-1 h-4 w-4" />
                                )}
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No active stock in transactions
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
