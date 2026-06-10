import { AIAssistantChat } from "@/components/ai/AIAssistantChat";
import { AgentSuggestionsWidget } from "@/components/ai/AgentSuggestionsWidget";
import YatScoreCard from "@/components/yat-score/YatScoreCard";

const Assistant = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border rounded-xl overflow-hidden bg-card">
          <AIAssistantChat fullPage />
        </div>
        <div className="space-y-4">
          <YatScoreCard showAnalyzeButton={false} />
          <AgentSuggestionsWidget />
        </div>
      </div>
    </div>
  );
};

export default Assistant;
