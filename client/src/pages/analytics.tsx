import { Header } from "@/components/layout/header";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react";

export default function Analytics() {
  return (
    <div className="h-full">
      <Header 
        title="Analytics & Reports"
        description="Detailed insights into your sales performance"
      />
      
      <div className="p-6 space-y-8">
        <MetricsOverview />
        <PerformanceCharts />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-medium">Conversion Rate</h4>
                      <p className="text-sm text-slate-600">Lead to Deal conversion improved</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">+15%</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Average Deal Size</h4>
                      <p className="text-sm text-slate-600">Deals getting larger on average</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">+8%</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingDown className="h-8 w-8 text-red-600" />
                    <div>
                      <h4 className="font-medium">Sales Cycle</h4>
                      <p className="text-sm text-slate-600">Time to close has increased</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-red-100 text-red-800">+5 days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-900">Focus on High-Value Prospects</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Companies with 200+ employees show 3x higher conversion rates. Prioritize these leads.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-900">Optimize Follow-up Timing</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Following up within 2 days increases response rates by 47%. Automate reminders.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-orange-900">Improve Discovery Process</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Deals with thorough discovery notes close 35% faster. Use structured questionnaires.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
