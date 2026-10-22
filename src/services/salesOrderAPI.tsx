
const API_BASE_URL =
  "https://hiring.harrisons.my/api/mock/sales-orders";

const API_KEY = "hssb-assessment-mock-2026";

const headers = {
  "x-assessment-key": API_KEY,
};

export interface SalesOrder {
  SalesId: string;
  SalesName: string;
  CustAccount: string;
  InventSiteId: string;
  SalesStatus: string;
  CreatedDateTime1: string;
  HAR_TotalSOAmount: number;
}

export interface SalesOrderSummary {
  total_orders: number;
  filtered_orders: number;
  open_orders: number;
  invoiced_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_order_value: number;
}

export interface SalesOrdersResponse {
  summary: SalesOrderSummary;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  data: SalesOrder[];
}

export interface SalesOrderFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  site?: string;
}

export async function getSalesOrders(
  filters: SalesOrderFilters = {},
): Promise<SalesOrdersResponse> {
  const params = new URLSearchParams();

  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 10));

  if (filters.q?.trim()) {
    params.set("q", filters.q.trim());
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.site) {
    params.set("site", filters.site);
  }

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`,
    { headers },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load sales orders (${response.status})`,
    );
  }

  return response.json() as Promise<SalesOrdersResponse>;
}

export async function getSalesOrderMeta() {
  const response = await fetch(`${API_BASE_URL}/meta`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load API metadata (${response.status})`,
    );
  }

  return response.json();
}
