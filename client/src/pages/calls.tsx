import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, MessageSquare, Plus } from "lucide-react";

export default function Calls() {
  return (
    <div className="h-full">
      <Header 
        title="Calls & Notes"
        description="Manage call notes and follow-up activities"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Call Note
          </Button>
        }
      />
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Recent Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Acme Corporation</h4>
                    <Badge variant="secondary">Discovery</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Discussed requirements for corporate snack program. Strong interest shown.
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    2 hours ago • 45 min
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">NutriCorp Health</h4>
                    <Badge variant="secondary">Follow-up</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Proposal follow-up call. Client has questions about pricing structure.
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    1 day ago • 30 min
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                AI Call Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Coaching Opportunity</h4>
                  <p className="text-sm text-blue-700">
                    Consider addressing budget concerns earlier in discovery calls to improve close rates.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Positive Trend</h4>
                  <p className="text-sm text-green-700">
                    Your rapport-building phase has improved 23% this month based on sentiment analysis.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 mb-2">Follow-up Alert</h4>
                  <p className="text-sm text-amber-700">
                    3 prospects haven't been contacted in 5+ days. Consider scheduling check-ins.
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
