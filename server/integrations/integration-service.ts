import { HubSpotClient } from './hubspot';
import { GongClient } from './gong';
import { AIEngine } from './ai-engine';
import { z } from 'zod';

// User and team management schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'ae']),
  hubspotOwnerId: z.string().optional(),
  gongUserId: z.string().optional(),
  teamId: z.string().optional(),
});

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  manager: z.string(),
});

export type User = z.infer<typeof UserSchema>;
export type Team = z.infer<typeof TeamSchema>;

export class IntegrationService {
  private hubspotClient: HubSpotClient;
  private gongClient: GongClient;
  private aiEngine: AIEngine;
  private users: Map<string, User> = new Map();
  private teams: Map<string, Team> = new Map();

  constructor(
    hubspotToken: string,
    gongToken: string,
    openaiKey: string
  ) {
    this.hubspotClient = new HubSpotClient(hubspotToken);
    this.gongClient = new GongClient(gongToken);
    this.aiEngine = new AIEngine(openaiKey);
    
    this.initializeUsers();
  }

  private initializeUsers() {
    // Sample SnackMagic sales team structure
    const sampleUsers: User[] = [
      {
        id: 'ae-001',
        email: 'john.doe@snackmagic.com',
        name: 'John Doe',
        role: 'ae',
        hubspotOwnerId: 'hs-owner-001',
        gongUserId: 'gong-user-001',
        teamId: 'team-enterprise'
      },
      {
        id: 'ae-002',
        email: 'sarah.smith@snackmagic.com',
        name: 'Sarah Smith',
        role: 'ae',
        hubspotOwnerId: 'hs-owner-002',
        gongUserId: 'gong-user-002',
        teamId: 'team-enterprise'
      },
      {
        id: 'mgr-001',
        email: 'mike.manager@snackmagic.com',
        name: 'Mike Manager',
        role: 'manager',
        hubspotOwnerId: 'hs-owner-003',
        gongUserId: 'gong-user-003',
        teamId: 'team-enterprise'
      }
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

    // Sample team
    this.teams.set('team-enterprise', {
      id: 'team-enterprise',
      name: 'Enterprise Sales Team',
      members: ['ae-001', 'ae-002'],
      manager: 'mgr-001'
    });
  }

  // Get comprehensive dashboard data for a user
  async getUserDashboard(userId: string) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const [deals, calls, contacts] = await Promise.all([
      this.getUserDeals(userId),
      this.getUserCalls(userId),
      this.getUserContacts(userId)
    ]);

    const insights = await this.aiEngine.generateTeamInsights(deals, calls, '30d');
    
    return {
      user,
      metrics: {
        totalDeals: deals.length,
        totalCalls: calls.length,
        pipelineValue: deals.reduce((sum, deal) => sum + (parseInt(deal.properties.amount || '0')), 0),
        avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + (parseInt(deal.properties.amount || '0')), 0) / deals.length : 0
      },
      deals: deals.slice(0, 10), // Top 10 deals
      recentCalls: calls.slice(0, 5), // Recent 5 calls
      insights
    };
  }

  // Get deals for a specific user
  async getUserDeals(userId: string) {
    const user = this.users.get(userId);
    if (!user?.hubspotOwnerId) return [];

    return this.hubspotClient.searchDeals({
      filters: [{
        propertyName: 'hubspot_owner_id',
        operator: 'EQ',
        value: user.hubspotOwnerId
      }],
      sorts: [{
        propertyName: 'hs_lastmodifieddate',
        direction: 'DESCENDING'
      }],
      limit: 100
    });
  }

  // Get calls for a specific user
  async getUserCalls(userId: string, days: number = 30) {
    const user = this.users.get(userId);
    if (!user?.gongUserId) return [];

    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const toDate = new Date().toISOString();

    const result = await this.gongClient.getTeamCalls([user.gongUserId], fromDate, toDate);
    return result;
  }

  // Get contacts for a specific user
  async getUserContacts(userId: string) {
    const user = this.users.get(userId);
    if (!user?.hubspotOwnerId) return [];

    // This would need a more specific HubSpot query for owner-based contacts
    const contacts = await this.hubspotClient.getContacts(50);
    return contacts.results;
  }

  // Analyze a specific deal with AI
  async analyzeDeal(dealId: string, userId: string) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    // Get deal data from HubSpot
    const deals = await this.hubspotClient.searchDeals({
      filters: [{
        propertyName: 'hs_object_id',
        operator: 'EQ',
        value: dealId
      }]
    });

    if (deals.length === 0) throw new Error('Deal not found');
    const deal = deals[0];

    // Get related calls from Gong
    const relatedCalls = await this.gongClient.searchCallsByCRM(dealId, 'hubspot');

    // Get related contacts
    const contacts = await this.getUserContacts(userId);

    // Analyze with AI
    const analysis = await this.aiEngine.analyzeDeal(deal, relatedCalls, contacts);

    return {
      deal,
      relatedCalls,
      analysis,
      lastAnalyzed: new Date().toISOString()
    };
  }

  // Analyze a call with AI
  async analyzeCall(callId: string) {
    const calls = await this.gongClient.getCalls({ limit: 1 });
    const call = calls.calls.find(c => c.metaData.id === callId);
    
    if (!call) throw new Error('Call not found');

    const [transcript, insights] = await Promise.all([
      this.gongClient.getCallTranscript(callId),
      this.gongClient.getCallInsights(callId)
    ]);

    const analysis = await this.aiEngine.analyzeCall(call, transcript, insights);

    return {
      call,
      transcript,
      insights,
      analysis,
      lastAnalyzed: new Date().toISOString()
    };
  }

  // Answer natural language questions
  async askCopilot(question: string, userId: string) {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    // Get user's context data
    const [deals, calls, contacts] = await Promise.all([
      this.getUserDeals(userId),
      this.getUserCalls(userId),
      this.getUserContacts(userId)
    ]);

    const answer = await this.aiEngine.answerSalesQuestion(question, {
      deals,
      calls,
      contacts
    });

    return {
      question,
      answer,
      context: {
        dealsCount: deals.length,
        callsCount: calls.length,
        contactsCount: contacts.length
      },
      timestamp: new Date().toISOString()
    };
  }

  // Get team performance (for managers)
  async getTeamPerformance(managerId: string) {
    const manager = this.users.get(managerId);
    if (!manager || manager.role !== 'manager') {
      throw new Error('Access denied: Manager role required');
    }

    const team = Array.from(this.teams.values()).find(t => t.manager === managerId);
    if (!team) throw new Error('Team not found');

    // Get all team members' data
    const teamData = await Promise.all(
      team.members.map(async (memberId) => {
        const [deals, calls] = await Promise.all([
          this.getUserDeals(memberId),
          this.getUserCalls(memberId)
        ]);
        
        return {
          user: this.users.get(memberId),
          deals,
          calls,
          metrics: {
            dealsCount: deals.length,
            callsCount: calls.length,
            pipelineValue: deals.reduce((sum, deal) => sum + (parseInt(deal.properties.amount || '0')), 0)
          }
        };
      })
    );

    // Aggregate all deals and calls for team insights
    const allDeals = teamData.flatMap(data => data.deals);
    const allCalls = teamData.flatMap(data => data.calls);

    const teamInsights = await this.aiEngine.generateTeamInsights(allDeals, allCalls, '30d');

    return {
      team,
      teamData,
      teamInsights,
      aggregateMetrics: {
        totalDeals: allDeals.length,
        totalCalls: allCalls.length,
        totalPipelineValue: teamData.reduce((sum, data) => sum + data.metrics.pipelineValue, 0),
        avgDealsPerRep: allDeals.length / team.members.length,
        avgCallsPerRep: allCalls.length / team.members.length
      }
    };
  }

  // Get silent deals that need attention
  async getSilentDeals(userId: string) {
    const deals = await this.getUserDeals(userId);
    const silentDeals = [];

    for (const deal of deals) {
      const relatedCalls = await this.gongClient.searchCallsByCRM(deal.id, 'hubspot');
      const lastCall = relatedCalls[0]; // Most recent call
      
      if (!lastCall) {
        silentDeals.push({
          deal,
          daysSinceLastContact: Infinity,
          lastContactType: 'none',
          recommendation: await this.aiEngine.generateFollowUpRecommendations(deal, [], Infinity)
        });
      } else {
        const daysSince = Math.floor((Date.now() - new Date(lastCall.metaData.started || 0).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 5) {
          silentDeals.push({
            deal,
            daysSinceLastContact: daysSince,
            lastContactType: 'call',
            lastContactDate: lastCall.metaData.started,
            recommendation: await this.aiEngine.generateFollowUpRecommendations(deal, relatedCalls, daysSince)
          });
        }
      }
    }

    return silentDeals.sort((a, b) => b.daysSinceLastContact - a.daysSinceLastContact);
  }

  // Test all integrations
  async testConnections() {
    const [hubspotTest, gongTest] = await Promise.all([
      this.hubspotClient.testConnection(),
      this.gongClient.testConnection()
    ]);

    return {
      hubspot: hubspotTest,
      gong: gongTest,
      ai: { success: true, message: 'AI engine ready' },
      timestamp: new Date().toISOString()
    };
  }

  // User management methods
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getTeamMembers(teamId: string): User[] {
    const team = this.teams.get(teamId);
    if (!team) return [];
    
    return team.members.map(memberId => this.users.get(memberId)).filter(Boolean) as User[];
  }

  getUsersByRole(role: User['role']): User[] {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
}