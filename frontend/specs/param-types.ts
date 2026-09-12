import type { BusinessType, Category, GroupBy, OperationType } from "./api-types";

/** Shared optional date range for metrics endpoints. */
export interface DateRangeFilter {
  /** Inclusive start date in YYYY-MM-DD format. */
  start_date?: string;
  /** Inclusive end date in YYYY-MM-DD format. */
  end_date?: string;
}

/** GET /api/metrics query parameters. */
export interface MetricsParams extends DateRangeFilter {
  category?: Category;
  operation_type?: OperationType;
}

/** GET /api/metrics/alerts query parameters. */
export interface AlertsParams extends DateRangeFilter {
  /** API default 0.3; OpenAPI minimum 0. Feature UI accepts 0.01 through 1.0. */
  threshold?: number;
  /** API default "month". */
  group_by?: GroupBy;
  business_type?: BusinessType;
}

/** GET /api/metrics/categories/top query parameters. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** API default "outcome"; Feature 3 must explicitly send "income". */
  operation_type?: OperationType;
  /** API default 5; valid integer range is 1 through 20. */
  limit?: number;
  business_type?: BusinessType;
}
