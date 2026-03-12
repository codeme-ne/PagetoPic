// Use case data for different professional roles
// This data structure is designed to be extensible and type-safe

export interface UseCase {
  role: string;
  slug: string;
  title: string;
  description: string;
  heroImage?: string;
  sampleUrls?: string[];
  problem: {
    title: string;
    points: string[];
  };
  solution: {
    title: string;
    description: string;
    features: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  impact: {
    title: string;
    metrics: Array<{
      value: string;
      label: string;
      description?: string;
    }>;
  };
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company?: string;
    avatar?: string;
  };
  cta: {
    primary: {
      text: string;
      href: string;
    };
    secondary?: {
      text: string;
      href: string;
    };
  };
}

export const useCases: UseCase[] = [
  {
    role: "Marketing Manager",
    slug: "marketing-manager",
    title: "Transform Websites into Visual Content at Scale",
    description: "Create stunning visual content from any website in seconds, perfect for social media campaigns and marketing materials.",
    problem: {
      title: "The Content Creation Challenge",
      points: [
        "Hours spent creating visual content for campaigns",
        "Inconsistent brand visuals across channels",
        "High costs for design resources",
        "Slow turnaround times for visual assets"
      ]
    },
    solution: {
      title: "AI-Powered Visual Content Generation",
      description: "Transform any website or landing page into beautiful, on-brand images instantly.",
      features: [
        {
          title: "Instant Visualization",
          description: "Convert website content to images in under 30 seconds"
        },
        {
          title: "6 Unique Styles",
          description: "Choose from GHIBLI, LEGO, LOGO, and more professional styles"
        },
        {
          title: "Brand Consistency",
          description: "Maintain visual consistency across all marketing channels"
        },
        {
          title: "Bulk Generation",
          description: "Create multiple variations for A/B testing"
        }
      ]
    },
    sampleUrls: [
      "https://www.producthunt.com",
      "https://www.stripe.com", 
      "https://www.notion.so"
    ],
    impact: {
      title: "Measurable Results",
      metrics: [
        {
          value: "90%",
          label: "Time Saved",
          description: "On visual content creation"
        },
        {
          value: "3x",
          label: "More Content",
          description: "Produced per campaign"
        },
        {
          value: "60%",
          label: "Cost Reduction",
          description: "In design resources"
        }
      ]
    },
    testimonial: {
      quote: "PagetoPic has revolutionized our content creation workflow. What used to take hours now takes minutes.",
      author: "Sarah Chen",
      role: "Head of Digital Marketing",
      company: "TechStart GmbH",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
    },
    cta: {
      primary: {
        text: "Start Creating",
        href: "/auth/signin"
      },
      secondary: {
        text: "View Gallery",
        href: "/gallery"
      }
    }
  },
  {
    role: "Content Creator",
    slug: "content-creator",
    title: "Turn Ideas into Stunning Visuals Instantly",
    description: "Transform your creative concepts and web content into unique, shareable images that captivate your audience.",
    problem: {
      title: "Creative Bottlenecks",
      points: [
        "Limited design skills holding back creativity",
        "Expensive design tools and subscriptions",
        "Time-consuming manual image creation",
        "Difficulty maintaining consistent style"
      ]
    },
    solution: {
      title: "Effortless Creative Expression",
      description: "Focus on your ideas while AI handles the visual execution perfectly.",
      features: [
        {
          title: "No Design Skills Needed",
          description: "Professional results without any design experience"
        },
        {
          title: "Unique Art Styles",
          description: "Stand out with GHIBLI, CLAYMATION, and WHIMSICAL styles"
        },
        {
          title: "Rapid Iteration",
          description: "Generate multiple versions to find the perfect one"
        },
        {
          title: "High-Resolution Output",
          description: "Download images ready for any platform"
        }
      ]
    },
    sampleUrls: [
      "https://www.producthunt.com",
      "https://www.stripe.com", 
      "https://www.notion.so"
    ],
    impact: {
      title: "Creator Success Metrics",
      metrics: [
        {
          value: "5x",
          label: "Faster Creation",
          description: "Than traditional methods"
        },
        {
          value: "100+",
          label: "Unique Visuals",
          description: "Created per month"
        },
        {
          value: "2x",
          label: "Engagement Rate",
          description: "With AI-generated visuals"
        }
      ]
    },
    testimonial: {
      quote: "As a blogger, PagetoPic gives me the visual superpowers I never had. My posts have never looked better!",
      author: "Marcus Weber",
      role: "Tech Blogger",
      company: "DigitalTrends.de",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    },
    cta: {
      primary: {
        text: "Try It Free",
        href: "/auth/signin"
      },
      secondary: {
        text: "See Examples",
        href: "/gallery"
      }
    }
  },
  {
    role: "E-Commerce Manager",
    slug: "ecommerce-manager",
    title: "Transform Product Pages into Marketing Assets",
    description: "Convert your product pages and shop content into compelling visual stories that drive conversions.",
    problem: {
      title: "E-Commerce Visual Challenges",
      points: [
        "Product images alone don't tell the full story",
        "Difficulty creating lifestyle and context images",
        "High photography and design costs",
        "Slow product launch campaigns"
      ]
    },
    solution: {
      title: "Product Storytelling Through AI",
      description: "Transform product pages into emotional, engaging visual narratives.",
      features: [
        {
          title: "Product Page Enhancement",
          description: "Create lifestyle images from product descriptions"
        },
        {
          title: "Campaign-Ready Visuals",
          description: "Generate social media and ad creatives instantly"
        },
        {
          title: "Seasonal Variations",
          description: "Adapt product visuals for different campaigns"
        },
        {
          title: "A/B Test Assets",
          description: "Create multiple visual variations for testing"
        }
      ]
    },
    sampleUrls: [
      "https://www.producthunt.com",
      "https://www.stripe.com", 
      "https://www.notion.so"
    ],
    impact: {
      title: "E-Commerce Performance",
      metrics: [
        {
          value: "35%",
          label: "Higher CTR",
          description: "On visual ads"
        },
        {
          value: "50%",
          label: "Faster Launch",
          description: "For new products"
        },
        {
          value: "40%",
          label: "Cost Savings",
          description: "On visual content"
        }
      ]
    },
    testimonial: {
      quote: "We've transformed our entire product visualization strategy with PagetoPic. ROI was visible within weeks.",
      author: "Lisa Müller",
      role: "E-Commerce Director",
      company: "Fashion Forward AG",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces"
    },
    cta: {
      primary: {
        text: "Start Selling More",
        href: "/auth/signin"
      },
      secondary: {
        text: "View Pricing",
        href: "/pricing"
      }
    }
  },
  {
    role: "Social Media Manager",
    slug: "social-media-manager",
    title: "Create Scroll-Stopping Social Content",
    description: "Transform web content into unique, platform-optimized visuals that boost engagement and grow your following.",
    problem: {
      title: "Social Media Content Demands",
      points: [
        "Constant need for fresh, engaging visuals",
        "Platform-specific content requirements",
        "Limited time and design resources",
        "Difficulty standing out in crowded feeds"
      ]
    },
    solution: {
      title: "Social-First Visual Creation",
      description: "Generate platform-perfect visuals that capture attention and drive engagement.",
      features: [
        {
          title: "Platform Optimization",
          description: "Create visuals tailored for each social platform"
        },
        {
          title: "Trend-Ready Styles",
          description: "Access styles that resonate with current trends"
        },
        {
          title: "Batch Creation",
          description: "Generate week's worth of content in minutes"
        },
        {
          title: "Story & Post Ready",
          description: "Perfect for feeds, stories, and reels"
        }
      ]
    },
    sampleUrls: [
      "https://www.producthunt.com",
      "https://www.stripe.com", 
      "https://www.notion.so"
    ],
    impact: {
      title: "Social Media Success",
      metrics: [
        {
          value: "150%",
          label: "More Engagement",
          description: "Average increase"
        },
        {
          value: "10x",
          label: "Content Output",
          description: "Posts per week"
        },
        {
          value: "70%",
          label: "Time Saved",
          description: "On content creation"
        }
      ]
    },
    testimonial: {
      quote: "PagetoPic is my secret weapon for social media. Our engagement rates have never been higher!",
      author: "Tom Schmidt",
      role: "Social Media Lead",
      company: "StartupHub Berlin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces"
    },
    cta: {
      primary: {
        text: "Boost Your Social",
        href: "/auth/signin"
      },
      secondary: {
        text: "Explore Styles",
        href: "/gallery"
      }
    }
  }
];

// Helper function to get use case by slug
export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return useCases.find(uc => uc.slug === slug);
}

// Helper function to get all slugs for static generation
export function getAllUseCaseSlugs(): string[] {
  return useCases.map(uc => uc.slug);
}