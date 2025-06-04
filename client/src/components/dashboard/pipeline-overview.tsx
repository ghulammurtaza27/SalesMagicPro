import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import type { Deal } from "@shared/schema";

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  deals: Deal[];
}

export function PipelineOverview() {
  const { data: pipelineData, isLoading, refetch } = useQuery<PipelineStage[]>({
    queryKey: ["/api/pipeline-summary"],
  });

  const stageConfig = {
    qualified: { name: "Qualified", bgColor: "bg-slate-50", borderColor: "border-slate-200", badgeColor: "bg-slate-200 text-slate-700" },
    proposal: { name: "Proposal", bgColor: "bg-blue-50", borderColor: "border-blue-200", badgeColor: "bg-blue-200 text-blue-700" },
    negotiation: { name: "Negotiation", bgColor: "bg-orange-50", borderColor: "border-orange-200", badgeColor: "bg-orange-200 text-orange-700" },
    closing: { name: "Closing", bgColor: "bg-green-50", borderColor: "border-green-200", badgeColor: "bg-green-200 text-green-700" },
  };

  const getHeatIndicator = (deal: Deal) => {
    if (deal.healthScore >= 80) return { label: "Hot", color: "text-green-600" };
    if (deal.healthScore >= 60) return { label: "Warm", color: "text-yellow-600" };
    return { label: "Cold", color: "text-slate-600" };
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg p-4 h-48"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Deal Pipeline
          </CardTitle>
          <div className="flex items-center space-x-2">
            <select className="border border-slate-300 rounded-lg px-3 py-1 text-sm">
              <option>All Stages</option>
              <option>Qualified</option>
              <option>Proposal</option>
              <option>Negotiation</option>
            </select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelineData?.map((stage) => {
            const config = stageConfig[stage.stage as keyof typeof stageConfig];
            if (!config) return null;

            return (
              <div key={stage.stage} className={`${config.bgColor} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900">{config.name}</h4>
                  <Badge className={config.badgeColor}>{stage.count}</Badge>
                </div>
                
                <div className="space-y-3">
                  {stage.deals.slice(0, 3).map((deal) => {
                    const heat = getHeatIndicator(deal);
                    return (
                      <div 
                        key={deal.id}
                        className={`bg-white rounded-lg p-3 border ${config.borderColor} cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-slate-900 text-sm truncate">
                            {deal.companyName}
                          </h5>
                          <span className={`text-xs font-medium ${heat.color}`}>
                            {heat.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-900 font-medium text-sm">
                            ${(deal.value / 100).toLocaleString()}
                          </span>
                          <div className="w-16">
                            <Progress 
                              value={deal.probability} 
                              className="h-1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {stage.deals.length > 3 && (
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-xs">
                        +{stage.deals.length - 3} more
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
