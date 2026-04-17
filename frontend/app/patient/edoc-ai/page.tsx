"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Sparkles, 
  Image as ImageIcon, 
  Lightbulb, 
  Globe, 
  Mic, 
  Paperclip, 
  HeartPulse, 
  ChevronDown, 
  MoreHorizontal, 
  Link as LinkIcon, 
  Activity,
  Languages,
  HelpCircle,
  Stethoscope,
  Plus
} from "lucide-react";
import { useUser } from "@/store/store";
import { Button } from "@/components/ui/button";
import { type PatientAnalysisResponse } from "@/api/aiApi";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getMockPatientAnalysis = (symptoms: string): PatientAnalysisResponse => {
  const normalizedSymptoms = symptoms.toLowerCase();

  if (normalizedSymptoms.includes("cough") || normalizedSymptoms.includes("coughing") || normalizedSymptoms.includes("fever")) {
    return {
      analysis:
        "Your symptoms suggest a likely upper respiratory infection, such as a viral flu-like illness. Please rest, stay hydrated, monitor your temperature, and avoid self-medicating with antibiotics unless prescribed by a doctor.",
      recommended_actions: [
        "Take plenty of fluids and rest for 24-48 hours.",
        "Use paracetamol/acetaminophen for fever as advised by your doctor.",
        "Track warning signs like breathing difficulty, persistent high fever, or chest pain.",
      ],
      recommended_specialty: "General Physician or Pulmonologist",
      available_doctors: [],
      service_errors: [],
    };
  }

  return {
    analysis:
      "Based on the symptoms you shared, this appears non-emergency. Maintain hydration, take adequate rest, and monitor for progression over the next day.",
    recommended_actions: [
      "Continue symptom observation and log changes.",
      "Book an appointment if symptoms worsen or persist for more than 48 hours.",
    ],
    recommended_specialty: "General Physician",
    available_doctors: [],
    service_errors: [],
  };
};

export default function PatientDashboardAssistant() {
  const user = useUser();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [chatActive, setChatActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PatientAnalysisResponse | null>(null);

  const handleSubmit = async () => {
    if (!query.trim() || isAnalyzing) return;
    
    const currentQuery = query;
    setSubmittedQuery(currentQuery);
    setQuery("");
    setChatActive(true);
    setAnalysisResult(null);
    setIsAnalyzing(true);

    try {
      await wait(2200);
      const result = getMockPatientAnalysis(currentQuery);
      setAnalysisResult(result);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
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
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="font-semibold flex items-center gap-2 rounded-full px-4 h-9 shadow-sm border-gray-200 dark:border-gray-800">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs shadow-sm">
              <Bot size={12} />
            </span>
            eDoc AI <ChevronDown size={14} className="text-muted-foreground ml-1" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground h-9 w-9">
            <MoreHorizontal size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground h-9 w-9">
            <LinkIcon size={18} />
          </Button>
        </div>
      </div>

      {/* Conditional Layout Switching */}
      {!chatActive ? (
        <div className="flex-1 flex flex-col items-center justify-center py-2 overflow-y-auto">
          <div className="flex-col items-center justify-center text-center max-w-4xl w-full mb-6 mt-2">
            <div className="relative mb-4 mx-auto flex items-center justify-center w-28 h-28">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-[32px] opacity-20"></div>
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-[24px] opacity-40 mix-blend-overlay"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#E6F0FF] to-white dark:from-blue-900/40 dark:to-blue-800/20 shadow-inner flex items-center justify-center border border-white/50 dark:border-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400/80 to-blue-200/90 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1),0_5px_15px_rgba(59,130,246,0.3)] backdrop-blur-sm"></div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-2 text-blue-400/80 dark:text-blue-300">
              Hello, {user?.name?.split(' ')[0] || "there"}
            </h1>
            <h2 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
              How can I assist you today?
            </h2>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-y-auto mt-6 px-4">
          {/* Active Chat Conversation - User Message */}
          <div className="flex justify-end mb-8 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gray-100 dark:bg-neutral-800 text-foreground px-5 py-3.5 rounded-3xl rounded-tr-sm max-w-[80%] text-[15px] font-medium leading-relaxed">
              {submittedQuery}
            </div>
          </div>
          
          {/* Active Chat Conversation - AI Response */}
          <div className="flex justify-start mb-8 w-full gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="mt-1">
              <Sparkles size={24} className={isAnalyzing ? "text-blue-500 animate-pulse" : "text-blue-500"} fill="currentColor" />
            </div>
            <div className="flex-1 max-w-[85%] mt-2">
              {isAnalyzing ? (
                <div className="space-y-4 w-full">
                   <div className="h-3 bg-gradient-to-r from-blue-100 to-gray-100 dark:from-blue-900/40 dark:to-neutral-800 rounded-md w-full animate-pulse"></div>
                   <div className="h-3 bg-gradient-to-r from-blue-100 to-gray-100 dark:from-blue-900/40 dark:to-neutral-800 rounded-md w-[92%] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                   <div className="h-3 bg-gradient-to-r from-blue-100 to-gray-100 dark:from-blue-900/40 dark:to-neutral-800 rounded-md w-[85%] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6 text-[15px] leading-relaxed text-foreground">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="font-medium text-lg text-blue-600 dark:text-blue-400 mb-2">Analysis</p>
                    {analysisResult.analysis}
                  </div>
                  
                  {analysisResult.recommended_actions.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Recommended Actions</p>
                      <ul className="list-decimal pl-5 space-y-1">
                        {analysisResult.recommended_actions.map((action, i) => (
                          <li key={i}>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysisResult.recommended_specialty && (
                    <div>
                      <p className="font-semibold mb-1">Recommended Specialist</p>
                      <p>{analysisResult.recommended_specialty}</p>
                      <p className="text-sm text-muted-foreground">Based on your shared symptoms.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-500 font-medium">Something went wrong with the analysis. Please try again.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`w-full max-w-[800px] mx-auto transition-all duration-300 ${chatActive ? "mt-auto pt-4 pb-2" : "mt-0"}`}>
        <div className="relative flex flex-col w-full bg-[#fcfcfc] dark:bg-[#1C1C1C] rounded-[1.5rem] p-4 shadow-sm border border-gray-100 dark:border-neutral-800/80 focus-within:ring-[3px] focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all">
          <textarea
            className="w-full resize-none text-[15px] bg-transparent outline-none placeholder:text-muted-foreground text-foreground min-h-[40px] px-1 font-medium"
            placeholder={chatActive ? "Ask eDoc AI..." : "Describe your symptoms or ask a health-related question..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          
          <div className="flex items-center justify-between mt-6">
            {!chatActive ? (
              <div className="flex items-center gap-1.5">
                <Button 
                  onClick={handleSubmit}
                  disabled={isAnalyzing}
                  variant="secondary" 
                  size="sm" 
                  className="rounded-full bg-[#f0f6ff] dark:bg-blue-900/10 text-[#5c8aff] dark:text-blue-400 border border-[#e6efff] dark:border-blue-900/20 hover:bg-[#e6efff] dark:hover:bg-blue-900/30 gap-2 h-9 px-3.5 font-medium shadow-sm transition-colors"
                >
                  <Sparkles size={16} />
                  Analyze Symptoms
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <ImageIcon size={18} strokeWidth={1.5} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <Lightbulb size={18} strokeWidth={1.5} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                  <Plus size={18} strokeWidth={2} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground gap-2 h-9 px-3 font-medium transition-colors">
                  <Sparkles size={16} />
                  Tools
                </Button>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1a1a1a] rounded-full p-1 border border-gray-100 dark:border-neutral-800">
              {!chatActive ? (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                  <Globe size={16} strokeWidth={1.5} />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="h-8 px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors hidden md:flex items-center">
                  Fast <ChevronDown size={14} className="ml-1" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-full transition-colors ${chatActive ? 'text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-neutral-800' : 'bg-[#e6efff] dark:bg-blue-900/20 text-[#5c8aff] dark:text-blue-400 hover:bg-[#d6e4ff] dark:hover:bg-blue-900/40'}`}>
                <Mic size={16} strokeWidth={1.5} />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom subtle links */}
        {!chatActive && (
          <div className="flex items-center justify-between px-2 text-[13px] mt-4">
            <button className="flex items-center text-muted-foreground hover:text-foreground gap-2 transition-colors">
              <Sparkles size={14} className="text-[#a8a8a8]" />
              <span className="font-medium text-[#444]">Saved logs</span>
            </button>
            <button className="flex items-center text-muted-foreground hover:text-foreground gap-2 transition-colors bg-white dark:bg-[#131313] border border-gray-200 dark:border-neutral-800 rounded-full px-3 py-1.5 shadow-sm">
              <Paperclip size={14} className="text-[#a8a8a8]" />
              <span className="font-medium text-[#444]">Attach reports</span>
            </button>
          </div>
        )}

        {/* Restored Quick Action Suggestion Cards */}
        {!chatActive && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mx-auto mt-8 mb-4">
            <div className="group flex flex-col p-5 bg-[#fafafa] dark:bg-[#131313] rounded-2xl border border-gray-100 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-neutral-700 cursor-pointer transition-all hover:shadow-sm">
              <div className="mb-4 text-muted-foreground">
                <HeartPulse size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-foreground text-[15px] mb-1.5">Describe Symptoms</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Input your symptoms to log them and get a preliminary analysis.</p>
            </div>
            
            <div className="group flex flex-col p-5 bg-[#fafafa] dark:bg-[#131313] rounded-2xl border border-gray-100 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-neutral-700 cursor-pointer transition-all hover:shadow-sm">
              <div className="mb-4 text-muted-foreground">
                <Activity size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-foreground text-[15px] mb-1.5">Medical Suggestions</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Get instant recommendations for potential ailments based on your symptoms.</p>
            </div>
            
            <div className="group flex flex-col p-5 bg-[#fafafa] dark:bg-[#131313] rounded-2xl border border-gray-100 dark:border-neutral-800 hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-gray-200 dark:hover:border-neutral-700 cursor-pointer transition-all hover:shadow-sm">
              <div className="mb-4 text-muted-foreground">
                <Stethoscope size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-foreground text-[15px] mb-1.5">Doctor Specialties</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">Find out the most suitable specialists for your recommended health suggestions.</p>
            </div>
          </div>
        )}
        
        {chatActive && (
           <div className="text-center text-xs text-muted-foreground pt-4 pb-0 flex items-center justify-center gap-1">
             eDoc AI can make mistakes. Always verify with your doctor.
           </div>
        )}
      </div>
      
      {/* Floating Buttons */}
      {!chatActive && (
        <div className="absolute bottom-6 right-6 flex gap-3">
          <Button variant="outline" size="icon" className="rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-neutral-800 text-muted-foreground hover:text-foreground h-[42px] w-[42px]">
            <Languages size={18} strokeWidth={1.5} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-neutral-800 text-muted-foreground hover:text-foreground h-[42px] w-[42px]">
            <HelpCircle size={18} strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  );
}
