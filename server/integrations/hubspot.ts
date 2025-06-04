import { z } from "zod";

// HubSpot API response schemas
export const HubSpotContactSchema = z.object({
  id: z.string(),
  properties: z.object({
    email: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    company: z.string().optional(),
    phone: z.string().optional(),
    jobtitle: z.string().optional(),
    hs_lead_status: z.string().optional(),
    createdate: z.string().optional(),
    lastmodifieddate: z.string().optional(),
  }),
});

export const HubSpotDealSchema = z.object({
  id: z.string(),
  properties: z.object({
    dealname: z.string().optional(),
    amount: z.string().optional(),
    dealstage: z.string().optional(),
    pipeline: z.string().optional(),
    closedate: z.string().optional(),
    createdate: z.string().optional(),
    hs_lastmodifieddate: z.string().optional(),
    hubspot_owner_id: z.string().optional(),
    description: z.string().optional(),
    hs_deal_stage_probability: z.string().optional(),
  }),
  associations: z.object({
    contacts: z.object({
      results: z.array(z.object({
        id: z.string(),
        type: z.string(),
      })),
    }).optional(),
    companies: z.object({
      results: z.array(z.object({
        id: z.string(),
        type: z.string(),
      })),
    }).optional(),
  }).optional(),
});

export const HubSpotActivitySchema = z.object({
  id: z.string(),
  properties: z.object({
    hs_activity_type: z.string().optional(),
    hs_timestamp: z.string().optional(),
    hs_body_preview: z.string().optional(),
    hubspot_owner_id: z.string().optional(),
    hs_attachment_ids: z.string().optional(),
  }),
});

export type HubSpotContact = z.infer<typeof HubSpotContactSchema>;
export type HubSpotDeal = z.infer<typeof HubSpotDealSchema>;
export type HubSpotActivity = z.infer<typeof HubSpotActivitySchema>;

export class HubSpotClient {
  private accessToken: string;
  private baseURL = 'https://api.hubapi.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all deals with associations
  async getDeals(limit = 100, after?: string) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: 'dealname,amount,dealstage,pipeline,closedate,createdate,hs_lastmodifieddate,hubspot_owner_id,description,hs_deal_stage_probability',
      associations: 'contacts,companies',
    });

    if (after) {
      params.append('after', after);
    }

    const response = await this.makeRequest(`/crm/v3/objects/deals?${params}`);
    return {
      results: response.results.map((deal: any) => HubSpotDealSchema.parse(deal)),
      paging: response.paging,
    };
  }

  // Get contacts
  async getContacts(limit = 100, after?: string) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: 'email,firstname,lastname,company,phone,jobtitle,hs_lead_status,createdate,lastmodifieddate',
    });

    if (after) {
      params.append('after', after);
    }

    const response = await this.makeRequest(`/crm/v3/objects/contacts?${params}`);
    return {
      results: response.results.map((contact: any) => HubSpotContactSchema.parse(contact)),
      paging: response.paging,
    };
  }

  // Get recent activities for a deal
  async getDealActivities(dealId: string) {
    const response = await this.makeRequest(`/crm/v3/objects/deals/${dealId}/associations/activities`);
    return response.results;
  }

  // Get owner information
  async getOwner(ownerId: string) {
    const response = await this.makeRequest(`/crm/v3/owners/${ownerId}`);
    return response;
  }

  // Search deals by criteria
  async searchDeals(criteria: {
    filters?: Array<{
      propertyName: string;
      operator: string;
      value: string;
    }>;
    sorts?: Array<{
      propertyName: string;
      direction: 'ASCENDING' | 'DESCENDING';
    }>;
    limit?: number;
  }) {
    const response = await this.makeRequest('/crm/v3/objects/deals/search', {
      method: 'POST',
      body: JSON.stringify({
        filterGroups: criteria.filters ? [{
          filters: criteria.filters,
        }] : [],
        sorts: criteria.sorts || [],
        properties: ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', 'createdate', 'hs_lastmodifieddate', 'hubspot_owner_id'],
        limit: criteria.limit || 100,
      }),
    });

    return response.results.map((deal: any) => HubSpotDealSchema.parse(deal));
  }

  // Get pipeline stages
  async getPipelines() {
    const response = await this.makeRequest('/crm/v3/pipelines/deals');
    return response.results;
  }

  // Test connection
  async testConnection() {
    try {
      await this.makeRequest('/crm/v3/objects/deals?limit=1');
      return { success: true, message: 'HubSpot connection successful' };
    } catch (error) {
      return { success: false, message: `HubSpot connection failed: ${error}` };
    }
  }
}