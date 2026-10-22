
import { useEffect, useState } from "react";
import PageMeta from "@/components/common/PageMeta";
import {
  getSalesOrderMeta,
  getSalesOrders,
  type SalesOrder,
  type SalesOrderSummary,
} from "@/services/salesOrderAPI";

type Facet = {
  value: string;
  count: number;
};

type SalesOrderMeta = {
  facets?: {
    statuses?: Facet[];
    sites?: Facet[];
  };
};

const emptySummary: SalesOrderSummary = {
  total_orders: 0,
  filtered_orders: 0,
  open_orders: 0,
  invoiced_orders: 0,
  delivered_orders: 0,
  cancelled_orders: 0,
  total_order_value: 0,
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);

const date = (value: string) => {
  if (!value) return "—";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Open order":
      "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    Invoiced:
      "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
    Delivered:
      "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400",
    Cancelled:
      "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ??
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
      }`}
    >
      {status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

export default function SalesOrderMonitoring() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [summary, setSummary] =
    useState<SalesOrderSummary>(emptySummary);
  const [meta, setMeta] = useState<SalesOrderMeta>({});
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [site, setSite] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Load valid filter options from the API.
  useEffect(() => {
    getSalesOrderMeta()
      .then((result: SalesOrderMeta) => setMeta(result))
      .catch(() => {
        // The order list can still work if metadata fails.
      });
  }, []);

  // Wait briefly after typing before searching the API.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Fetch a page of orders whenever the filters or page change.
  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const result = await getSalesOrders({
          page,
          pageSize,
          q: search,
          status,
          site,
        });

        if (cancelled) return;

        setOrders(result.data ?? []);
        setSummary(result.summary ?? emptySummary);
        setTotalPages(Math.max(1, result.totalPages ?? 1));
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load sales orders.",
        );
        setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, status, site, reloadKey]);

  function changeStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function changeSite(value: string) {
    setSite(value);
    setPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setSite("");
    setPage(1);
  }

  return (
    <>
      <PageMeta
        title="Sales Order Monitoring | Harrisons Sabah"
        description="Monitor sales orders, statuses and order values."
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Sales Order Monitoring
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monitor sales order status and value across sites.
            </p>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {summary.total_orders.toLocaleString()} total orders
          </span>
        </div>

        {/* Dashboard metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="Total Orders"
            value={summary.total_orders.toLocaleString()}
            description="Orders in the dataset"
          />
          <MetricCard
            title="Open Orders"
            value={summary.open_orders.toLocaleString()}
            description="Awaiting completion"
          />
          <MetricCard
            title="Invoiced Orders"
            value={summary.invoiced_orders.toLocaleString()}
            description="Orders invoiced"
          />
          <MetricCard
            title="Delivered Orders"
            value={summary.delivered_orders.toLocaleString()}
            description="Orders delivered"
          />
          <MetricCard
            title="Cancelled Orders"
            value={summary.cancelled_orders.toLocaleString()}
            description="Orders cancelled"
          />
          <MetricCard
            title="Total Order Value"
            value={money(summary.total_order_value)}
            description="Total value across the dataset"
          />
        </div>

        {/* Search and filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales Orders
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search by order, customer, reference or sales taker.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search sales orders..."
              aria-label="Search sales orders"
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:text-white md:col-span-2"
            />

            <select
              value={status}
              onChange={(event) => changeStatus(event.target.value)}
              aria-label="Filter by status"
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All statuses</option>
              {(meta.facets?.statuses ?? []).map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </option>
              ))}
            </select>

            <select
              value={site}
              onChange={(event) => changeSite(event.target.value)}
              aria-label="Filter by site"
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All sites</option>
              {(meta.facets?.sites ?? []).map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value} ({item.count})
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
              }}
              aria-label="Rows per page"
              className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {summary.filtered_orders.toLocaleString()} matching orders
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Orders table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.02]">
                <tr className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <th className="px-5 py-4 font-medium">Sales Order</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Site</th>
                  <th className="px-5 py-4 font-medium">Created Date</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      Loading sales orders...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-red-600"
                    >
                      {error}
                      <button
                        type="button"
                        onClick={() => setReloadKey((key) => key + 1)}
                        className="ml-2 underline"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No sales orders match your search or filters.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.SalesId}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900 dark:text-white">
                        {order.SalesId}
                        <p className="mt-1 text-xs font-normal text-gray-500">
                          {order.CustAccount}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {order.SalesName}
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                        {order.InventSiteId}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-700 dark:text-gray-300">
                        {date(order.CreatedDateTime1)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.SalesStatus} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {money(Number(order.HAR_TotalSOAmount) || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
