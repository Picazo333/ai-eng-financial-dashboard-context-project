export type OperationType = "income" | "outcome";
export type Category = "suppliers" | "sales" | "operational" | "administrative" | "others";
export type BusinessType = "B2B" | "B2C";
export type GroupBy = "day" | "week" | "month";

/** GET /api/metrics item. */
export interface FinancialMovement {
  /** YYYY-MM-DD */
  create_date: string;
  amount: number;
  operation_type: OperationType;
  category: Category;
  business_type: BusinessType;
}

export type MetricsResponse = FinancialMovement[];

/** GET /api/metrics/facets response. */
export interface FacetsResponse {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  /** YYYY-MM-DD */
  min_date: string;
  /** YYYY-MM-DD */
  max_date: string;
}

/** GET /api/metrics/alerts item. */
export interface AlertEntry {
  period: string;
  outcome_total: number;
  baseline_average: number;
  increase_ratio: number;
}

export type AlertsResponse = AlertEntry[];

/** GET /api/metrics/categories/top item. */
export interface CategoryEntry {
  category: Category;
  operation_type: OperationType;
  total_amount: number;
}

export type TopCategoriesResponse = CategoryEntry[];
