"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, CheckCircle, Loader2, ClipboardCopy } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
// Dialog imports removed: API key modal no longer needed

// Define an interface for the image style options
interface ImageStyle {
  id: string;
  name: string;
  src: string;
  alt: string;
  prompt: string;
}

// Define the image style options using the provided images
const imageStyleOptions: ImageStyle[] = [
  {
    id: "style1",
    name: "GHIBLI",
    src: "/url-to-image/1.png",
    alt: "Studio Ghibli art style",
    prompt: "1. Studio Ghibli illustration style\n2. Soft, pastel colors\n3. Hand-drawn aesthetic"
  },
  {
    id: "style2",
    name: "LEGO",
    src: "/url-to-image/2.png",
    alt: "LEGO brick style",
    prompt: "1. LEGO brick construction\n2. Bright, primary colors\n3. Toy-like simplified forms"
  },
  {
    id: "style3",
    name: "CLAYMATION",
    src: "/url-to-image/3.png",
    alt: "Claymation style",
    prompt: "1. Clay-like texture\n2. Stop-motion aesthetic\n3. Slightly imperfect surfaces"
  },
  {
    id: "style4",
    name: "LOGO",
    src: "/url-to-image/4.png",
    alt: "Clean vector art logo style",
    prompt: "1. Clean vector art logo\n2. Flat colors\n3. Bold geometric shapes"
  },
  {
    id: "style5",
    name: "WHIMSICAL",
    src: "/url-to-image/5.png",
    alt: "Whimsical illustration style",
    prompt: "1. Whimsical storybook illustration\n2. Soft pastel palette\n3. Playful shapes"
  },
  {
    id: "style6",
    name: "SUMI-E INK WASH",
    src: "/url-to-image/6.png",
    alt: "Traditional sumi-e ink wash style",
    prompt: "1. Traditional sumi-e ink wash style\n2. Stark contrasts between black and white\n3. Balanced composition"
  },
  {
    id: "style7",
    name: "MINIMAL CORPORATE",
    src: "/url-to-image/7.png",
    alt: "Clean minimalist corporate style",
    prompt: "1. Apple-like minimalism, center composition, extreme white space\n2. Helvetica Neue typography, high contrast scale, left-aligned\n3. Monochrome palette, single blue accent, soft drop shadows"
  },
  {
    id: "style8",
    name: "ISOMETRIC 3D",
    src: "/url-to-image/8.png",
    alt: "Isometric 3D business illustration",
    prompt: "1. 30-degree isometric view, clean geometric perspective\n2. Purple-orange gradient mesh, dramatic cast shadows\n3. Floating geometric shapes, layered composition"
  },
  {
    id: "style9",
    name: "PHOTOREALISTIC PROFESSIONAL",
    src: "/url-to-image/9.png",
    alt: "Photorealistic business photography",
    prompt: "1. Corporate photography, shallow DOF, subject focus\n2. Golden hour backlighting, premium material textures\n3. Executive boardroom setting, professional atmosphere"
  },
  {
    id: "style10",
    name: "GLASSMORPHIC MODERN",
    src: "/url-to-image/10.png",
    alt: "Glassmorphic frosted glass interface",
    prompt: "1. Frosted glass panels, 80% opacity, vibrant backdrop blur\n2. Neon gradient bleeding, translucent layered depth\n3. Thin white borders, floating cards, soft shadows"
  },
  {
    id: "style11",
    name: "BRUTALIST TECH",
    src: "/url-to-image/11.png",
    alt: "Raw brutalist tech aesthetic",
    prompt: "1. Raw concrete texture, harsh black blocks, no curves\n2. Monospace terminal font, ASCII elements, stark contrast\n3. Yellow accent on charcoal gray, grid layout"
  }
];

const sectionHeadingClass = "text-2xl sm:text-3xl font-semibold tracking-tight text-foreground text-balance";
const sectionDescriptionClass = "text-base text-muted-foreground leading-relaxed text-balance";

// Add proper interface for the error type at the top of the file
// Used for type checking when handling API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ApiError extends Error {
  status?: number;
}

// Add interface for scrape response
interface ScrapeResponse {
  success: boolean;
  markdown?: string;
  data?: {
    markdown?: string;
  };
  error?: string;
}

// Add interface for the image generation response
interface ImageGenResponse {
  imageBase64?: string;
  contentType?: string;
  error?: string;
}

// Add interface for JSON streaming response chunks
interface StreamingChunk {
  type: 'thinking' | 'text-delta' | 'done';
  value?: string;
  textDelta?: string;
}

// Simple Progress Bar Component
const UrlToImageProgressBar = ({ activeStep }: { activeStep: number }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <span className="text-sm text-muted-foreground">Step {activeStep} of 6</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-200 ease-in-out"
          style={{ width: `${(activeStep / 6) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default function UrlToImagePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [url, setUrl] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  // Welcome toast after login via magic link
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") {
      toast.success("Welcome back!");
      params.delete("welcome");
      const search = params.toString();
      const nextUrl = window.location.pathname + (search ? `?${search}` : "") + window.location.hash;
      window.history.replaceState(null, "", nextUrl);
    }
  }, []);
  
  // Handle style parameter from gallery
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const styleParam = params.get("style");
    if (styleParam) {
      // Convert style name to style ID
      const matchingStyle = imageStyleOptions.find(
        style => style.name.toLowerCase().replace(/ /g, '-') === styleParam
      );
      if (matchingStyle) {
        setSelectedStyleId(matchingStyle.id);
        setStylePrompt(matchingStyle.prompt);
        setCurrentStep(2); // Jump to style selection step
        // Remove style param from URL
        params.delete("style");
        const search = params.toString();
        const nextUrl = window.location.pathname + (search ? `?${search}` : "") + window.location.hash;
        window.history.replaceState(null, "", nextUrl);
      }
    }
  }, []);
  
  // Load credits on mount and after purchase success
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/credits', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setCredits(typeof data?.credits === 'number' ? data.credits : null);
      } catch {}
    };
    load();
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('purchase') === 'success') load();
    }
  }, []);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [websiteContent, setWebsiteContent] = useState<string | null>(null);
  const [isScrapingComplete, setIsScrapingComplete] = useState(false);
  const [thinking, setThinking] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [stylePrompt, setStylePrompt] = useState<string>("");
  // API keys are provided by infrastructure; no client-side API key handling needed

  // Add a reference for the content container to prevent page jumping
  // This reference is not being used - removing it
  // const contentContainerRef = useRef<HTMLDivElement>(null);

  // Removed API key checks and modal; infrastructure supplies server-side keys

  const handleUrlSubmit = async () => {
    if (!url) return;
    setError(null);
    // Proceed directly; server uses configured keys
    setCurrentStep(2);
  };

  const handleStyleSelect = async (styleId: string) => {
    // Block scraping if out of credits
    if (credits !== null && credits <= 0) {
      setError('You are out of credits. Buy credits to continue.');
      return;
    }
    setSelectedStyleId(styleId);

    // Initialize the style prompt with the selected style's prompt
    const selectedStyle = imageStyleOptions.find(style => style.id === styleId);
    if (selectedStyle) {
      setStylePrompt(selectedStyle.prompt);
    }

    // Clear any saved prompts in session storage to prevent reusing old prompts
    sessionStorage.removeItem('savedPrompt');
    sessionStorage.removeItem('savedStylePrompt');

    setCurrentStep(3);
    setIsLoading(true);
    setGeneratedImage(null);
    setGeneratedPrompt(null);
    setWebsiteContent(null);
    setIsScrapingComplete(false);
    setError(null);
    setThinking([]);

    try {
  // 1. Scrape Website
  setLoadingMessage("Extracting website content...");

      // Basic JSON headers; server has access to API keys via environment
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url, formats: ['markdown'] })
      });
      const ct = scrapeResponse.headers.get('content-type') || '';
      if (!scrapeResponse.ok) {
        let message = `Scraping failed with status: ${scrapeResponse.status}`;
        try {
          if (ct.includes('application/json')) {
            const errData = await scrapeResponse.json() as ScrapeResponse;
            message = errData.error || message;
          } else {
            const text = await scrapeResponse.text();
            if (text) message = text;
          }
        } catch {
          // Fallback to text if JSON parsing fails or body already consumed
          try {
            const text = await scrapeResponse.text();
            if (text) message = text;
          } catch {
            // ignore
          }
        }
        throw new Error(message);
      }
      if (!ct.includes('application/json')) {
        const text = await scrapeResponse.text();
        throw new Error(text || 'Unexpected non-JSON response from scrape API.');
      }
      const scrapeData = await scrapeResponse.json() as ScrapeResponse;
      // Check for markdown directly at the top level or under data object
      const markdown = scrapeData.markdown || scrapeData.data?.markdown;

      if (!markdown) {
        console.error("Scraping did not return markdown:", scrapeData);
        throw new Error('Failed to get website content (markdown).');
      }

      // Store website content and mark scraping as complete
      setWebsiteContent(markdown);
      setIsScrapingComplete(true);
      setIsLoading(false);

    } catch (err: unknown) {
      console.error("Error in handleStyleSelect:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      if (currentStep === 3) {
        setCurrentStep(2);
      }
    }
  };

  const handleGeneratePromptAndImage = async () => {
    if (!websiteContent) return;

    setCurrentStep(4);
    setError(null);

    // Clear any cached prompt
    setGeneratedPrompt("");

    // Check if we have saved prompts from previous session
    const savedPrompt = sessionStorage.getItem('savedPrompt');
    const savedStylePrompt = sessionStorage.getItem('savedStylePrompt');

    if (savedPrompt) {
      // If we have saved prompts, restore them
      setGeneratedPrompt(savedPrompt);
      if (savedStylePrompt) {
        setStylePrompt(savedStylePrompt);
      }
      // Clear the saved prompts to avoid using them again if user starts over
      sessionStorage.removeItem('savedPrompt');
      sessionStorage.removeItem('savedStylePrompt');
      return; // Skip the API call if we have saved prompts
    }

    // Otherwise, generate new prompts
    setIsLoading(true);
    setGeneratedPrompt(""); // Initialize with empty string
    setThinking([]);
    setIsThinking(true);

    try {
      // 2. Generate Image Prompt with Gemini using streaming with thinking steps
      setLoadingMessage("Generating prompt with Gemini...");

      // Prepare headers based on whether we're using env variables or user input
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: `Create ONE coherent sentence as an image generation prompt based on this website:

${websiteContent.substring(0, 3000)}

Your prompt should:
- Be a single, complete sentence (15-25 words maximum)
- Include the main product/service from the website
- Incorporate the website's actual tagline or headline (in quotes)
- Mention a key visual element from the website
- Be formatted as a direct instruction to an image generator

Example of good prompt:
"Create an image of a sleek coffee subscription box with a ceramic mug, featuring the tagline 'Morning Brew Delivered'"

Example of bad prompt:
"1. Coffee subscription 2. Ceramic mug 3. Morning Brew Delivered"

The final prompt should read naturally as ONE complete instruction, not a list of elements.`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        buffer += text;

        // Process complete JSON objects
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && trimmedLine.length > 0) {
            try {
              const chunk = JSON.parse(trimmedLine) as StreamingChunk;

              if (chunk.type === 'thinking') {
                // Just update the thinking state without triggering scrolls
                setThinking(prev => [...prev, chunk.value || '']);
              } else if (chunk.type === 'text-delta') {
                setGeneratedPrompt(prev => (prev || "") + (chunk.textDelta || ''));
                setIsThinking(false);
              } else if (chunk.type === 'done') {
                setIsThinking(false);
                setIsLoading(false);
              }
            } catch (e) {
              console.warn('Failed to parse JSON line:', trimmedLine, 'Error:', e);
              // Skip malformed JSON lines instead of crashing
            }
          }
        }
      }

    } catch (err: unknown) {
      console.error("Error in handleGeneratePromptAndImage:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      setIsThinking(false);
      if (currentStep === 4) {
        setCurrentStep(3); // Go back to website content
      }
    }
  };

  const handleGenerateImage = async () => {
    if (!generatedPrompt) return;

    setCurrentStep(5);
    setIsLoading(true);
    setError(null);

    try {
      // Combine content prompt and style prompt
      const combinedPrompt = `${generatedPrompt}\n\nSTYLE PROMPT:\n${stylePrompt}`;

      // Generate Image with the combined prompt
      setLoadingMessage(`Generating image with Imagen 4...`);

      // Prepare headers based on whether we're using env variables or user input
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      const imageGenResponse = await fetch('/api/imagen4', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: combinedPrompt })
      });

      if (!imageGenResponse.ok) {
        // Handle credits/daily/regen limits gracefully
        const status = imageGenResponse.status;
        let message = `Image generation failed with status: ${status}`;
        const dailyHeader = imageGenResponse.headers.get('X-Daily-Remaining');
        try {
          const errData = (await imageGenResponse.json()) as ImageGenResponse & { remaining?: number; dailyRemaining?: number };
          if (errData.error) message = errData.error;
        } catch {}

        if (status === 402) {
          // Sync credits from server header if present
          try {
            const rem = imageGenResponse.headers.get('X-Credits-Remaining');
            if (rem !== null) {
              const n = parseInt(rem, 10);
              if (!Number.isNaN(n)) {
                setCredits(n);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('credits:update', { detail: n }));
                }
              }
            }
          } catch {}
          // Out of credits – prompt to buy
          setError('You are out of credits. Buy credits to continue.');
          setIsLoading(false);
          setCurrentStep(4);
          return;
        }
        if (status === 429) {
          // Hide daily-cap details from UI; keep regen message if present
          const isDaily = dailyHeader === '0';
          const uiMessage = /Regeneration limit/i.test(message)
            ? message
            : (isDaily ? 'Temporarily limited. Please try again later.' : 'Please try again later.');
          // Try to sync credits if header present
          try {
            const rem = imageGenResponse.headers.get('X-Credits-Remaining');
            if (rem !== null) {
              const n = parseInt(rem, 10);
              if (!Number.isNaN(n)) {
                setCredits(n);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('credits:update', { detail: n }));
                }
              }
            }
          } catch {}
          setError(uiMessage);
          setIsLoading(false);
          setCurrentStep(4);
          return;
        }

        throw new Error(message);
      }

      const imageGenData = await imageGenResponse.json() as ImageGenResponse;
      // Update credits from response headers on success
      try {
        const rem = imageGenResponse.headers.get('X-Credits-Remaining');
        if (rem !== null) {
          const n = parseInt(rem, 10);
          if (!Number.isNaN(n)) {
            setCredits(n);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('credits:update', { detail: n }));
            }
          }
        }
      } catch {}
      if (!imageGenData.imageBase64) {
        console.error("Imagen4 did not return image data:", imageGenData);
        throw new Error('Failed to generate image.');
      }

      setGeneratedImage(`data:${imageGenData.contentType};base64,${imageGenData.imageBase64}`);
      setIsLoading(false);
      setCurrentStep(6);

    } catch (err: unknown) {
      console.error("Error generating image:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setIsLoading(false);
      // Stay on prompt editing step
      setCurrentStep(4);
    }
  };

  const resetProcess = () => {
    // Clear any saved prompts in session storage
    sessionStorage.removeItem('savedPrompt');
    sessionStorage.removeItem('savedStylePrompt');

    // Clear local storage cache if any
    try {
      localStorage.removeItem('cachedPrompt');
      localStorage.removeItem('cachedStylePrompt');
    } catch (e) {
      console.warn('Could not access localStorage:', e);
    }

    setCurrentStep(1);
    setUrl("");
    setSelectedStyleId(null);
    setGeneratedImage(null);
    setIsLoading(false);
    setLoadingMessage("");
    setGeneratedPrompt("");
    setStylePrompt("");
    setWebsiteContent(null);
    setIsScrapingComplete(false);
    setError(null);
    setThinking([]);
    setIsThinking(false);
  };

  const startCheckout = async (
    pack: 'starter' | 'creator' | 'pro' = 'starter',
    options?: { promotionCode?: string }
  ) => {
    try {
      const payload: { pack: typeof pack; promotionCode?: string } = { pack };
      if (options?.promotionCode) {
        payload.promotionCode = options.promotionCode;
      }
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore
    }
  };

  const getSelectedStyleName = () => {
    return imageStyleOptions.find(s => s.id === selectedStyleId)?.name || selectedStyleId || "selected style";
  };

  const copyMarkdownToClipboard = () => {
    if (websiteContent) {
      navigator.clipboard.writeText(websiteContent)
        .then(() => {
          toast.success("Markdown copied to clipboard!");
        })
        .catch(err => {
          toast.error("Failed to copy: " + err);
        });
    }
  };

  // Toggle prompt visibility for a style
  const togglePrompt = (styleId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent button click
    setExpandedPromptId(expandedPromptId === styleId ? null : styleId);
  };

  // Function to download the generated image
  const handleDownloadImage = () => {
    if (!generatedImage) return;

    // Create a link element
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${url.replace(/^https?:\/\//, '').replace(/[^\w]/g, '-')}-image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Image downloaded successfully!');
  };

  return (
  <div className="px-4 sm:container py-6 sm:py-10 mx-auto font-sans" style={{ maxWidth: 720 }}>
          {/* Credits + plans moved to global header */}
          <UrlToImageProgressBar activeStep={currentStep} />

          <div className="bg-card p-6 sm:p-8 rounded-[10px] border ">
            {credits !== null && credits <= 0 && (
              <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-md flex items-center justify-between">
                <div>
                  <p className="font-semibold">You are out of credits</p>
                  <p className="text-sm">Buy a pack to scrape, generate prompts and images.</p>
                </div>
                <Button onClick={() => startCheckout('starter')} variant="outline" size="sm">Buy Starter</Button>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Button onClick={resetProcess} variant="link" className="text-red-700 underline p-0 h-auto">Try Again</Button>
                  <Button onClick={() => startCheckout('starter')} variant="outline" size="sm">Buy credits</Button>
                </div>
              </div>
            )}
            {currentStep === 1 && (
              <div>
                <h2 className={`${sectionHeadingClass} mb-2`}>Step 1: Enter URL</h2>
                <p className={`${sectionDescriptionClass} mb-6`}>
                  Provide the URL of the website you want to transform.
                </p>

                <div className="flex gap-2 mb-4">
                  <Input
                    type="url"
                    placeholder=""
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-grow [&::placeholder]:text-gray-300 dark:[&::placeholder]:text-gray-500"
                    disabled={isLoading}
                  />
                  <Button onClick={handleUrlSubmit} disabled={!url || isLoading} variant="orange">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && !isLoading && (
              <div>
                <h2 className={`${sectionHeadingClass} mb-2`}>
                  Step 2: Select Image Style
                </h2>
                <p className={`${sectionDescriptionClass} mb-6`}>
                  Choose a style for your generated image. Click the &quot;View Prompt&quot; button to see the style-specific prompt.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageStyleOptions.map((styleOption) => (
                    <div key={styleOption.id} className="space-y-2">
                      <button
                        onClick={() => handleStyleSelect(styleOption.id)}
                        className={`relative border rounded-[10px] overflow-hidden transition-colors duration-150 ease-in-out group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 aspect-square w-full
                                    ${selectedStyleId === styleOption.id ? "border-foreground/40" : "border-input hover:border-foreground/30"}`}
                      >
                        <Image
                          src={styleOption.src}
                          alt={styleOption.alt}
                          width={200}
                          height={150}
                          sizes="200px"
                          className="object-cover w-full h-full group-hover:opacity-80 transition-opacity"
                        />
                        {selectedStyleId === styleOption.id && (
                          <div className="absolute top-2 right-2 bg-primary rounded-full p-1 shadow-lg">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                          </div>
                        )}
                        <p className="text-center py-2 text-xs sm:text-sm font-medium bg-card/80 dark:bg-zinc-900/80 absolute bottom-0 w-full text-foreground dark:text-zinc-200 transition-colors duration-150">
                          {styleOption.name}
                        </p>
                      </button>

                      <div className="flex gap-2 w-full">
                        <Button
                          variant="orange"
                          size="sm"
                          className="text-xs w-1/2"
                          onClick={() => handleStyleSelect(styleOption.id)}
                        >
                          Run
                        </Button>
                        <Button
                          variant="code"
                          size="sm"
                          className="text-xs w-1/2"
                          onClick={(e) => togglePrompt(styleOption.id, e)}
                        >
                          {expandedPromptId === styleOption.id ? "Hide Prompt" : "View Prompt"}
                        </Button>
                      </div>

                      {expandedPromptId === styleOption.id && (
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-md border text-xs text-gray-700 dark:text-gray-300">
                          {styleOption.prompt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-start">
                  <Button
                    variant="code"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    Back to URL Input
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && isLoading && !isScrapingComplete && (
              <div className="text-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">{loadingMessage}</p>
              </div>
            )}

            {currentStep === 3 && isScrapingComplete && websiteContent && (
              <div>
                <h2 className={`${sectionHeadingClass} mb-2`}>
                  Step 3: Website Content
                </h2>
                <p className={`${sectionDescriptionClass} mb-4`}>
                  We extracted the following content from {url}
                </p>
                <div className="bg-white dark:bg-zinc-800 border rounded-md mb-6">
                  <div className="flex justify-between items-center p-3 border-b">
                    <h3 className="text-sm font-semibold">Markdown Content</h3>
                    <Button
                      variant="code"
                      size="sm"
                      onClick={copyMarkdownToClipboard}
                      className="flex items-center gap-1"
                    >
                      <ClipboardCopy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={websiteContent || ''}
                      onChange={(e) => setWebsiteContent(e.target.value)}
                      className="w-full h-60 p-3 text-xs border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring dark:bg-zinc-700 dark:border-zinc-600 dark:text-gray-300 resize-none"
                      placeholder="Scraped content will appear here and can be edited..."
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="code"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5"
                  >
                    <ArrowLeft size={16} />
                    Back to Styles
                  </Button>
                  <Button
                    onClick={handleGeneratePromptAndImage}
                    variant="orange"
                  >
                    Generate Prompt
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="h-auto">
                <h2 className={`${sectionHeadingClass} mb-2`}>
                  Step 4: Generate & Edit Prompt
                </h2>

                {/* Fixed height thinking steps with no auto-scroll */}
                {(isThinking || thinking.length > 0) && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-semibold">Thinking Steps:</h3>
                      {isThinking && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Thinking...
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-md h-[150px] overflow-y-auto">
                      {thinking.map((thought, index) => (
                        <div key={index} className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {thought}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side by side Content and Style Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Content prompt with fixed height */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-semibold">Content Prompt:</h3>
                      {isLoading && !thinking.length && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Generating...
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder="Content prompt will appear here..."
                      className="w-full"
                      style={{ height: '150px' }}
                      value={generatedPrompt || ""}
                      onChange={(e) => setGeneratedPrompt(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Style Prompt Section with fixed height */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Style Prompt:</h3>
                    <Textarea
                      placeholder="Style prompt will appear here..."
                      className="w-full text-sm"
                      style={{ height: '150px' }}
                      value={stylePrompt}
                      onChange={(e) => setStylePrompt(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Preview of combined prompt with fixed height */}
                <div className="mb-6 p-3 bg-gray-100 dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold mb-2">Final Image Prompt Preview:</h3>
                  <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap h-[100px] overflow-y-auto">
                    {generatedPrompt || "Content prompt will appear here..."}
                    {stylePrompt && "\n\nSTYLE PROMPT:\n"}
                    {stylePrompt || "Style prompt will appear here..."}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="code"
                    size="sm"
                    onClick={() => {
                      // Store the current prompt state in sessionStorage before navigating back
                      if (generatedPrompt) {
                        sessionStorage.setItem('savedPrompt', generatedPrompt);
                        sessionStorage.setItem('savedStylePrompt', stylePrompt);
                      }
                      setCurrentStep(3);
                    }}
                    className="flex items-center gap-1.5"
                    disabled={isLoading}
                  >
                    <ArrowLeft size={16} />
                    Back to Website Content
                  </Button>

                  <Button
                    onClick={handleGenerateImage}
                    variant="orange"
                    disabled={isLoading || !generatedPrompt}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : "Generate Image"}
                  </Button>
                </div>
              </div>
            )}

            {(currentStep === 5) && isLoading && (
              <div className="text-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">{loadingMessage}</p>
              </div>
            )}

            {currentStep === 6 && generatedImage && !isLoading && (
              <div>
                <h2 className={`${sectionHeadingClass} mb-2`}>
                  Step 6: View Your Image!
                </h2>
                <p className={`${sectionDescriptionClass} mb-6`}>
                  Here&apos;s the image generated from <span className="font-medium">{url}</span> in the style of {getSelectedStyleName() || "your chosen style"}.
                </p>
                <div className="relative group aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <Image
                    src={generatedImage}
                    alt={`Generated image for ${url} in ${getSelectedStyleName()} style`}
                    fill
                    className="object-contain animate-scale-in-content [animation-duration:var(--d-3)] [animation-delay:var(--t-2)]"
                    style={{ animationFillMode: 'forwards' }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="opacity-0 animate-fade-up [animation-duration:var(--d-3)] [animation-delay:var(--t-3)]" style={{ animationFillMode: 'forwards' }}>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Button
                      onClick={handleGenerateImage}
                      variant="code"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                      Regenerate
                    </Button>
                    <Button
                      onClick={handleDownloadImage}
                      variant="orange"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download Image
                    </Button>
                  </div>
                </div>

                {/* Prompt Display */}
                <div className="mt-8 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 opacity-0 animate-fade-up [animation-duration:var(--d-3)] [animation-delay:var(--t-3)]" style={{ animationFillMode: 'forwards' }}>
                  <h3 className="text-base font-semibold mb-2">Image Generated With This Prompt:</h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {generatedPrompt}
                    {stylePrompt && generatedPrompt && "\n\nSTYLE PROMPT:\n"}
                    {stylePrompt}
                  </div>
                </div>

                <div className="mt-8 flex justify-center items-center opacity-0 animate-fade-up [animation-duration:var(--d-3)] [animation-delay:var(--t-4)]" style={{ animationFillMode: 'forwards' }}>
                  <Button onClick={resetProcess} variant="orange" className="text-sm">
                    Start Over
                  </Button>
                </div>
              </div>
            )}
          </div>
    </div>
  );
}
