"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { Search, Settings2 } from "lucide-react";
import {
  inventoryApi,
  swrFetcher,
  type InventoryItem,
  type AdjustInventoryPayload,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function InventoryPage() {
  const [filters, setFilters] = useState({
    name: "",
    sku: "",
    customer_name: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    name: "",
    sku: "",
    customer_name: "",
  });

  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (appliedFilters.name) params.append("name", appliedFilters.name);
    if (appliedFilters.sku) params.append("sku", appliedFilters.sku);
    if (appliedFilters.customer_name)
      params.append("customer_name", appliedFilters.customer_name);
    const query = params.toString();
    return `/inventory${query ? `?${query}` : ""}`;
  }, [appliedFilters]);

  const {
    data: inventoryData,
    error,
    isLoading,
    mutate,
  } = useSWR<{ data: InventoryItem[]; message: string }>(
    buildQueryString(),
    swrFetcher,
  );
  const inventory = inventoryData?.data || [];

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjustForm, setAdjustForm] = useState<
    Omit<AdjustInventoryPayload, "product_id">
  >({
    new_physical_stock: 0,
    notes: "",
  });

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({ name: "", sku: "", customer_name: "" });
    setAppliedFilters({ name: "", sku: "", customer_name: "" });
  };

  const openAdjustDialog = (item: InventoryItem) => {
    setAdjustingItem(item);
    setAdjustForm({
      new_physical_stock: item.physical_stock,
      notes: "",
    });
    setIsAdjustOpen(true);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    setIsSubmitting(true);
    try {
      await inventoryApi.adjust({
        product_id: adjustingItem.product_id,
        new_physical_stock: adjustForm.new_physical_stock,
        notes: adjustForm.notes,
      });
      await mutate();
      setIsAdjustOpen(false);
      setAdjustingItem(null);
    } catch (err) {
      console.error("Failed to adjust inventory:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">
          Failed to load inventory. Make sure the backend is running.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">View and adjust stock levels</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Name</Label>
              <Input
                id="filter-name"
                placeholder="Search by name..."
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-sku">SKU</Label>
              <Input
                id="filter-sku"
                placeholder="Search by SKU..."
                value={filters.sku}
                onChange={(e) =>
                  setFilters({ ...filters, sku: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-customer">Customer Name</Label>
              <Input
                id="filter-customer"
                placeholder="Search by customer..."
                value={filters.customer_name}
                onChange={(e) =>
                  setFilters({ ...filters, customer_name: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>
            Current stock levels for all products
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="text-right">Physical Stock</TableHead>
                  <TableHead className="text-right">Available Stock</TableHead>
                  <TableHead className="w-25">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory && inventory.length > 0 ? (
                  inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.customer_name || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {item.physical_stock}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.available_stock}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAdjustDialog(item)}
                          title="Adjust Stock"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No inventory items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjust Inventory Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Physical Stock</DialogTitle>
            <DialogDescription>
              Adjusting stock for: {adjustingItem?.name} ({adjustingItem?.sku})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjust}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-stock">Current Physical Stock</Label>
                <Input
                  id="current-stock"
                  value={adjustingItem?.physical_stock || 0}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-stock">New Physical Stock *</Label>
                <Input
                  id="new-stock"
                  type="number"
                  min="0"
                  value={adjustForm.new_physical_stock}
                  onChange={(e) =>
                    setAdjustForm({
                      ...adjustForm,
                      new_physical_stock: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes *</Label>
                <Textarea
                  id="notes"
                  placeholder="Reason for adjustment (e.g., audit, damage, correction)"
                  value={adjustForm.notes}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, notes: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdjustOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                Adjust Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
