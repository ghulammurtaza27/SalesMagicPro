import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Clock,
  RefreshCw,
  Send,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react";
import type { Lead, Deal } from "@shared/schema";

// Mock user ID - in production, this would come from authentication
const CURRENT_USER_ID = "ae-001";

export default function AIInsights() {
  const [question, setQuestion] = useState("");
  const [selectedDealId, setSelectedDealId] = useState<string>("");

  // Check integration health first
  const { data: healthCheck, isLoading: healthLoading } = useQuery({
    queryKey: ["/api/integrations/health"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Local fallback data
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  // Real-time data from integrations (when available)
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/integrations/dashboard", CURRENT_USER_ID],
    enabled: healthCheck?.status === "ready",
  });

  const { data: silentDealsReal } = useQuery({
    queryKey: ["/api/integrations/silent-deals", CURRENT_USER_ID],
    enabled: healthCheck?.status === "ready",
  });

  // AI Copilot mutation
  const copilotMutation = useMutation({
    mutationFn: async (data: { question: string; userId: string }) => {
      const response = await fetch("/api/integrations/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to get AI response");
      return response.json();
    },
    onSuccess: () => {
      setQuestion("");
    },
  });

  // Deal analysis mutation
  const dealAnalysisMutation = useMutation({
    mutationFn: async (data: { dealId: string; userId: string }) => {
      const response = await fetch("/api/integrations/analyze-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to analyze deal");
      return response.json();
    },
  });

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    if (healthCheck?.status === "ready") {
      copilotMutation.mutate({ question, userId: CURRENT_USER_ID });
    }
  };

  const handleAnalyzeDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    if (healthCheck?.status === "ready") {
      dealAnalysisMutation.mutate({ dealId, userId: CURRENT_USER_ID });
    }
  };

  // Calculate insights based on real data
  const highScoreLeads = leads?.filter(lead => (lead.aiScore || 0) >= 80) || [];
  const silentDeals = deals?.filter(deal => {
    const lastContact = deal.lastContactDate ? new Date(deal.lastContactDate) : new Date();
    const daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceContact >= 5;
  }) || [];
  const atRiskDeals = deals?.filter(deal => (deal.healthScore || 0) < 60) || [];

  const insights = [
    {
      type: "priority",
      icon: AlertTriangle,
      title: "Silent Deals Alert",
      description: `${silentDeals.length} deals haven't been contacted in 5+ days. ${silentDeals.slice(0, 3).map(d => d.companyName).join(", ")}${silentDeals.length > 3 ? ` and ${silentDeals.length - 3} more` : ""} need immediate attention.`,
      action: "Contact Now",
      count: silentDeals.length,
      bgGradient: "from-red-50 to-pink-50",
      borderColor: "border-red-200",
      iconBg: "bg-red-600",
      iconColor: "text-white",
      actionColor: "text-red-600 hover:underline",
    },
    {
      type: "opportunity",
      icon: Target,
      title: "Hot Leads Ready",
      description: `${highScoreLeads.length} leads scored 80+ in qualification. ${highScoreLeads.slice(0, 2).map(l => l.companyName).join(", ")}${highScoreLeads.length > 2 ? ` and ${highScoreLeads.length - 2} more` : ""} have high budget and immediate timeline.`,
      action: "Schedule Calls",
      count: highScoreLeads.length,
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      iconBg: "bg-green-600",
      iconColor: "text-white",
      actionColor: "text-green-600 hover:underline",
    },
    {
      type: "risk",
      icon: TrendingUp,
      title: "Deal Health Monitor",
      description: `${atRiskDeals.length} deals showing decreased engagement scores. Consider value reinforcement strategy and stakeholder mapping.`,
      action: "Review Strategy",
      count: atRiskDeals.length,
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-600",
      iconColor: "text-white",
      actionColor: "text-amber-600 hover:underline",
    },
  ];

  const coachingInsights = [
    {
      title: "Discovery Questions",
      impact: "High",
      description: "Ask about decision-making process earlier in calls to improve qualification accuracy by 34%.",
      category: "Process Improvement"
    },
    {
      title: "Follow-up Timing",
      impact: "Medium",
      description: "Following up within 2 days increases response rates by 47%. Current average is 3.2 days.",
      category: "Timing Optimization"
    },
    {
      title: "Value Proposition",
      impact: "High",
      description: "Emphasize ROI calculations for enterprise clients. This approach shows 28% higher close rates.",
      category: "Messaging"
    },
    {
      title: "Objection Handling",
      impact: "Medium",
      description: "Budget concerns appear in 67% of lost deals. Prepare value-based responses to pricing questions.",
      category: "Sales Skills"
    }
  ];

  const weeklyDigest = {
    deals: {
      atRisk: atRiskDeals.length,
      hotLeads: highScoreLeads.length,
      silent: silentDeals.length
    },
    trends: [
      { metric: "Conversion Rate", change: "+15%", positive: true },
      { metric: "Response Time", change: "-12%", positive: true },
      { metric: "Deal Velocity", change: "+8%", positive: true },
      { metric: "Pipeline Health", change: "-3%", positive: false }
    ]
  };

  return (
    <div className="h-full">
      <Header 
        title="AI Insights & Coaching"
        description="AI-powered sales intelligence and performance optimization"
      />
      
      <div className="p-6 space-y-8">
        {/* Integration Status */}
        {healthLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Checking integration status...</span>
            </CardContent>
          </Card>
        ) : (
          <Card className={`border-2 ${healthCheck?.status === "ready" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {healthCheck?.status === "ready" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Settings className="h-5 w-5 text-amber-600" />
                )}
                Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthCheck?.status === "ready" ? (
                <div>
                  <p className="text-green-700 mb-4">All integrations connected successfully. Real-time data available from HubSpot and Gong.</p>
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      HubSpot Connected
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Gong Connected
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      AI Engine Ready
                    </Badge>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-amber-700 mb-4">Integration setup required for real-time AI insights. Using sample data for demonstration.</p>
                  <div className="flex gap-4">
                    <Badge variant="secondary" className={`${healthCheck?.services?.hubspot ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {healthCheck?.services?.hubspot ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      HubSpot {healthCheck?.services?.hubspot ? "Ready" : "Missing Token"}
                    </Badge>
                    <Badge variant="secondary" className={`${healthCheck?.services?.gong ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {healthCheck?.services?.gong ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      Gong {healthCheck?.services?.gong ? "Ready" : "Missing Token"}
                    </Badge>
                    <Badge variant="secondary" className={`${healthCheck?.services?.openai ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {healthCheck?.services?.openai ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      OpenAI {healthCheck?.services?.openai ? "Ready" : "Missing Key"}
                    </Badge>
                  </div>
                  {healthCheck?.status !== "ready" && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        To access real-time data and AI insights, please provide the required API credentials for HubSpot, Gong, and OpenAI.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Copilot Chat */}
        {healthCheck?.status === "ready" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Sales Copilot
              </CardTitle>
              <CardDescription>
                Ask questions about your deals, prospects, or performance using natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me about your pipeline, deals, or next actions..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || copilotMutation.isPending}
                  className="px-6"
                >
                  {copilotMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* AI Response Display */}
              {copilotMutation.data && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">AI Copilot Response:</p>
                        <p className="text-blue-700">{copilotMutation.data.answer}</p>
                        {copilotMutation.data.context && (
                          <p className="text-xs text-blue-600 mt-2">
                            Analyzed {copilotMutation.data.context.dealsCount} deals, {copilotMutation.data.context.callsCount} calls, and {copilotMutation.data.context.contactsCount} contacts
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {copilotMutation.isError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to get AI response. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Real-time Dashboard Data */}
        {dashboard && healthCheck?.status === "ready" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Pipeline Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Deals</span>
                    <span className="font-semibold">{dashboard.metrics.totalDeals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pipeline Value</span>
                    <span className="font-semibold">${dashboard.metrics.pipelineValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Deal Size</span>
                    <span className="font-semibold">${dashboard.metrics.avgDealSize.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Call Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Calls</span>
                    <span className="font-semibold">{dashboard.metrics.totalCalls}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Recent Calls</span>
                    <span className="font-semibold">{dashboard.recentCalls?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboard.insights?.riskAlerts && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Alerts</span>
                      <Badge variant="destructive">{dashboard.insights.riskAlerts.length}</Badge>
                    </div>
                  )}
                  {dashboard.insights?.recommendations && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Recommendations</span>
                      <Badge variant="secondary">{dashboard.insights.recommendations.length}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fallback to local data insights when integrations not available */}
        {(!healthCheck || healthCheck?.status !== "ready") && (
          <div className="space-y-8">
            {/* Real-time Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <Card key={index} className="shadow-sm border border-slate-200">
              <CardContent className="p-6">
                <div className={`bg-gradient-to-r ${insight.bgGradient} border ${insight.borderColor} rounded-lg p-4`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${insight.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <insight.icon className={`h-4 w-4 ${insight.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{insight.title}</h4>
                        <Badge variant="secondary">{insight.count}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`${insight.actionColor} p-0 h-auto font-medium`}
                      >
                        {insight.action} <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly AI Digest */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-primary" />
                Weekly Performance Digest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{weeklyDigest.deals.atRisk}</div>
                    <div className="text-sm text-slate-600">At Risk</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{weeklyDigest.deals.hotLeads}</div>
                    <div className="text-sm text-slate-600">Hot Leads</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{weeklyDigest.deals.silent}</div>
                    <div className="text-sm text-slate-600">Silent Deals</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">Performance Trends</h4>
                  {weeklyDigest.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{trend.metric}</span>
                      <span className={`text-sm font-medium ${
                        trend.positive ? "text-green-600" : "text-red-600"
                      }`}>
                        {trend.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                AI Coaching Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coachingInsights.map((coaching, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{coaching.title}</h4>
                      <Badge variant={coaching.impact === "High" ? "default" : "secondary"}>
                        {coaching.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{coaching.description}</p>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {coaching.category}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Copilot Interface */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
              AI Sales Copilot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-3">
                  Ask me anything about your pipeline, leads, or sales performance:
                </p>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="e.g., 'What's the latest on Acme Corp?' or 'Which deals need attention?'"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                  <Button>Ask AI</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button variant="outline" size="sm" className="text-left justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Show me silent prospects
                </Button>
                <Button variant="outline" size="sm" className="text-left justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  What's my schedule today?
                </Button>
                <Button variant="outline" size="sm" className="text-left justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze deal velocity
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Recent AI Analysis</h4>
                <p className="text-sm text-blue-700">
                  Based on your recent activity, I recommend focusing on the 3 high-scoring leads from healthcare companies. 
                  They show strong buying signals and have immediate timelines. Schedule discovery calls this week for optimal conversion.
                </p>
                <div className="flex items-center mt-3 text-xs text-blue-600">
                  <Clock className="mr-1 h-3 w-3" />
                  Generated 5 minutes ago
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
          </div>
        )}
      </div>
    </div>
  );
}