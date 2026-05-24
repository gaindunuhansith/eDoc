"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  ChevronDown,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalyzeAdmin, type AdminAnalysisResponse } from "@/api/aiApi";

export default function AdminDashboardAssistant() {
  const analyzeAdmin = useAnalyzeAdmin();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [chatActive, setChatActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AdminAnalysisResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const isAnalyzing = analyzeAdmin.isPending;

  const handleSubmit = async () => {
    if (!query.trim() || isAnalyzing) return;
    
    const currentQuery = query;
    setSubmittedQuery(currentQuery);
    setQuery("");
    setChatActive(true);
    setAnalysisResult(null);
    setApiError(null);

    try {
      const result = await analyzeAdmin.mutateAsync({ query: currentQuery });
      setAnalysisResult(result);
    } catch (err) {
      console.error("AI Admin Analysis failed:", err);
      setApiError(err instanceof Error ? err.message : "Failed to analyze admin query.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] p-6 bg-background text-foreground w-full relative font-sans">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="font-semibold flex items-center gap-2 rounded-full px-4 h-9 shadow-sm">
            <Bot size={12} />
            eDoc AI Admin <ChevronDown size={14} className="text-muted-foreground ml-1" />
          </Button>
        </div>
      </div>

      {!chatActive ? (
        <div className="flex-1 flex flex-col items-center justify-center py-2 overflow-y-auto">
          <div className="text-center max-w-4xl w-full mb-6">
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-blue-400/80">
              Hello, Admin
            </h1>
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
              System Insights & Analytics
            </h2>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-y-auto mt-6 px-4">
          <div className="flex justify-end mb-8 w-full animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-gray-100 dark:bg-neutral-800 text-foreground px-5 py-3.5 rounded-3xl rounded-tr-sm max-w-[80%] text-[15px] font-medium leading-relaxed">
              {submittedQuery}
            </div>
          </div>
          
          <div className="flex justify-start mb-8 w-full gap-4">
            <div className="mt-1">
              <Sparkles size={24} className={isAnalyzing ? "text-blue-500 animate-pulse" : "text-blue-500"} fill="currentColor" />
            </div>
            <div className="flex-1 max-w-[85%] mt-2">
              {isAnalyzing ? (
                <div className="space-y-4 w-full animate-pulse">
                   <div className="h-3 bg-blue-100 dark:bg-blue-900/40 rounded-md w-full"></div>
                   <div className="h-3 bg-blue-100 dark:bg-blue-900/40 rounded-md w-[92%]"></div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6 text-[15px] leading-relaxed text-foreground">
                  <div>
                    <p className="font-medium text-lg text-blue-600 dark:text-blue-400 mb-2">Operational Insight</p>
                    {analysisResult.operational_insight}
                  </div>
                  
                  {analysisResult.actionable_metrics.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Actionable Metrics</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysisResult.actionable_metrics.map((metric, i) => (
                          <li key={i}>
                            {metric}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.service_errors.length > 0 && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                      {analysisResult.service_errors.join(" ")}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-500">Analysis failed. Please try again.</div>
              )}
              {apiError && <div className="mt-3 text-red-500">{apiError}</div>}
            </div>
          </div>
        </div>
      )}

      <div className={`w-full max-w-[800px] mx-auto transition-all duration-300 ${chatActive ? "mt-auto pt-4 pb-2" : "mt-0"}`}>
        <div className="relative flex flex-col w-full bg-[#fcfcfc] dark:bg-[#1C1C1C] rounded-[1.5rem] p-4 shadow-sm border border-gray-100 dark:border-neutral-800/80">
          <textarea
            className="w-full resize-none text-[15px] bg-transparent outline-none placeholder:text-muted-foreground text-foreground min-h-[40px] px-1 font-medium"
            placeholder={chatActive ? "Ask eDoc AI..." : "Ask about system performance, appointments, or payment trends..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <div className="flex items-center justify-between mt-6">
            <Button onClick={handleSubmit} disabled={isAnalyzing} variant="secondary" size="sm" className="rounded-full bg-blue-50 text-blue-600">
              <Sparkles size={16} className="mr-2" /> Analyze System
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
