import { Header } from "@/components/layout/header";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { LeadQualificationTable } from "@/components/leads/lead-qualification-table";

export default function Dashboard() {
  return (
    <div className="h-full">
      <Header 
        title="Sales Dashboard"
        description="Welcome back! Here's your pipeline overview."
      />
      
      <div className="p-6 space-y-8">
        <MetricsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIInsights />
          </div>
          <div className="lg:col-span-1">
            {/* Recent Activity will be implemented later */}
          </div>
        </div>

        <PipelineOverview />
        <PerformanceCharts />
        <LeadQualificationTable />
      </div>
    </div>
  );
}
