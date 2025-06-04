import { Header } from "@/components/layout/header";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";

export default function Pipeline() {
  return (
    <div className="h-full">
      <Header 
        title="Deal Pipeline"
        description="Track and manage your sales pipeline"
      />
      
      <div className="p-6">
        <PipelineOverview />
      </div>
    </div>
  );
}
