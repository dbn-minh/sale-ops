import { crmSimulationData } from "@/lib/data/demo-data";
import { FakeCRMConnector } from "@/lib/crm/fake-crm-connector";
import { HubSpotConnector } from "@/lib/crm/hubspot-connector";
import { PipedriveConnector } from "@/lib/crm/pipedrive-connector";
import type { CRMProviderSummary } from "@/lib/crm/crm-connector";

export const currentCRMProvider = new FakeCRMConnector(() => crmSimulationData);
export const futureCRMProviders = [
  new HubSpotConnector(),
  new PipedriveConnector(),
];

export const currentCRMProviderSummary: CRMProviderSummary = {
  providerId: currentCRMProvider.providerId,
  providerName: currentCRMProvider.providerName,
  implementationName: currentCRMProvider.implementationName,
  connectionMode: currentCRMProvider.connectionMode,
  summary: currentCRMProvider.summary,
};

export const futureCRMProviderSummaries: CRMProviderSummary[] =
  futureCRMProviders.map((provider) => ({
    providerId: provider.providerId,
    providerName: provider.providerName,
    implementationName: provider.implementationName,
    connectionMode: provider.connectionMode,
    summary: provider.summary,
  }));

export const crmConnectionSafetyNotes = [
  "No real CRM credentials are used in demo mode.",
  "No real CRM records are changed in demo mode.",
  "A future pilot should begin with read-only access.",
  "Write-back should be limited to create task and add note first.",
] as const;
