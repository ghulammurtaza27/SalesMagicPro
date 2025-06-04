import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, AlertTriangle } from "lucide-react";

export function AIInsights() {
  const insights = [
    {
      type: "priority",
      icon: Lightbulb,
      title: "High-Priority Follow-up",
      description: "3 deals haven't been contacted in 5+ days. Acme Corp, TechStart Inc, and GlobalCo need immediate attention.",
      action: "View Silent Deals",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      iconBg: "bg-primary",
      iconColor: "text-white",
      actionColor: "text-primary hover:underline",
    },
    {
      type: "opportunity",
      icon: Target,
      title: "Hot Lead Alert",
      description: "NutriCorp scored 92/100 in qualification. High budget, immediate timeline. Schedule call within 24h.",
      action: "Schedule Call",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      iconBg: "bg-green-600",
      iconColor: "text-white",
      actionColor: "text-green-600 hover:underline",
    },
    {
      type: "risk",
      icon: AlertTriangle,
      title: "Deal Risk Detection",
      description: "FoodTech Ltd showing decreased engagement. Recommend value reinforcement strategy.",
      action: "View Risk Analysis",
      bgGradient: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-600",
      iconColor: "text-white",
      actionColor: "text-amber-600 hover:underline",
    },
  ];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            AI-Powered Insights
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-500">Live AI Analysis</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`bg-gradient-to-r ${insight.bgGradient} border ${insight.borderColor} rounded-lg p-4`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${insight.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <insight.icon className={`h-4 w-4 ${insight.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{insight.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`${insight.actionColor} p-0 h-auto font-medium mt-2`}
                  >
                    {insight.action} →
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
