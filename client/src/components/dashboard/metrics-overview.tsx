import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Trophy, TrendingUp } from "lucide-react";

interface Metrics {
  activeLeads: number;
  pipelineValue: number;
  winRate: number;
  avgDealSize: number;
}

export function MetricsOverview() {
  const { data: metrics, isLoading } = useQuery<Metrics>({
    queryKey: ["/api/metrics"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Active Leads",
      value: metrics?.activeLeads || 0,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Pipeline Value",
      value: `$${((metrics?.pipelineValue || 0) / 1000).toFixed(0)}K`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Win Rate",
      value: `${metrics?.winRate || 0}%`,
      icon: Trophy,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "+3%",
      changeType: "positive" as const,
    },
    {
      title: "Avg Deal Size",
      value: `$${((metrics?.avgDealSize || 0) / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "-2%",
      changeType: "negative" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index} className="shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{metric.title}</p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              </div>
              <div className={`w-12 h-12 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-slate-500 text-sm ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
