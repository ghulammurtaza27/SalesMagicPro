import type { Express } from "express";
import { IntegrationService } from "../integrations/integration-service";
import { z } from "zod";

// Request schemas
const AskCopilotSchema = z.object({
  question: z.string(),
  userId: z.string(),
});

const AnalyzeDealSchema = z.object({
  dealId: z.string(),
  userId: z.string(),
});

const AnalyzeCallSchema = z.object({
  callId: z.string(),
});

export function registerIntegrationRoutes(app: Express, integrationService: IntegrationService | null) {
  // Middleware to check if integrations are available
  const requireIntegrations = (req: any, res: any, next: any) => {
    if (!integrationService) {
      return res.status(503).json({ 
        message: "Integration services not available. Please configure API tokens.",
        missingServices: ["HubSpot", "Gong", "OpenAI"]
      });
    }
    next();
  };

  // Get user dashboard with real-time data
  app.get("/api/integrations/dashboard/:userId", requireIntegrations, async (req, res) => {
    try {
      const userId = req.params.userId;
      const dashboard = await integrationService!.getUserDashboard(userId);
      res.json(dashboard);
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ 
        message: "Failed to fetch dashboard data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user's deals from HubSpot
  app.get("/api/integrations/deals/:userId", requireIntegrations, async (req, res) => {
    try {
      const userId = req.params.userId;
      const deals = await integrationService!.getUserDeals(userId);
      res.json(deals);
    } catch (error) {
      console.error("Deals error:", error);
      res.status(500).json({ 
        message: "Failed to fetch deals from HubSpot",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user's calls from Gong
  app.get("/api/integrations/calls/:userId", requireIntegrations, async (req, res) => {
    try {
      const userId = req.params.userId;
      const days = parseInt(req.query.days as string) || 30;
      const calls = await integrationService!.getUserCalls(userId, days);
      res.json(calls);
    } catch (error) {
      console.error("Calls error:", error);
      res.status(500).json({ 
        message: "Failed to fetch calls from Gong",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Analyze a specific deal with AI
  app.post("/api/integrations/analyze-deal", requireIntegrations, async (req, res) => {
    try {
      const { dealId, userId } = AnalyzeDealSchema.parse(req.body);
      const analysis = await integrationService!.analyzeDeal(dealId, userId);
      res.json(analysis);
    } catch (error) {
      console.error("Deal analysis error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to analyze deal",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Analyze a specific call with AI
  app.post("/api/integrations/analyze-call", requireIntegrations, async (req, res) => {
    try {
      const { callId } = AnalyzeCallSchema.parse(req.body);
      const analysis = await integrationService!.analyzeCall(callId);
      res.json(analysis);
    } catch (error) {
      console.error("Call analysis error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to analyze call",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Copilot - answer natural language questions
  app.post("/api/integrations/copilot", requireIntegrations, async (req, res) => {
    try {
      const { question, userId } = AskCopilotSchema.parse(req.body);
      const response = await integrationService!.askCopilot(question, userId);
      res.json(response);
    } catch (error) {
      console.error("Copilot error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ 
        message: "Failed to process question",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get silent deals that need attention
  app.get("/api/integrations/silent-deals/:userId", requireIntegrations, async (req, res) => {
    try {
      const userId = req.params.userId;
      const silentDeals = await integrationService!.getSilentDeals(userId);
      res.json(silentDeals);
    } catch (error) {
      console.error("Silent deals error:", error);
      res.status(500).json({ 
        message: "Failed to fetch silent deals",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get team performance (managers only)
  app.get("/api/integrations/team-performance/:managerId", requireIntegrations, async (req, res) => {
    try {
      const managerId = req.params.managerId;
      const performance = await integrationService!.getTeamPerformance(managerId);
      res.json(performance);
    } catch (error) {
      console.error("Team performance error:", error);
      res.status(500).json({ 
        message: "Failed to fetch team performance",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test all integrations
  app.get("/api/integrations/test", requireIntegrations, async (req, res) => {
    try {
      const testResults = await integrationService!.testConnections();
      res.json(testResults);
    } catch (error) {
      console.error("Integration test error:", error);
      res.status(500).json({ 
        message: "Failed to test integrations",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user info
  app.get("/api/integrations/user/:userId", requireIntegrations, async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = integrationService!.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("User info error:", error);
      res.status(500).json({ 
        message: "Failed to fetch user info",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get users by role
  app.get("/api/integrations/users/role/:role", requireIntegrations, async (req, res) => {
    try {
      const role = req.params.role as 'admin' | 'manager' | 'ae';
      const users = integrationService!.getUsersByRole(role);
      res.json(users);
    } catch (error) {
      console.error("Users by role error:", error);
      res.status(500).json({ 
        message: "Failed to fetch users by role",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Health check endpoint
  app.get("/api/integrations/health", (req, res) => {
    res.json({
      status: integrationService ? "ready" : "not_configured",
      services: {
        hubspot: !!process.env.HUBSPOT_ACCESS_TOKEN,
        gong: !!process.env.GONG_ACCESS_TOKEN,
        openai: !!process.env.OPENAI_API_KEY
      },
      timestamp: new Date().toISOString()
    });
  });
}