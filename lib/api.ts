const BASE_URL = "http://localhost:8080/api/v1";

// Generic fetch wrapper
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "An error occurred");
  }

  return response.json();
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  customer_name?: string;
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  customer_name?: string;
}

export interface UpdateProductPayload {
  name: string;
  customer_name?: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  customer_name?: string;
  physical_stock: number;
  available_stock: number;
}

export interface AdjustInventoryPayload {
  product_id: string;
  new_physical_stock: number;
  notes: string;
}

// Transaction Types
export interface TransactionItem {
  product_id: string;
  product?: Product;
  quantity: number;
  product_name?: string;
}

export interface StockInTransaction {
  id: string;
  status: "CREATED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  items: TransactionItem[];
  created_at?: string;
}

export interface StockOutTransaction {
  id: string;
  status: "ALLOCATED" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  items: TransactionItem[];
  created_at?: string;
}

export interface ReportTransaction {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT";
  status: "DONE" | "CANCELLED";
  items: TransactionItem[];
  created_at?: string;
}

// Products API
export const productsApi = {
  getAll: () => fetcher<Product[]>("/products"),
  create: (data: CreateProductPayload) =>
    fetcher<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateProductPayload) =>
    fetcher<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Inventory API
export const inventoryApi = {
  getAll: (filters?: {
    name?: string;
    sku?: string;
    customer_name?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.name) params.append("name", filters.name);
    if (filters?.sku) params.append("sku", filters.sku);
    if (filters?.customer_name)
      params.append("customer_name", filters.customer_name);
    const query = params.toString();
    return fetcher<InventoryItem[]>(`/inventory${query ? `?${query}` : ""}`);
  },
  adjust: (data: AdjustInventoryPayload) =>
    fetcher<void>("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Stock In API
export const stockInApi = {
  getAll: () => fetcher<StockInTransaction[]>("/stock-in"),
  create: (items: { product_id: string; quantity: number }[]) =>
    fetcher<StockInTransaction>("/stock-in", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  updateStatus: (id: string, status: "IN_PROGRESS" | "DONE" | "CANCELLED") =>
    fetcher<StockInTransaction>(`/stock-in/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Stock Out API
export const stockOutApi = {
  getAll: () => fetcher<StockOutTransaction[]>("/stock-out"),
  allocate: (items: { product_id: string; quantity: number }[]) =>
    fetcher<StockOutTransaction>("/stock-out/allocate", {
      method: "POST",
      body: JSON.stringify({ items }),
    }),
  updateStatus: (id: string, status: "IN_PROGRESS" | "DONE" | "CANCELLED") =>
    fetcher<StockOutTransaction>(`/stock-out/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Reports API
export const reportsApi = {
  getAll: () => fetcher<ReportTransaction[]>("/reports"),
};

// SWR Fetcher
export const swrFetcher = async (url: string) => {
  const response = await fetch(`${BASE_URL}${url}`);
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return response.json();
};
