import { 
  users, leads, deals, activities, callNotes,
  type User, type InsertUser,
  type Lead, type InsertLead,
  type Deal, type InsertDeal,
  type Activity, type InsertActivity,
  type CallNote, type InsertCallNote
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead methods
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // Deal methods
  getDeals(): Promise<Deal[]>;
  getDeal(id: number): Promise<Deal | undefined>;
  getDealsByStage(stage: string): Promise<Deal[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: number, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: number): Promise<boolean>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivitiesByDeal(dealId: number): Promise<Activity[]>;
  getActivitiesByLead(leadId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Call notes methods
  getCallNotes(): Promise<CallNote[]>;
  getCallNotesByDeal(dealId: number): Promise<CallNote[]>;
  getCallNotesByLead(leadId: number): Promise<CallNote[]>;
  createCallNote(note: InsertCallNote): Promise<CallNote>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private deals: Map<number, Deal>;
  private activities: Map<number, Activity>;
  private callNotes: Map<number, CallNote>;
  private currentUserId: number;
  private currentLeadId: number;
  private currentDealId: number;
  private currentActivityId: number;
  private currentCallNoteId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.deals = new Map();
    this.activities = new Map();
    this.callNotes = new Map();
    this.currentUserId = 1;
    this.currentLeadId = 1;
    this.currentDealId = 1;
    this.currentActivityId = 1;
    this.currentCallNoteId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize with some basic data
    const sampleLeads: (InsertLead & { id?: number, aiScore?: number, createdAt?: Date, updatedAt?: Date })[] = [
      {
        companyName: "Acme Corporation",
        industry: "Manufacturing",
        employeeCount: "201-1000",
        budgetRange: "$50K - $100K",
        timeline: "Q1 2024",
        interestArea: "Office Snacks",
        notes: "Large manufacturing company looking for comprehensive snack program",
        priority: "high",
        status: "qualified",
        aiScore: 92
      },
      {
        companyName: "NutriCorp Health",
        industry: "Healthcare",
        employeeCount: "51-200",
        budgetRange: "$25K - $75K",
        timeline: "Immediate",
        interestArea: "Employee Wellness",
        notes: "Healthcare company focused on employee wellness programs",
        priority: "high",
        status: "qualified",
        aiScore: 88
      },
      {
        companyName: "FoodTech Ltd",
        industry: "Technology",
        employeeCount: "11-50",
        budgetRange: "$10K - $30K",
        timeline: "Q2 2024",
        interestArea: "Corporate Events",
        notes: "Tech startup interested in event catering",
        priority: "medium",
        status: "contacted",
        aiScore: 65
      }
    ];

    sampleLeads.forEach(lead => {
      const id = this.currentLeadId++;
      const now = new Date();
      this.leads.set(id, {
        ...lead,
        id,
        aiScore: lead.aiScore || 0,
        createdAt: now,
        updatedAt: now
      } as Lead);
    });

    // Create sample deals
    const sampleDeals: (InsertDeal & { id?: number, createdAt?: Date, updatedAt?: Date })[] = [
      {
        leadId: 1,
        companyName: "Acme Corporation",
        value: 4500000, // $45,000 in cents
        stage: "qualified",
        probability: 25,
        healthScore: 85,
        notes: "Strong initial interest, need to present proposal"
      },
      {
        leadId: 2,
        companyName: "NutriCorp Health",
        value: 6700000, // $67,000 in cents
        stage: "proposal",
        probability: 60,
        healthScore: 90,
        notes: "Proposal submitted, awaiting feedback"
      },
      {
        leadId: null,
        companyName: "GlobalCo",
        value: 12500000, // $125,000 in cents
        stage: "proposal",
        probability: 50,
        healthScore: 75,
        notes: "Multi-location program in proposal stage"
      },
      {
        leadId: null,
        companyName: "MegaFirm",
        value: 8900000, // $89,000 in cents
        stage: "negotiation",
        probability: 80,
        healthScore: 70,
        notes: "In contract negotiation phase"
      },
      {
        leadId: null,
        companyName: "SmartCorp",
        value: 15600000, // $156,000 in cents
        stage: "closing",
        probability: 95,
        healthScore: 95,
        notes: "Final contract review, close expected this week"
      }
    ];

    sampleDeals.forEach(deal => {
      const id = this.currentDealId++;
      const now = new Date();
      this.deals.set(id, {
        ...deal,
        id,
        createdAt: now,
        updatedAt: now,
        lastContactDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
      } as Deal);
    });

    // Create sample activities
    const sampleActivities: (InsertActivity & { id?: number, createdAt?: Date })[] = [
      {
        dealId: 1,
        leadId: 1,
        type: "call",
        description: "Discovery call completed",
        outcome: "Positive response, interested in full program",
        nextSteps: "Send proposal by end of week"
      },
      {
        dealId: 2,
        leadId: 2,
        type: "email",
        description: "Follow-up proposal sent",
        outcome: "Proposal delivered successfully",
        nextSteps: "Schedule follow-up call for next week"
      },
      {
        leadId: 3,
        type: "call",
        description: "Initial qualification call",
        outcome: "Budget confirmed, timeline extended",
        nextSteps: "Send information packet"
      }
    ];

    sampleActivities.forEach(activity => {
      const id = this.currentActivityId++;
      this.activities.set(id, {
        ...activity,
        id,
        createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) // Random date within last 3 days
      } as Activity);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const now = new Date();
    const lead: Lead = {
      ...insertLead,
      id,
      aiScore: this.calculateAIScore(insertLead),
      createdAt: now,
      updatedAt: now
    };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, updateData: Partial<InsertLead>): Promise<Lead | undefined> {
    const existing = this.leads.get(id);
    if (!existing) return undefined;

    const updated: Lead = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.leads.set(id, updated);
    return updated;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  // Deal methods
  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getDeal(id: number): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async getDealsByStage(stage: string): Promise<Deal[]> {
    return Array.from(this.deals.values()).filter(deal => deal.stage === stage);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = this.currentDealId++;
    const now = new Date();
    const deal: Deal = {
      ...insertDeal,
      id,
      createdAt: now,
      updatedAt: now,
      lastContactDate: insertDeal.lastContactDate || now
    };
    this.deals.set(id, deal);
    return deal;
  }

  async updateDeal(id: number, updateData: Partial<InsertDeal>): Promise<Deal | undefined> {
    const existing = this.deals.get(id);
    if (!existing) return undefined;

    const updated: Deal = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.deals.set(id, updated);
    return updated;
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.deals.delete(id);
  }

  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getActivitiesByDeal(dealId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.dealId === dealId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getActivitiesByLead(leadId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Call notes methods
  async getCallNotes(): Promise<CallNote[]> {
    return Array.from(this.callNotes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getCallNotesByDeal(dealId: number): Promise<CallNote[]> {
    return Array.from(this.callNotes.values())
      .filter(note => note.dealId === dealId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCallNotesByLead(leadId: number): Promise<CallNote[]> {
    return Array.from(this.callNotes.values())
      .filter(note => note.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCallNote(insertCallNote: InsertCallNote): Promise<CallNote> {
    const id = this.currentCallNoteId++;
    const callNote: CallNote = {
      ...insertCallNote,
      id,
      createdAt: new Date()
    };
    this.callNotes.set(id, callNote);
    return callNote;
  }

  private calculateAIScore(lead: InsertLead): number {
    let score = 50; // Base score

    // Budget scoring
    if (lead.budgetRange?.includes("$150K+")) score += 25;
    else if (lead.budgetRange?.includes("$75K - $150K")) score += 20;
    else if (lead.budgetRange?.includes("$30K - $75K")) score += 15;
    else if (lead.budgetRange?.includes("$15K - $30K")) score += 10;

    // Timeline scoring
    if (lead.timeline === "Immediate") score += 20;
    else if (lead.timeline === "1-3 months") score += 15;
    else if (lead.timeline === "3-6 months") score += 10;

    // Employee count scoring
    if (lead.employeeCount?.includes("1000+")) score += 15;
    else if (lead.employeeCount?.includes("201-1000")) score += 12;
    else if (lead.employeeCount?.includes("51-200")) score += 8;
    else if (lead.employeeCount?.includes("11-50")) score += 5;

    // Industry fit
    const highValueIndustries = ["Healthcare", "Technology", "Finance"];
    if (lead.industry && highValueIndustries.includes(lead.industry)) score += 10;

    return Math.min(100, Math.max(0, score));
  }
}

export const storage = new MemStorage();
