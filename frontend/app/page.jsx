"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";
import CodeEditor from "@/components/code-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [previousSnippets, setPreviousSnippets] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Function to fetch previous snippets
  const fetchPreviousSnippets = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5001/api/analyze/snippets",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch previous snippets");
      }

      const data = await response.json();
      setPreviousSnippets(data.data || []);
    } catch (err) {
      console.error("Error fetching snippets:", err);
      setError(err.message || "Failed to load previous snippets");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !language || !code) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/analyze/snippets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            language,
            code,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      const data = await response.json();
      const analysis = data.data.analysis;
      setResult(analysis);
      
      // Refresh snippets list after successful submission
      fetchPreviousSnippets();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle history view and fetch snippets if needed
  const toggleHistory = () => {
    if (!showHistory && previousSnippets.length === 0) {
      fetchPreviousSnippets();
    }
    setShowHistory(!showHistory);
  };

  // Function to load a snippet for analysis
  const loadSnippet = (snippet) => {
    setTitle(snippet.title);
    setLanguage(snippet.language);
    setCode(snippet.code);
    setShowHistory(false);
    setResult(snippet.analysis); // If the analysis is stored with the snippet
  };

  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">CodeIntel</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={toggleHistory}
            className="flex items-center gap-2"
          >
            {showHistory ? "Back to Editor" : "View History"}
            {historyLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>
      
      {showHistory ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Previous Code Snippets</CardTitle>
              <CardDescription>
                View and load your previously analyzed code snippets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previousSnippets.length > 0 ? (
                <div className="space-y-4">
                  {previousSnippets.map((snippet, index) => (
                    <div 
                      key={index} 
                      className="p-4 border rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => loadSnippet(snippet)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{snippet.title}</h3>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs capitalize">
                          {snippet.language}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(snippet.createdAt).toLocaleString()}
                      </div>
                      <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-xs line-clamp-3 overflow-hidden">
                        <code>{snippet.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              ) : historyLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No previous snippets found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Code Input</CardTitle>
            <CardDescription>
              Enter your code snippet details and code for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your code snippet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Programming Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="swift">Swift</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <div className="border rounded-md overflow-hidden">
                  <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={language || "javascript"}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Code"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              AI-powered insights about your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="bugs">Bugs</TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                  <TabsTrigger value="vulnerabilities">
                    Vulnerabilities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300">
                      Code Overview
                    </h3>
                    <div className="whitespace-pre-line text-sm bg-white dark:bg-gray-800 p-4 rounded-md shadow-inner">
                      {result.summary}
                    </div>
                  </div>

                  {(result.timeComplexity || result.spaceComplexity) && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.timeComplexity && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg shadow-sm relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-16 h-16 text-amber-200 dark:text-amber-900 opacity-20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm1-13h-2v5h-3l4 4 4-4h-3V7z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-amber-800 dark:text-amber-300">
                            Time Complexity
                          </h3>
                          <div className="font-mono text-lg bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-inner inline-block">
                            {result.timeComplexity}
                          </div>
                        </div>
                      )}

                      {result.spaceComplexity && (
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-lg shadow-sm relative overflow-hidden">
                          <div className="absolute right-0 top-0 w-16 h-16 text-emerald-200 dark:text-emerald-900 opacity-20">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                              <path d="M7 12h2v5h2v-5h2v-3h-6z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-emerald-800 dark:text-emerald-300">
                            Space Complexity
                          </h3>
                          <div className="font-mono text-lg bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-inner inline-block">
                            {result.spaceComplexity}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bugs" className="space-y-4">
                  {result.bugs && result.bugs.length > 0 ? (
                    <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 text-rose-800 dark:text-rose-300 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Issues Found ({result.bugs.length})
                      </h3>
                      <div className="space-y-3">
                        {result.bugs.map((bug, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border-l-4 border-rose-500"
                          >
                            <p className="text-lg whitespace-pre-line">
                              <span className="font-mono text-rose-600 dark:text-rose-400 mr-2">
                                {index + 1}.
                              </span>
                              {typeof bug === "string" ? bug : bug.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg shadow-sm text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p className="text-xl font-medium text-green-800 dark:text-green-300">
                        No bugs detected
                      </p>
                      <p className="text-green-600 dark:text-green-400 mt-1">
                        Your code looks clean!
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  {result.suggestions && result.suggestions.length > 0 ? (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 text-amber-800 dark:text-amber-300 flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2" />
                        Improvement Ideas ({result.suggestions.length})
                      </h3>
                      <div className="space-y-4">
                        {result.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border-l-4 border-amber-500"
                          >
                            <p className="text-lg whitespace-pre-line">
                              <span className="font-mono text-amber-600 dark:text-amber-400 mr-2">
                                {index + 1}.
                              </span>
                              {typeof suggestion === "string"
                                ? suggestion
                                : suggestion.description}
                            </p>
                            {typeof suggestion !== "string" &&
                              suggestion.code && (
                                <div className="mt-3">
                                  <div className="flex items-center mb-1">
                                    <div className="h-1 w-1 rounded-full bg-gray-400 mr-1"></div>
                                    <div className="h-1 w-1 rounded-full bg-gray-400 mr-1"></div>
                                    <div className="h-1 w-1 rounded-full bg-gray-400 mr-1"></div>
                                    <span className="text-xs text-gray-500 ml-1">
                                      Suggested code
                                    </span>
                                  </div>
                                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-base border border-gray-200 dark:border-gray-700">
                                    <code>{suggestion.code}</code>
                                  </pre>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg shadow-sm text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                      <p className="text-xl font-medium text-blue-800 dark:text-blue-300">
                        No suggestions available
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 mt-1">
                        Your code already follows best practices!
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="vulnerabilities" className="space-y-4">
                  {result.vulnerabilities &&
                  result.vulnerabilities.length > 0 ? (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-lg shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 text-purple-800 dark:text-purple-300 flex items-center">
                        <ShieldAlert className="h-5 w-5 mr-2" />
                        Security Concerns ({result.vulnerabilities.length})
                      </h3>
                      <div className="space-y-3">
                        {result.vulnerabilities.map((vulnerability, index) => {
                          // Determine severity level for styling
                          const severity =
                            typeof vulnerability === "string"
                              ? "medium"
                              : vulnerability.severity || "medium";
                          const severityColor =
                            severity === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : severity === "medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";

                          return (
                            <div
                              key={index}
                              className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border-l-4 border-purple-500"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-lg whitespace-pre-line">
                                  <span className="font-mono text-purple-600 dark:text-purple-400 mr-2">
                                    {index + 1}.
                                  </span>
                                  {typeof vulnerability === "string"
                                    ? vulnerability
                                    : vulnerability.description}
                                </p>
                                {typeof vulnerability !== "string" &&
                                  vulnerability.severity && (
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${severityColor} ml-2 uppercase`}
                                    >
                                      {vulnerability.severity}
                                    </span>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg shadow-sm text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p className="text-xl font-medium text-green-800 dark:text-green-300">
                        No vulnerabilities detected
                      </p>
                      <p className="text-green-600 dark:text-green-400 mt-1">
                        Your code appears to be secure!
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <Lightbulb className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Enter your code details and click "Analyze Code" to get
                  AI-powered insights about your code snippet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </main>
  );
}
