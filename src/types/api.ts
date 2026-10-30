export type ApiEnvelope<T> = { data: T; meta?: unknown };
export type ApiListMeta = { page: number; pageSize: number; total: number };
export type ApiListEnvelope<T> = { data: T[]; meta: ApiListMeta };
export type ApiErrorDetails = Array<Record<string, unknown>>;
export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetails;
};

export type CurrencyCode = string;
export type ISODateString = string;
export type MoneyString = string;
export type UUID = string;

export type User = {
  id: UUID;
  email: string;
  name: string;  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Organization = {
  id: UUID;
  name: string;
  currency: CurrencyCode;
  timezone: string;
  role?: "OWNER" | "MEMBER";
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type AuthTokens = {
  accessToken: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

export type SessionUser = User;

export type ImportType = "ORDERS" | "PRODUCTS";
export type ImportStatus = "UPLOADED" | "MAPPED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type ImportRowError = {
  row: number;
  field?: string;
  reason: string;
};

export type ImportMapping = Record<string, string | null>;

export type Import = {
  id: UUID;
  organizationId: UUID;
  type: ImportType;
  fileName?: string;
  originalFileName?: string;
  status: ImportStatus;
  mapping?: ImportMapping | null;
  columnMapping?: ImportMapping | null;
  suggestedMapping?: ImportMapping | null;
  detectedHeaders?: string[];
  rowCount?: number | null;
  totalRows?: number | null;
  processedCount?: number | null;
  processedRows?: number | null;
  failedCount?: number | null;
  failedRows?: number | null;
  errors?: ImportRowError[] | null;
  completedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
};

export type Product = {
  id: UUID;
  organizationId: UUID;
  sku?: string | null;
  name: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type OrderItem = {
  id: UUID;
  orderId: UUID;
  productId?: UUID | null;
  quantity: number;
  unitPrice: MoneyString;
  lineTotal: MoneyString;
};

export type Order = {
  id: UUID;
  organizationId: UUID;
  orderNumber?: string | null;
  orderDate: ISODateString;
  customerId?: string | null;
  subtotal?: MoneyString | null;
  tax?: MoneyString | null;
  shipping?: MoneyString | null;
  discount?: MoneyString | null;
  total?: MoneyString | null;
  status?: string | null;
  items?: OrderItem[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type MetricsPeriod = {
  start: ISODateString;
  end: ISODateString;
};

export type MetricsOverview = {
  revenue: MoneyString;
  orders: number;
  averageOrderValue: MoneyString;
  previousRevenue: MoneyString;
  previousOrders: number;
  previousAverageOrderValue: MoneyString;
  revenueChangePct?: number | null;
  ordersChangePct?: number | null;
  aovChangePct?: number | null;
  period: MetricsPeriod;
  previousPeriod: MetricsPeriod;
  dataThrough?: ISODateString | null;
};

export type AnalysisRunStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type AnalysisRun = {
  id: UUID;
  organizationId: UUID;
  status: AnalysisRunStatus;
  triggeredBy?: string | null;
  findingsCount?: number | null;
  errorMessage?: string | null;
  startedAt?: ISODateString | null;
  completedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type FindingSeverity = "HIGH" | "MEDIUM";
export type FindingStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";
export type FindingType = string;

export type FindingEvidence = Record<string, unknown>;

export type Finding = {
  id: UUID;
  organizationId: UUID;
  analysisRunId?: UUID | null;
  type: FindingType;
  severity: FindingSeverity;
  status: FindingStatus;
  title: string;
  description?: string | null;
  subjectKey?: string | null;
  ruleVersion?: string | null;
  changePct?: number | null;
  evidence?: FindingEvidence | null;
  explanation?: any;
  notes?: any[];
  detectedAt?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type FindingExplanation = {
  id: UUID;
  findingId: UUID;
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
  summary?: string | null;
  observedFacts?: string[] | null;
  associatedSignals?: string[] | null;
  possibleExplanations?: string[] | null;
  investigationSteps?: string[] | null;
  whatWeDontKnow?: string[] | null;
  rawText?: string | null;
  errorMessage?: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type FindingNote = {
  id: UUID;
  findingId: UUID;
  authorId: UUID;
  authorName?: string | null;
  body: string;
  content?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type DashboardSummary = {
  openFindingsCount: number;
  highSeverityCount: number;
  latestAnalysisRun?: AnalysisRun | null;
  needsAttention?: Finding[] | null;
};

export type Dashboard = {
  summary: DashboardSummary;
  metrics: MetricsOverview;
  findings: Finding[];
};