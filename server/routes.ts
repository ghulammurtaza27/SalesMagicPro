import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertDealSchema, insertActivitySchema, insertCallNoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lead routes
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(id, validatedData);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLead(id);
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Deal routes
  app.get("/api/deals", async (req, res) => {
    try {
      const { stage } = req.query;
      const deals = stage 
        ? await storage.getDealsByStage(stage as string)
        : await storage.getDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deal = await storage.getDeal(id);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const validatedData = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(validatedData);
      res.status(201).json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deal" });
    }
  });

  app.put("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDealSchema.partial().parse(req.body);
      const deal = await storage.updateDeal(id, validatedData);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid deal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDeal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Deal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deal" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const { dealId, leadId } = req.query;
      let activities;
      
      if (dealId) {
        activities = await storage.getActivitiesByDeal(parseInt(dealId as string));
      } else if (leadId) {
        activities = await storage.getActivitiesByLead(parseInt(leadId as string));
      } else {
        activities = await storage.getActivities();
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Call notes routes
  app.get("/api/call-notes", async (req, res) => {
    try {
      const { dealId, leadId } = req.query;
      let callNotes;
      
      if (dealId) {
        callNotes = await storage.getCallNotesByDeal(parseInt(dealId as string));
      } else if (leadId) {
        callNotes = await storage.getCallNotesByLead(parseInt(leadId as string));
      } else {
        callNotes = await storage.getCallNotes();
      }
      
      res.json(callNotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch call notes" });
    }
  });

  app.post("/api/call-notes", async (req, res) => {
    try {
      const validatedData = insertCallNoteSchema.parse(req.body);
      const callNote = await storage.createCallNote(validatedData);
      res.status(201).json(callNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid call note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create call note" });
    }
  });

  // Analytics and metrics routes
  app.get("/api/metrics", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      const deals = await storage.getDeals();
      
      const activeLeads = leads.filter(lead => lead.status !== "lost").length;
      const totalPipelineValue = deals
        .filter(deal => deal.stage !== "lost")
        .reduce((sum, deal) => sum + deal.value, 0);
      
      const wonDeals = deals.filter(deal => deal.stage === "won");
      const totalDeals = deals.length;
      const winRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;
      
      const avgDealSize = wonDeals.length > 0 
        ? Math.round(wonDeals.reduce((sum, deal) => sum + deal.value, 0) / wonDeals.length)
        : 0;

      const metrics = {
        activeLeads,
        pipelineValue: Math.round(totalPipelineValue / 100), // Convert from cents to dollars
        winRate,
        avgDealSize: Math.round(avgDealSize / 100), // Convert from cents to dollars
      };

      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get("/api/pipeline-summary", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      const stages = ["qualified", "proposal", "negotiation", "closing"];
      
      const pipelineSummary = stages.map(stage => {
        const stageDeals = deals.filter(deal => deal.stage === stage);
        return {
          stage,
          count: stageDeals.length,
          value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
          deals: stageDeals
        };
      });

      res.json(pipelineSummary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipeline summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
