# Sales Order Monitoring Dashboard

A responsive web dashboard developed as part of the IT Executive assessment. The application connects to a mock Sales Orders API to display sales order summaries and records, with search, filtering, and pagination features.

## Features

- **Sales order summary:** Displays total orders, open orders, invoiced orders, delivered orders, cancelled orders, and total order value.
- **Search:** Search sales orders using supported order and customer-related fields.
- **Filtering:** Filter sales orders by order status and site.
- **Pagination:** Navigate between result pages and select the number of rows displayed per page (10, 25, 50, or 100).
- **Loading state:** Provides feedback while data is being retrieved.
- **Empty state:** Displays feedback when no records match the selected search or filters.
- **Error handling:** Shows an error message and provides a retry option when a request fails.
- **Responsive layout:** Uses a responsive layout for desktop and mobile screens.
- **Read-only integration:** Retrieves data from the provided mock API without modifying sales order records.

## Technology Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- TailAdmin React Dashboard
- Fetch API
- REST API

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js (a version compatible with the project's dependencies)
- npm
- Git (optional, for cloning the repository)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AlexPhang-M/free-react-tailwind-admin-dashboard
   ```

2. Navigate to the project directory:

   ```bash
   cd free-react-tailwind-admin-dashboard
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in the terminal, usually `http://localhost:5173`.

### Production Build

To create a production build, run:

```bash
npm run build
```

The generated production files are normally placed in the `dist` directory.

## API Integration

The dashboard retrieves sales order data from the assessment's mock API.

**API endpoint**

```text
https://hiring.harrisons.my/api/mock/sales-orders
```

**Authentication**

Requests use the assessment API key through the `x-assessment-key` HTTP header. The key is configured in the API service file.

**Supported query parameters**

| Parameter | Purpose |
|---|---|
| `page` | Selects the result page |
| `pageSize` | Controls the number of records returned per page |
| `q` | Searches supported sales order and customer fields |
| `status` | Filters records by sales order status |
| `site` | Filters records by site |
| `sort` | Specifies the sort field, where supported |
| `order` | Specifies the sort direction, where supported |

The dashboard uses the API response for its summary metrics, filtered records, and pagination information rather than relying on hard-coded dashboard values.

The API metadata endpoint (`/meta`) is also used to retrieve available filter options.

## Project Structure

The main application files are organised as follows:

```text
src/
├── layout/
│   └── AppSidebar.tsx
├── pages/
│   └── Dashboard/
│       └── SalesOrderMonitoring.tsx
├── services/
│   └── salesOrdersApi.ts
├── App.tsx
└── main.tsx
```

- `SalesOrderMonitoring.tsx` — Renders the dashboard, summary metrics, search and filter controls, sales orders table, and pagination.
- `salesOrdersApi.ts` — Handles API requests, query parameters, and TypeScript response types.
- `App.tsx` — Configures application routes.
- `AppSidebar.tsx` — Configures the sidebar navigation.

## Error Handling and Limitations

- Data availability depends on the assessment API.
- Network failures and unsuccessful API responses are handled by the dashboard's error state.
- Search and filtering depend on the fields and options supported by the API.
- The application is intended for the provided assessment API and is not a production sales management system.
- The assessment API key is used by the frontend. Because frontend code can be inspected by users, this approach should only be used with credentials intended for client-side assessment use. Production secrets should be kept on a backend server.

## Architecture Overview

1. The user opens the dashboard.
2. The React application requests sales order data from the mock API.
3. The API service passes search, filter, and pagination parameters to the endpoint.
4. The API returns summary information, matching records, and pagination metadata.
5. The dashboard renders the results and updates them when the user changes search terms, filters, or page settings.

## Testing

The following behaviours should be verified before submission:

- Summary metrics match the API response.
- Search returns the expected matching records.
- Site and status filters work individually and together.
- Changing the page size resets pagination appropriately.
- Previous and Next navigation respect page boundaries.
- Loading, empty, and error states display correctly.
- The Retry button triggers another request.
- The dashboard remains usable on desktop and mobile screen sizes.
- The production build completes successfully.

## AI Assistance Disclosure

AI tools were used to assist with implementation guidance, code troubleshooting, and documentation. The application was reviewed and tested by the developer, who remains responsible for the final implementation and submission.
