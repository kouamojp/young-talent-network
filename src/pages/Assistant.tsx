import { AIAssistantChat } from "@/components/ai/AIAssistantChat";
import { AgentSuggestionsWidget } from "@/components/ai/AgentSuggestionsWidget";

const Assistant = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat - main area */}
        <div className="lg:col-span-2 border rounded-xl overflow-hidden bg-card">
          <AIAssistantChat fullPage />
        </div>

        {/* Agent suggestions - sidebar */}
        <div className="space-y-4">
          <AgentSuggestionsWidget />
        </div>
      </div>
    </div>
  );
};

export default Assistant;
