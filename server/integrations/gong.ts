import { z } from "zod";

// Gong API response schemas
export const GongCallSchema = z.object({
  metaData: z.object({
    id: z.string(),
    url: z.string().optional(),
    title: z.string().optional(),
    scheduled: z.string().optional(),
    started: z.string().optional(),
    ended: z.string().optional(),
    duration: z.number().optional(),
    primaryUserId: z.string().optional(),
    direction: z.string().optional(),
    system: z.string().optional(),
    scope: z.string().optional(),
    media: z.string().optional(),
    language: z.string().optional(),
    workspaceId: z.string().optional(),
  }),
  context: z.object({
    scheduledMeeting: z.object({
      id: z.string().optional(),
      url: z.string().optional(),
      title: z.string().optional(),
    }).optional(),
    crmContext: z.array(z.object({
      id: z.string(),
      objectType: z.string(),
      objectFields: z.record(z.any()),
    })).optional(),
  }).optional(),
  parties: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    affiliation: z.string().optional(),
    emailAddress: z.string().optional(),
    phoneNumber: z.string().optional(),
    speakerId: z.string().optional(),
    context: z.array(z.object({
      system: z.string(),
      id: z.string(),
    })).optional(),
  })).optional(),
});

export const GongTranscriptSchema = z.object({
  callId: z.string(),
  transcript: z.array(z.object({
    speakerId: z.string(),
    topic: z.string().optional(),
    sentences: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
    })),
  })),
});

export const GongCallInsightSchema = z.object({
  callId: z.string(),
  insights: z.object({
    sentiment: z.object({
      overall: z.string().optional(),
      segments: z.array(z.object({
        start: z.number(),
        end: z.number(),
        sentiment: z.string(),
        confidence: z.number(),
      })).optional(),
    }).optional(),
    topics: z.array(z.object({
      name: z.string(),
      confidence: z.number(),
      mentions: z.array(z.object({
        start: z.number(),
        end: z.number(),
        text: z.string(),
      })),
    })).optional(),
    keywords: z.array(z.object({
      word: z.string(),
      count: z.number(),
      confidence: z.number(),
    })).optional(),
    questions: z.array(z.object({
      speaker: z.string(),
      question: z.string(),
      timestamp: z.number(),
    })).optional(),
    nextSteps: z.array(z.object({
      speaker: z.string(),
      action: z.string(),
      timestamp: z.number(),
    })).optional(),
  }),
});

export type GongCall = z.infer<typeof GongCallSchema>;
export type GongTranscript = z.infer<typeof GongTranscriptSchema>;
export type GongCallInsight = z.infer<typeof GongCallInsightSchema>;

export class GongClient {
  private accessToken: string;
  private baseURL = 'https://api.gong.io/v2';

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
      throw new Error(`Gong API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get calls within date range
  async getCalls(params: {
    fromDateTime?: string;
    toDateTime?: string;
    cursor?: string;
    limit?: number;
    contentSelector?: {
      includeCrmContext?: boolean;
      includeParties?: boolean;
      includeMedia?: boolean;
    };
  } = {}) {
    const requestBody = {
      filter: {
        fromDateTime: params.fromDateTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        toDateTime: params.toDateTime || new Date().toISOString(),
      },
      contentSelector: params.contentSelector || {
        includeCrmContext: true,
        includeParties: true,
        includeMedia: false,
      },
      cursor: params.cursor,
      limit: params.limit || 100,
    };

    const response = await this.makeRequest('/calls', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    return {
      calls: response.calls?.map((call: any) => GongCallSchema.parse(call)) || [],
      records: response.records || {},
      cursor: response.cursor,
    };
  }

  // Get call transcript
  async getCallTranscript(callId: string) {
    const response = await this.makeRequest(`/calls/${callId}/transcript`);
    return GongTranscriptSchema.parse({
      callId,
      transcript: response.callTranscript || [],
    });
  }

  // Get call insights and analytics
  async getCallInsights(callId: string) {
    try {
      const [sentiment, topics, keywords] = await Promise.all([
        this.getCallSentiment(callId),
        this.getCallTopics(callId),
        this.getCallKeywords(callId),
      ]);

      return GongCallInsightSchema.parse({
        callId,
        insights: {
          sentiment,
          topics,
          keywords,
        },
      });
    } catch (error) {
      console.warn(`Failed to get insights for call ${callId}:`, error);
      return GongCallInsightSchema.parse({
        callId,
        insights: {},
      });
    }
  }

  // Get call sentiment analysis
  private async getCallSentiment(callId: string) {
    try {
      const response = await this.makeRequest(`/calls/${callId}/extensive`);
      return response.sentiment || {};
    } catch (error) {
      return {};
    }
  }

  // Get call topics
  private async getCallTopics(callId: string) {
    try {
      const response = await this.makeRequest(`/calls/${callId}/extensive`);
      return response.topics || [];
    } catch (error) {
      return [];
    }
  }

  // Get call keywords
  private async getCallKeywords(callId: string) {
    try {
      const response = await this.makeRequest(`/calls/${callId}/extensive`);
      return response.keywords || [];
    } catch (error) {
      return [];
    }
  }

  // Search calls by CRM context
  async searchCallsByCRM(crmId: string, crmSystem: string = 'hubspot') {
    const requestBody = {
      filter: {
        crmContext: {
          id: crmId,
          system: crmSystem,
        },
      },
      contentSelector: {
        includeCrmContext: true,
        includeParties: true,
      },
    };

    const response = await this.makeRequest('/calls', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    return response.calls?.map((call: any) => GongCallSchema.parse(call)) || [];
  }

  // Get user stats
  async getUserStats(userId: string, fromDate: string, toDate: string) {
    const response = await this.makeRequest('/stats/activity/detailed', {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          fromDateTime: fromDate,
          toDateTime: toDate,
          users: [userId],
        },
      }),
    });

    return response.records || [];
  }

  // Get calls for specific users (for team management)
  async getTeamCalls(userIds: string[], fromDate?: string, toDate?: string) {
    const requestBody = {
      filter: {
        fromDateTime: fromDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        toDateTime: toDate || new Date().toISOString(),
        users: userIds,
      },
      contentSelector: {
        includeCrmContext: true,
        includeParties: true,
      },
    };

    const response = await this.makeRequest('/calls', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    return response.calls?.map((call: any) => GongCallSchema.parse(call)) || [];
  }

  // Test connection
  async testConnection() {
    try {
      await this.makeRequest('/calls', {
        method: 'POST',
        body: JSON.stringify({
          filter: {
            fromDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            toDateTime: new Date().toISOString(),
          },
          limit: 1,
        }),
      });
      return { success: true, message: 'Gong connection successful' };
    } catch (error) {
      return { success: false, message: `Gong connection failed: ${error}` };
    }
  }
}