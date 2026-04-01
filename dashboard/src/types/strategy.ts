export type ParamType = "integer" | "float" | "boolean" | "enum" | "string";

export interface ParamSchema {
  label: string;
  type: ParamType;
  default: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface RiskLimits {
  max_position_pct: number;
  daily_loss_limit: number;
  max_open_trades: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  symbol: string;
  parameters: Record<string, ParamSchema>;
  risk_limits: RiskLimits;
  current_params: Record<string, number | boolean | string>;
}
