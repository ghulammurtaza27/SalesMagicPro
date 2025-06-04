import { Header } from "@/components/layout/header";
import { LeadQualificationTable } from "@/components/leads/lead-qualification-table";
import { LeadIntakeModal } from "@/components/leads/lead-intake-modal";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { useState } from "react";

export default function Leads() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full">
      <Header 
        title="Lead Management"
        description="Manage and qualify your sales leads"
        actions={
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => {
                // Export functionality
                alert("Exporting leads to CSV...");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
        }
      />
      
      <div className="p-6">
        <LeadQualificationTable />
      </div>

      <LeadIntakeModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
