import { useAzureMonitor } from "@azure/monitor-opentelemetry";
import { trace } from "@opentelemetry/api";
import type { KernelEvent, KernelTelemetry } from "../kernel.js";

export interface AzureMonitorOptions {
  connectionString?: string;
  serviceName?: string;
  samplingRatio?: number;
}

export function initializeAzureMonitor(options: AzureMonitorOptions = {}): { enabled: boolean } {
  const connectionString = options.connectionString || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) return { enabled: false };
  useAzureMonitor({
    azureMonitorExporterOptions: { connectionString },
    samplingRatio: options.samplingRatio ?? 1,
    instrumentationOptions: { http: { enabled: true } },
  });
  return { enabled: true };
}

export class SafeKernelTelemetry implements KernelTelemetry {
  private readonly tracer;

  constructor(serviceName = "privatedao-payroll") {
    this.tracer = trace.getTracer(serviceName);
  }

  record(event: KernelEvent): void {
    const span = this.tracer.startSpan(event.name);
    span.setAttributes({
      "privatedao.execution_id": event.executionId || "",
      "privatedao.request_id": event.requestId || "",
      "privatedao.product": event.product || "",
      "privatedao.capability": event.capability || "",
      "privatedao.network": event.network || "",
      "privatedao.provider": event.provider || "",
      "privatedao.state": event.state || "",
      "privatedao.error_code": event.errorCode || "",
    });
    span.end(event.occurredAt ? new Date(event.occurredAt) : undefined);
  }
}
