import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, Phone, Eye, Edit } from "lucide-react";
import { useState } from "react";
import type { Lead } from "@shared/schema";

export function LeadQualificationTable() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const filteredLeads = leads?.filter(lead =>
    lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-slate-100 text-slate-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ["Company", "Industry", "AI Score", "Budget", "Timeline", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        lead.companyName,
        lead.industry || "",
        lead.aiScore,
        lead.budgetRange || "",
        lead.timeline || "",
        lead.status
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
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
            Recent Lead Qualifications
          </CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Company</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">AI Score</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Budget</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Timeline</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {lead.companyName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{lead.companyName}</p>
                        <p className="text-slate-500 text-sm">{lead.industry}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getScoreColor(lead.aiScore)}`}
                          style={{ width: `${lead.aiScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{lead.aiScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-900">{lead.budgetRange}</td>
                  <td className="px-4 py-4 text-slate-900">{lead.timeline}</td>
                  <td className="px-4 py-4">
                    <Badge className={getPriorityColor(lead.priority || "medium")}>
                      {lead.priority === "high" ? "High Priority" : 
                       lead.priority === "medium" ? "Medium Priority" : "Low Priority"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-600">
            Showing 1-{filteredLeads.length} of {filteredLeads.length} leads
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
