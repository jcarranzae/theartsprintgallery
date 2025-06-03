// config/platforms.ts
import { Platform } from "@/types/agents";
import { PlatformConfig } from "@/types/agents";
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
    instagram: {
      aspect_ratio: "1:1 or 4:5",
      style_trends: ["vibrant", "high_contrast", "mobile_friendly", "clean_composition"],
      engagement_factors: ["faces", "bright_colors", "clear_subjects", "lifestyle"],
      optimal_colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"],
      technical_specs: ["sharp_focus", "good_lighting", "rule_of_thirds"]
    },
    youtube_thumbnail: {
      aspect_ratio: "16:9",
      style_trends: ["bold", "readable_text_space", "eye_catching", "dramatic"],
      engagement_factors: ["expressions", "contrasting_colors", "clear_focal_point", "action"],
      optimal_colors: ["#FF0000", "#00FF00", "#FFFF00", "#FF00FF"],
      technical_specs: ["high_contrast", "bold_compositions", "readable_at_small_size"]
    },
    tiktok: {
      aspect_ratio: "9:16",
      style_trends: ["dynamic", "youthful", "trendy", "authentic"],
      engagement_factors: ["movement_suggestion", "relatable", "current_aesthetics", "gen_z_appeal"],
      optimal_colors: ["#FE2C55", "#25F4EE", "#FFFFFF", "#000000"],
      technical_specs: ["vertical_composition", "mobile_optimized", "attention_grabbing"]
    },
    twitter: {
      aspect_ratio: "16:9 or 1:1",
      style_trends: ["professional", "clean", "informative", "accessible"],
      engagement_factors: ["clarity", "professionalism", "brand_consistency"],
      optimal_colors: ["#1DA1F2", "#14171A", "#657786", "#AAB8C2"],
      technical_specs: ["web_optimized", "fast_loading", "accessible_contrast"]
    },
    linkedin: {
      aspect_ratio: "1.91:1 or 1:1",
      style_trends: ["professional", "corporate", "clean", "trustworthy"],
      engagement_factors: ["professionalism", "business_relevance", "quality", "credibility"],
      optimal_colors: ["#0077B5", "#00A0DC", "#8B9DC3", "#DDD6C7"],
      technical_specs: ["professional_quality", "business_appropriate", "high_resolution"]
    }
  };
  
