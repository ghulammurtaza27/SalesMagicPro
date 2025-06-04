import OpenAI from 'openai';
import { z } from 'zod';
import type { HubSpotDeal, HubSpotContact } from './hubspot';
import type { GongCall, GongTranscript, GongCallInsight } from './gong';

// AI Analysis Schemas
export const DealAnalysisSchema = z.object({
  dealId: z.string(),
  riskScore: z.number().min(0).max(100),
  riskFactors: z.array(z.string()),
  nextBestActions: z.array(z.object({
    action: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    reasoning: z.string(),
  })),
  healthIndicators: z.object({
    engagement: z.number().min(0).max(100),
    momentum: z.number().min(0).max(100),
    stakeholderAlignment: z.number().min(0).max(100),
  }),
  predictedCloseDate: z.string().optional(),
  closeProbability: z.number().min(0).max(100),
});

export const CallAnalysisSchema = z.object({
  callId: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  keyInsights: z.array(z.string()),
  objections: z.array(z.object({
    objection: z.string(),
    response: z.string(),
    resolved: z.boolean(),
  })),
  nextSteps: z.array(z.string()),
  coachingPoints: z.array(z.object({
    area: z.string(),
    feedback: z.string(),
    improvement: z.string(),
  })),
  talkRatio: z.object({
    prospect: z.number(),
    rep: z.number(),
  }),
});

export const TeamInsightSchema = z.object({
  period: z.string(),
  teamMetrics: z.object({
    totalCalls: z.number(),
    avgCallDuration: z.number(),
    conversionRate: z.number(),
    avgDealSize: z.number(),
  }),
  topPerformers: z.array(z.object({
    userId: z.string(),
    name: z.string(),
    metric: z.string(),
    value: z.number(),
  })),
  riskAlerts: z.array(z.object({
    type: z.enum(['deal_stagnant', 'low_activity', 'negative_sentiment']),
    description: z.string(),
    dealId: z.string().optional(),
    userId: z.string().optional(),
  })),
  recommendations: z.array(z.object({
    category: z.string(),
    suggestion: z.string(),
    impact: z.enum(['high', 'medium', 'low']),
  })),
});

export type DealAnalysis = z.infer<typeof DealAnalysisSchema>;
export type CallAnalysis = z.infer<typeof CallAnalysisSchema>;
export type TeamInsight = z.infer<typeof TeamInsightSchema>;

export class AIEngine {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  // Analyze a single deal with HubSpot data and related Gong calls
  async analyzeDeal(deal: HubSpotDeal, relatedCalls: GongCall[], contacts: HubSpotContact[]): Promise<DealAnalysis> {
    const prompt = this.buildDealAnalysisPrompt(deal, relatedCalls, contacts);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert sales analyst. Analyze the deal data and provide actionable insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return DealAnalysisSchema.parse(analysis);
  }

  // Analyze a call with transcript and context
  async analyzeCall(call: GongCall, transcript: GongTranscript, insights: GongCallInsight): Promise<CallAnalysis> {
    const prompt = this.buildCallAnalysisPrompt(call, transcript, insights);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert sales coach. Analyze the call and provide coaching insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return CallAnalysisSchema.parse(analysis);
  }

  // Generate team-wide insights
  async generateTeamInsights(
    deals: HubSpotDeal[],
    calls: GongCall[],
    timeframe: string = '30d'
  ): Promise<TeamInsight> {
    const prompt = this.buildTeamInsightPrompt(deals, calls, timeframe);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a sales operations expert. Analyze team performance and provide strategic insights in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const insights = JSON.parse(completion.choices[0].message.content || '{}');
    return TeamInsightSchema.parse(insights);
  }

  // Answer natural language questions about sales data
  async answerSalesQuestion(
    question: string,
    context: {
      deals: HubSpotDeal[];
      calls: GongCall[];
      contacts: HubSpotContact[];
    }
  ): Promise<string> {
    const contextPrompt = this.buildContextualPrompt(context);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI sales assistant with access to CRM and call data. Provide accurate, actionable answers based on the data provided."
        },
        {
          role: "user",
          content: `Context:\n${contextPrompt}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content || "I couldn't process that question.";
  }

  // Generate follow-up recommendations
  async generateFollowUpRecommendations(
    deal: HubSpotDeal,
    recentCalls: GongCall[],
    daysSinceLastContact: number
  ): Promise<string[]> {
    const prompt = `
    Deal: ${deal.properties.dealname} - $${deal.properties.amount} - Stage: ${deal.properties.dealstage}
    Days since last contact: ${daysSinceLastContact}
    Recent calls: ${recentCalls.length}
    
    Generate 3-5 specific follow-up recommendations for this deal.
    `;
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a sales strategist. Provide specific, actionable follow-up recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
    });

    const response = completion.choices[0].message.content || '';
    return response.split('\n').filter(line => line.trim().length > 0);
  }

  private buildDealAnalysisPrompt(deal: HubSpotDeal, calls: GongCall[], contacts: HubSpotContact[]): string {
    return `
    Analyze this deal and provide insights in JSON format:
    
    Deal Data:
    - Name: ${deal.properties.dealname}
    - Amount: $${deal.properties.amount}
    - Stage: ${deal.properties.dealstage}
    - Created: ${deal.properties.createdate}
    - Last Modified: ${deal.properties.hs_lastmodifieddate}
    - Probability: ${deal.properties.hs_deal_stage_probability}%
    
    Related Calls: ${calls.length} calls
    ${calls.map(call => `- ${call.metaData.started}: ${call.metaData.duration}min`).join('\n')}
    
    Contacts: ${contacts.length} contacts
    
    Provide analysis with:
    {
      "dealId": "${deal.id}",
      "riskScore": <0-100>,
      "riskFactors": ["factor1", "factor2"],
      "nextBestActions": [{"action": "...", "priority": "high/medium/low", "reasoning": "..."}],
      "healthIndicators": {"engagement": <0-100>, "momentum": <0-100>, "stakeholderAlignment": <0-100>},
      "predictedCloseDate": "YYYY-MM-DD",
      "closeProbability": <0-100>
    }
    `;
  }

  private buildCallAnalysisPrompt(call: GongCall, transcript: GongTranscript, insights: GongCallInsight): string {
    return `
    Analyze this sales call and provide coaching insights in JSON format:
    
    Call Data:
    - Duration: ${call.metaData.duration} minutes
    - Participants: ${call.parties?.length || 0}
    - Direction: ${call.metaData.direction}
    
    Transcript Summary: ${transcript.transcript.length} segments
    
    Provide analysis with:
    {
      "callId": "${call.metaData.id}",
      "sentiment": "positive/neutral/negative",
      "keyInsights": ["insight1", "insight2"],
      "objections": [{"objection": "...", "response": "...", "resolved": true/false}],
      "nextSteps": ["step1", "step2"],
      "coachingPoints": [{"area": "...", "feedback": "...", "improvement": "..."}],
      "talkRatio": {"prospect": <percentage>, "rep": <percentage>}
    }
    `;
  }

  private buildTeamInsightPrompt(deals: HubSpotDeal[], calls: GongCall[], timeframe: string): string {
    return `
    Analyze team performance for the last ${timeframe} and provide strategic insights:
    
    Deals: ${deals.length} total
    Calls: ${calls.length} total
    
    Deal Stages Distribution:
    ${this.getStageDistribution(deals)}
    
    Provide insights with:
    {
      "period": "${timeframe}",
      "teamMetrics": {"totalCalls": ${calls.length}, "avgCallDuration": <minutes>, "conversionRate": <percentage>, "avgDealSize": <amount>},
      "topPerformers": [{"userId": "...", "name": "...", "metric": "...", "value": <number>}],
      "riskAlerts": [{"type": "deal_stagnant/low_activity/negative_sentiment", "description": "...", "dealId": "...", "userId": "..."}],
      "recommendations": [{"category": "...", "suggestion": "...", "impact": "high/medium/low"}]
    }
    `;
  }

  private buildContextualPrompt(context: { deals: HubSpotDeal[]; calls: GongCall[]; contacts: HubSpotContact[]; }): string {
    return `
    Available Data:
    - ${context.deals.length} deals in pipeline
    - ${context.calls.length} recent calls
    - ${context.contacts.length} contacts
    
    Deal Summary:
    ${context.deals.slice(0, 5).map(deal => 
      `- ${deal.properties.dealname}: $${deal.properties.amount} (${deal.properties.dealstage})`
    ).join('\n')}
    
    Recent Call Activity:
    ${context.calls.slice(0, 5).map(call => 
      `- ${call.metaData.started}: ${call.metaData.duration}min`
    ).join('\n')}
    `;
  }

  private getStageDistribution(deals: HubSpotDeal[]): string {
    const stages = deals.reduce((acc, deal) => {
      const stage = deal.properties.dealstage || 'unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stages)
      .map(([stage, count]) => `${stage}: ${count}`)
      .join('\n');
  }
}