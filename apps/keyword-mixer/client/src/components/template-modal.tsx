import { useState } from "react";
import { ShoppingCart, MapPin, Cloud, Link2, Search, Building, Heart, Car, Home, Utensils, Briefcase, GraduationCap, Camera, Music, Gamepad2, Shirt, Dumbbell, Baby, Plane, Book, Stethoscope, TreePine, Smartphone, Laptop, Coffee, Gift, DollarSign, Users, TrendingUp, Shield, Zap, Target, Globe, Mail, MessageSquare, PenTool, Palette, Wrench, Hammer, Scissors, Watch, Glasses, Package, Truck, Star, Award, Crown, Gem, Key, Lock, Eye, Calendar, Clock, MapPin as Pin, Scale, Sun } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type KeywordGroup } from "@shared/schema";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (groups: KeywordGroup[]) => void;
}

const TEMPLATES = {
  // E-commerce Templates
  ecommerce: {
    icon: ShoppingCart,
    title: "E-Commerce General",
    description: "Product, color, and category combinations for online stores",
    color: "text-blue-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Products", keywords: ["running shoes", "hiking boots", "casual sneakers", "dress shoes", "sandals"] },
      { id: "2", name: "Colors", keywords: ["black", "white", "brown", "blue", "red", "gray"] },
      { id: "3", name: "Occasions", keywords: ["for work", "for sports", "for casual", "for formal", "for outdoor"] }
    ]
  },
  fashion: {
    icon: Shirt,
    title: "Fashion & Apparel",
    description: "Clothing, accessories, and style combinations",
    color: "text-pink-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Clothing", keywords: ["dress", "jeans", "t-shirt", "jacket", "sweater", "blouse", "skirt", "pants"] },
      { id: "2", name: "Styles", keywords: ["casual", "formal", "vintage", "modern", "bohemian", "minimalist", "trendy"] },
      { id: "3", name: "Occasions", keywords: ["for work", "for party", "for wedding", "for vacation", "for date night"] }
    ]
  },
  electronics: {
    icon: Smartphone,
    title: "Electronics Store",
    description: "Tech products, brands, and specifications",
    color: "text-indigo-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Products", keywords: ["smartphone", "laptop", "tablet", "headphones", "smartwatch", "camera", "gaming console"] },
      { id: "2", name: "Brands", keywords: ["Apple", "Samsung", "Sony", "Dell", "HP", "Nintendo", "Microsoft"] },
      { id: "3", name: "Features", keywords: ["wireless", "waterproof", "fast charging", "high resolution", "gaming", "professional"] }
    ]
  },
  jewelry: {
    icon: Gem,
    title: "Jewelry Store",
    description: "Jewelry types, materials, and occasions",
    color: "text-yellow-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Jewelry", keywords: ["necklace", "bracelet", "earrings", "ring", "watch", "pendant", "anklet"] },
      { id: "2", name: "Materials", keywords: ["gold", "silver", "platinum", "diamond", "pearl", "gemstone", "stainless steel"] },
      { id: "3", name: "Occasions", keywords: ["wedding", "engagement", "anniversary", "birthday", "graduation", "Christmas"] }
    ]
  },
  home: {
    icon: Home,
    title: "Home & Garden",
    description: "Home decor, furniture, and garden products",
    color: "text-green-600",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Products", keywords: ["sofa", "dining table", "bed frame", "lamp", "rug", "curtains", "plant pot"] },
      { id: "2", name: "Materials", keywords: ["wood", "metal", "fabric", "leather", "glass", "ceramic", "plastic"] },
      { id: "3", name: "Rooms", keywords: ["living room", "bedroom", "kitchen", "bathroom", "office", "garden", "patio"] }
    ]
  },
  beauty: {
    icon: Heart,
    title: "Beauty & Cosmetics",
    description: "Beauty products, brands, and skin types",
    color: "text-rose-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Products", keywords: ["foundation", "lipstick", "eyeshadow", "moisturizer", "serum", "cleanser", "mascara"] },
      { id: "2", name: "Skin Types", keywords: ["oily skin", "dry skin", "sensitive skin", "combination skin", "acne prone", "mature skin"] },
      { id: "3", name: "Benefits", keywords: ["anti aging", "hydrating", "long lasting", "waterproof", "organic", "cruelty free"] }
    ]
  },
  automotive: {
    icon: Car,
    title: "Automotive Parts",
    description: "Car parts, brands, and vehicle types",
    color: "text-red-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Parts", keywords: ["brake pads", "oil filter", "spark plugs", "tires", "battery", "headlights", "bumper"] },
      { id: "2", name: "Vehicle Types", keywords: ["sedan", "SUV", "truck", "hatchback", "convertible", "motorcycle", "van"] },
      { id: "3", name: "Brands", keywords: ["Toyota", "Ford", "BMW", "Honda", "Chevrolet", "Mercedes", "Nissan"] }
    ]
  },
  sports: {
    icon: Dumbbell,
    title: "Sports & Fitness",
    description: "Sports equipment, activities, and fitness gear",
    color: "text-orange-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Equipment", keywords: ["dumbbells", "yoga mat", "treadmill", "basketball", "tennis racket", "golf clubs"] },
      { id: "2", name: "Activities", keywords: ["running", "yoga", "weightlifting", "cycling", "swimming", "tennis", "golf"] },
      { id: "3", name: "Levels", keywords: ["beginner", "intermediate", "advanced", "professional", "kids", "adults"] }
    ]
  },
  books: {
    icon: Book,
    title: "Books & Literature",
    description: "Book genres, formats, and target audiences",
    color: "text-amber-600",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Genres", keywords: ["fiction", "non-fiction", "mystery", "romance", "biography", "self-help", "cookbook"] },
      { id: "2", name: "Formats", keywords: ["hardcover", "paperback", "ebook", "audiobook", "kindle", "large print"] },
      { id: "3", name: "Audiences", keywords: ["adults", "young adults", "children", "teens", "students", "professionals"] }
    ]
  },
  toys: {
    icon: Baby,
    title: "Toys & Games",
    description: "Toys, games, and age-appropriate products",
    color: "text-cyan-500",
    category: "E-commerce",
    groups: [
      { id: "1", name: "Toys", keywords: ["action figures", "dolls", "board games", "puzzles", "building blocks", "remote control"] },
      { id: "2", name: "Age Groups", keywords: ["0-2 years", "3-5 years", "6-8 years", "9-12 years", "teens", "adults"] },
      { id: "3", name: "Categories", keywords: ["educational", "creative", "outdoor", "electronic", "classic", "STEM"] }
    ]
  },

  // Local SEO Templates
  "local-seo": {
    icon: MapPin,
    title: "Local SEO General",
    description: "Service, location, and modifier combinations for local businesses",
    color: "text-green-500",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["plumber", "electrician", "dentist", "lawyer", "contractor"] },
      { id: "2", name: "Locations", keywords: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"] },
      { id: "3", name: "Modifiers", keywords: ["near me", "best", "affordable", "emergency", "24 hour"] }
    ]
  },
  restaurant: {
    icon: Utensils,
    title: "Restaurant & Food",
    description: "Food types, cuisines, and dining modifiers",
    color: "text-red-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Cuisines", keywords: ["Italian", "Chinese", "Mexican", "Indian", "Thai", "American", "Japanese"] },
      { id: "2", name: "Food Types", keywords: ["pizza", "sushi", "burger", "pasta", "tacos", "seafood", "steak"] },
      { id: "3", name: "Modifiers", keywords: ["delivery", "takeout", "dine in", "best", "cheap", "authentic", "near me"] }
    ]
  },
  healthcare: {
    icon: Stethoscope,
    title: "Healthcare Services",
    description: "Medical services, specialties, and patient needs",
    color: "text-blue-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["dentist", "doctor", "chiropractor", "physical therapy", "urgent care", "pediatrician"] },
      { id: "2", name: "Specialties", keywords: ["family medicine", "orthopedic", "cardiology", "dermatology", "mental health", "women's health"] },
      { id: "3", name: "Modifiers", keywords: ["near me", "accepting new patients", "walk in", "emergency", "insurance accepted"] }
    ]
  },
  legal: {
    icon: Scale,
    title: "Legal Services",
    description: "Legal specialties, case types, and client needs",
    color: "text-gray-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Practice Areas", keywords: ["personal injury", "divorce", "criminal defense", "DUI", "bankruptcy", "estate planning"] },
      { id: "2", name: "Client Types", keywords: ["individuals", "businesses", "families", "immigrants", "seniors", "veterans"] },
      { id: "3", name: "Modifiers", keywords: ["lawyer", "attorney", "free consultation", "experienced", "affordable", "near me"] }
    ]
  },
  realestate: {
    icon: Building,
    title: "Real Estate",
    description: "Property types, locations, and buyer/seller needs",
    color: "text-purple-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Property Types", keywords: ["house", "condo", "apartment", "townhouse", "commercial", "land", "rental"] },
      { id: "2", name: "Actions", keywords: ["for sale", "for rent", "buy", "sell", "lease", "invest", "mortgage"] },
      { id: "3", name: "Features", keywords: ["3 bedroom", "2 bathroom", "pool", "garage", "garden", "new construction", "waterfront"] }
    ]
  },
  fitness: {
    icon: Dumbbell,
    title: "Fitness Centers",
    description: "Fitness services, equipment, and training types",
    color: "text-orange-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["gym", "personal training", "yoga studio", "pilates", "crossfit", "martial arts"] },
      { id: "2", name: "Programs", keywords: ["weight loss", "muscle building", "cardio", "strength training", "flexibility", "rehabilitation"] },
      { id: "3", name: "Modifiers", keywords: ["near me", "24 hour", "women only", "beginner friendly", "affordable", "membership"] }
    ]
  },
  automotive_services: {
    icon: Wrench,
    title: "Auto Services",
    description: "Car repair, maintenance, and automotive services",
    color: "text-blue-700",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["oil change", "brake repair", "tire service", "auto repair", "car wash", "inspection"] },
      { id: "2", name: "Vehicle Types", keywords: ["car", "truck", "SUV", "motorcycle", "diesel", "hybrid", "electric"] },
      { id: "3", name: "Modifiers", keywords: ["near me", "cheap", "fast", "certified", "warranty", "mobile service"] }
    ]
  },
  beauty_services: {
    icon: Scissors,
    title: "Beauty Services",
    description: "Salon, spa, and beauty treatment services",
    color: "text-pink-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["haircut", "hair color", "manicure", "pedicure", "facial", "massage", "waxing"] },
      { id: "2", name: "Venues", keywords: ["salon", "spa", "barbershop", "nail salon", "beauty parlor", "day spa"] },
      { id: "3", name: "Modifiers", keywords: ["near me", "walk in", "appointment", "best", "affordable", "luxury"] }
    ]
  },
  education: {
    icon: GraduationCap,
    title: "Education Services",
    description: "Schools, tutoring, and educational programs",
    color: "text-indigo-600",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["tutoring", "preschool", "daycare", "driving school", "music lessons", "dance classes"] },
      { id: "2", name: "Subjects", keywords: ["math", "english", "science", "SAT prep", "language", "computer", "art"] },
      { id: "3", name: "Ages", keywords: ["kids", "teens", "adults", "seniors", "toddlers", "elementary", "high school"] }
    ]
  },
  pet_services: {
    icon: Heart,
    title: "Pet Services",
    description: "Veterinary, grooming, and pet care services",
    color: "text-green-700",
    category: "Local SEO",
    groups: [
      { id: "1", name: "Services", keywords: ["veterinarian", "pet grooming", "dog training", "pet sitting", "animal hospital", "pet boarding"] },
      { id: "2", name: "Animals", keywords: ["dogs", "cats", "birds", "fish", "rabbits", "reptiles", "exotic pets"] },
      { id: "3", name: "Modifiers", keywords: ["near me", "emergency", "affordable", "experienced", "certified", "24 hour"] }
    ]
  },

  // SaaS & Technology Templates
  saas: {
    icon: Cloud,
    title: "SaaS General",
    description: "Software solutions for various business needs",
    color: "text-purple-500",
    category: "Technology",
    groups: [
      { id: "1", name: "Software Types", keywords: ["CRM software", "project management", "accounting software", "email marketing", "analytics tools"] },
      { id: "2", name: "Industries", keywords: ["for small business", "for enterprises", "for startups", "for agencies", "for nonprofits"] },
      { id: "3", name: "Features", keywords: ["with automation", "with reporting", "with integrations", "cloud based", "mobile friendly"] }
    ]
  },
  crm: {
    icon: Users,
    title: "CRM Software",
    description: "Customer relationship management solutions",
    color: "text-blue-600",
    category: "Technology",
    groups: [
      { id: "1", name: "CRM Types", keywords: ["sales CRM", "marketing CRM", "customer service CRM", "real estate CRM", "nonprofit CRM"] },
      { id: "2", name: "Features", keywords: ["lead management", "contact management", "sales pipeline", "email automation", "reporting"] },
      { id: "3", name: "Business Size", keywords: ["small business", "enterprise", "startup", "growing company", "large corporation"] }
    ]
  },
  project_management: {
    icon: Briefcase,
    title: "Project Management",
    description: "Project planning and collaboration tools",
    color: "text-green-600",
    category: "Technology",
    groups: [
      { id: "1", name: "Tools", keywords: ["task management", "team collaboration", "time tracking", "resource planning", "gantt charts"] },
      { id: "2", name: "Industries", keywords: ["construction", "marketing", "software development", "consulting", "design"] },
      { id: "3", name: "Team Size", keywords: ["small teams", "large teams", "remote teams", "distributed teams", "agile teams"] }
    ]
  },
  ecommerce_platform: {
    icon: ShoppingCart,
    title: "E-commerce Platforms",
    description: "Online store and selling solutions",
    color: "text-orange-600",
    category: "Technology",
    groups: [
      { id: "1", name: "Platform Types", keywords: ["online store builder", "marketplace platform", "dropshipping software", "inventory management"] },
      { id: "2", name: "Business Types", keywords: ["retail", "wholesale", "digital products", "subscription", "B2B", "B2C"] },
      { id: "3", name: "Features", keywords: ["payment processing", "shipping integration", "SEO tools", "mobile responsive", "analytics"] }
    ]
  },
  marketing_automation: {
    icon: TrendingUp,
    title: "Marketing Automation",
    description: "Marketing and lead generation tools",
    color: "text-red-600",
    category: "Technology",
    groups: [
      { id: "1", name: "Tools", keywords: ["email marketing", "social media management", "lead generation", "landing pages", "A/B testing"] },
      { id: "2", name: "Channels", keywords: ["email campaigns", "social media", "content marketing", "PPC advertising", "SEO tools"] },
      { id: "3", name: "Business Goals", keywords: ["lead generation", "customer retention", "brand awareness", "sales conversion", "ROI tracking"] }
    ]
  },
  cybersecurity: {
    icon: Shield,
    title: "Cybersecurity",
    description: "Security software and protection services",
    color: "text-gray-700",
    category: "Technology",
    groups: [
      { id: "1", name: "Solutions", keywords: ["antivirus software", "firewall", "VPN", "endpoint protection", "data encryption"] },
      { id: "2", name: "Business Types", keywords: ["small business", "enterprise", "healthcare", "finance", "government"] },
      { id: "3", name: "Threats", keywords: ["malware protection", "ransomware", "phishing", "data breach", "cyber attacks"] }
    ]
  },
  design_tools: {
    icon: Palette,
    title: "Design Software",
    description: "Creative and design tool solutions",
    color: "text-purple-700",
    category: "Technology",
    groups: [
      { id: "1", name: "Design Types", keywords: ["graphic design", "web design", "logo design", "video editing", "photo editing"] },
      { id: "2", name: "User Types", keywords: ["professionals", "beginners", "students", "agencies", "freelancers"] },
      { id: "3", name: "Features", keywords: ["templates", "collaboration", "cloud storage", "vector graphics", "animation"] }
    ]
  },
  accounting_software: {
    icon: DollarSign,
    title: "Accounting Software",
    description: "Financial management and bookkeeping tools",
    color: "text-green-700",
    category: "Technology",
    groups: [
      { id: "1", name: "Features", keywords: ["invoicing", "expense tracking", "payroll", "tax preparation", "financial reporting"] },
      { id: "2", name: "Business Types", keywords: ["freelancers", "small business", "contractors", "retailers", "service providers"] },
      { id: "3", name: "Integrations", keywords: ["bank integration", "payment processing", "CRM integration", "e-commerce", "time tracking"] }
    ]
  },
  communication: {
    icon: MessageSquare,
    title: "Communication Tools",
    description: "Team communication and collaboration platforms",
    color: "text-blue-700",
    category: "Technology",
    groups: [
      { id: "1", name: "Tools", keywords: ["team chat", "video conferencing", "file sharing", "project communication", "internal messaging"] },
      { id: "2", name: "Team Types", keywords: ["remote teams", "hybrid teams", "large organizations", "small teams", "distributed teams"] },
      { id: "3", name: "Features", keywords: ["screen sharing", "file collaboration", "integration", "mobile app", "security"] }
    ]
  },
  hr_software: {
    icon: Users,
    title: "HR Software",
    description: "Human resources management solutions",
    color: "text-indigo-700",
    category: "Technology",
    groups: [
      { id: "1", name: "HR Functions", keywords: ["employee management", "payroll", "recruitment", "performance management", "time tracking"] },
      { id: "2", name: "Company Size", keywords: ["small business", "medium business", "enterprise", "startup", "growing company"] },
      { id: "3", name: "Features", keywords: ["self service", "mobile access", "reporting", "compliance", "integration"] }
    ]
  },

  // Affiliate Marketing Templates
  affiliate: {
    icon: Link2,
    title: "Affiliate Marketing General",
    description: "Product reviews and comparison keywords",
    color: "text-orange-500",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["laptop", "smartphone", "headphones", "camera", "tablet"] },
      { id: "2", name: "Intent", keywords: ["review", "comparison", "vs", "best", "top rated"] },
      { id: "3", name: "Year/Timing", keywords: ["2025", "latest", "new", "updated", "current"] }
    ]
  },
  tech_reviews: {
    icon: Laptop,
    title: "Tech Product Reviews",
    description: "Technology product review and comparison content",
    color: "text-blue-500",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["iPhone", "MacBook", "iPad", "Apple Watch", "AirPods", "gaming laptop", "4K monitor"] },
      { id: "2", name: "Review Types", keywords: ["review", "unboxing", "hands on", "first impressions", "long term", "comparison"] },
      { id: "3", name: "Modifiers", keywords: ["best", "worst", "vs", "alternative", "cheaper", "premium", "budget"] }
    ]
  },
  fitness_products: {
    icon: Dumbbell,
    title: "Fitness Product Reviews",
    description: "Exercise equipment and supplement reviews",
    color: "text-orange-600",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["protein powder", "pre workout", "dumbbells", "treadmill", "yoga mat", "resistance bands"] },
      { id: "2", name: "Benefits", keywords: ["weight loss", "muscle gain", "strength", "endurance", "flexibility", "recovery"] },
      { id: "3", name: "Content Types", keywords: ["review", "guide", "comparison", "benefits", "side effects", "results"] }
    ]
  },
  home_appliances: {
    icon: Home,
    title: "Home Appliance Reviews",
    description: "Kitchen and home appliance product reviews",
    color: "text-green-600",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Appliances", keywords: ["air fryer", "coffee maker", "blender", "vacuum cleaner", "dishwasher", "washing machine"] },
      { id: "2", name: "Features", keywords: ["best rated", "energy efficient", "quiet", "compact", "large capacity", "smart"] },
      { id: "3", name: "Content", keywords: ["review", "buying guide", "comparison", "pros and cons", "worth it", "alternatives"] }
    ]
  },
  beauty_reviews: {
    icon: Heart,
    title: "Beauty Product Reviews",
    description: "Skincare and makeup product review content",
    color: "text-pink-600",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["moisturizer", "serum", "foundation", "lipstick", "sunscreen", "cleanser", "eye cream"] },
      { id: "2", name: "Skin Concerns", keywords: ["acne", "wrinkles", "dry skin", "oily skin", "sensitive skin", "dark spots"] },
      { id: "3", name: "Content Types", keywords: ["review", "before after", "routine", "comparison", "drugstore vs high end", "dupe"] }
    ]
  },
  travel_gear: {
    icon: Plane,
    title: "Travel Product Reviews",
    description: "Travel gear and accessory review content",
    color: "text-cyan-600",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["travel backpack", "luggage", "travel pillow", "portable charger", "travel adapter", "camera bag"] },
      { id: "2", name: "Travel Types", keywords: ["business travel", "backpacking", "family travel", "luxury travel", "adventure travel", "budget travel"] },
      { id: "3", name: "Features", keywords: ["lightweight", "durable", "compact", "waterproof", "TSA approved", "versatile"] }
    ]
  },
  gaming_reviews: {
    icon: Gamepad2,
    title: "Gaming Product Reviews",
    description: "Gaming hardware and software review content",
    color: "text-purple-600",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["gaming mouse", "mechanical keyboard", "gaming headset", "graphics card", "gaming chair", "monitor"] },
      { id: "2", name: "Games", keywords: ["FPS games", "RPG games", "strategy games", "indie games", "AAA games", "multiplayer"] },
      { id: "3", name: "Performance", keywords: ["high FPS", "low latency", "4K gaming", "ray tracing", "competitive", "casual"] }
    ]
  },
  baby_products: {
    icon: Baby,
    title: "Baby Product Reviews",
    description: "Baby gear and parenting product reviews",
    color: "text-yellow-600",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Products", keywords: ["stroller", "car seat", "baby monitor", "high chair", "crib", "baby carrier", "diaper bag"] },
      { id: "2", name: "Age Groups", keywords: ["newborn", "infant", "toddler", "6 months", "12 months", "2 years", "3 years"] },
      { id: "3", name: "Features", keywords: ["safety", "comfort", "easy to clean", "portable", "adjustable", "affordable", "premium"] }
    ]
  },
  outdoor_gear: {
    icon: TreePine,
    title: "Outdoor Gear Reviews",
    description: "Camping and outdoor equipment reviews",
    color: "text-green-700",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Gear", keywords: ["tent", "sleeping bag", "backpack", "hiking boots", "camping stove", "water filter"] },
      { id: "2", name: "Activities", keywords: ["camping", "hiking", "backpacking", "climbing", "fishing", "hunting", "survival"] },
      { id: "3", name: "Conditions", keywords: ["all weather", "lightweight", "waterproof", "4 season", "ultralight", "budget", "professional"] }
    ]
  },
  kitchen_gadgets: {
    icon: Utensils,
    title: "Kitchen Gadget Reviews",
    description: "Cooking tools and kitchen appliance reviews",
    color: "text-red-700",
    category: "Affiliate Marketing",
    groups: [
      { id: "1", name: "Gadgets", keywords: ["instant pot", "air fryer", "stand mixer", "food processor", "knife set", "cutting board"] },
      { id: "2", name: "Cooking Styles", keywords: ["healthy cooking", "meal prep", "baking", "grilling", "one pot meals", "quick meals"] },
      { id: "3", name: "Features", keywords: ["easy to clean", "space saving", "versatile", "durable", "beginner friendly", "professional grade"] }
    ]
  },

  // Content Marketing Templates
  content_marketing: {
    icon: PenTool,
    title: "Content Marketing",
    description: "Blog topics, content types, and audience targeting",
    color: "text-indigo-600",
    category: "Content Marketing",
    groups: [
      { id: "1", name: "Content Types", keywords: ["how to guide", "tutorial", "tips", "best practices", "case study", "comparison"] },
      { id: "2", name: "Industries", keywords: ["marketing", "business", "technology", "health", "finance", "education"] },
      { id: "3", name: "Audiences", keywords: ["beginners", "professionals", "entrepreneurs", "students", "experts", "decision makers"] }
    ]
  },
  blogging: {
    icon: PenTool,
    title: "Blog Content Ideas",
    description: "Blog post topics and content strategies",
    color: "text-blue-600",
    category: "Content Marketing",
    groups: [
      { id: "1", name: "Post Types", keywords: ["ultimate guide", "checklist", "template", "tools", "resources", "mistakes to avoid"] },
      { id: "2", name: "Topics", keywords: ["productivity", "leadership", "innovation", "trends", "success stories", "lessons learned"] },
      { id: "3", name: "Formats", keywords: ["step by step", "list post", "interview", "infographic", "video", "podcast"] }
    ]
  },
  social_media: {
    icon: Users,
    title: "Social Media Content",
    description: "Social media post ideas and engagement strategies",
    color: "text-pink-600",
    category: "Content Marketing",
    groups: [
      { id: "1", name: "Platforms", keywords: ["Instagram", "Facebook", "Twitter", "LinkedIn", "TikTok", "YouTube", "Pinterest"] },
      { id: "2", name: "Content Types", keywords: ["behind the scenes", "user generated", "educational", "entertaining", "promotional", "inspirational"] },
      { id: "3", name: "Engagement", keywords: ["questions", "polls", "contests", "challenges", "testimonials", "stories"] }
    ]
  },
  video_content: {
    icon: Camera,
    title: "Video Content Ideas",
    description: "YouTube and video marketing content strategies",
    color: "text-red-600",
    category: "Content Marketing",
    groups: [
      { id: "1", name: "Video Types", keywords: ["tutorial", "review", "unboxing", "behind the scenes", "interview", "explainer"] },
      { id: "2", name: "Formats", keywords: ["short form", "long form", "live stream", "series", "webinar", "documentary"] },
      { id: "3", name: "Goals", keywords: ["education", "entertainment", "promotion", "community building", "thought leadership", "sales"] }
    ]
  },
  email_marketing: {
    icon: Mail,
    title: "Email Marketing",
    description: "Email campaign types and subject line ideas",
    color: "text-green-600",
    category: "Content Marketing",
    groups: [
      { id: "1", name: "Campaign Types", keywords: ["newsletter", "welcome series", "abandoned cart", "re-engagement", "product launch", "seasonal"] },
      { id: "2", name: "Industries", keywords: ["e-commerce", "SaaS", "real estate", "healthcare", "education", "nonprofit"] },
      { id: "3", name: "Goals", keywords: ["conversion", "retention", "engagement", "awareness", "referral", "feedback"] }
    ]
  },

  // Lead Generation Templates
  lead_generation: {
    icon: Target,
    title: "Lead Generation",
    description: "Lead magnets and conversion-focused content",
    color: "text-purple-600",
    category: "Lead Generation",
    groups: [
      { id: "1", name: "Lead Magnets", keywords: ["free trial", "ebook", "checklist", "template", "webinar", "consultation"] },
      { id: "2", name: "Industries", keywords: ["B2B", "real estate", "insurance", "finance", "consulting", "coaching"] },
      { id: "3", name: "Funnel Stage", keywords: ["awareness", "consideration", "decision", "retention", "referral", "upsell"] }
    ]
  },
  webinar_topics: {
    icon: Users,
    title: "Webinar Topics",
    description: "Educational webinar and workshop ideas",
    color: "text-blue-700",
    category: "Lead Generation",
    groups: [
      { id: "1", name: "Topics", keywords: ["masterclass", "workshop", "training", "certification", "bootcamp", "challenge"] },
      { id: "2", name: "Outcomes", keywords: ["learn to", "master", "avoid mistakes", "increase", "optimize", "transform"] },
      { id: "3", name: "Time Frames", keywords: ["in 30 days", "step by step", "beginner to expert", "quick start", "comprehensive", "advanced"] }
    ]
  },
  consultation: {
    icon: Users,
    title: "Consultation Services",
    description: "Professional service and consultation offerings",
    color: "text-green-700",
    category: "Lead Generation",
    groups: [
      { id: "1", name: "Services", keywords: ["strategy session", "audit", "consultation", "assessment", "planning", "coaching"] },
      { id: "2", name: "Specialties", keywords: ["marketing", "business", "financial", "legal", "technical", "personal"] },
      { id: "3", name: "Benefits", keywords: ["free", "personalized", "expert", "actionable", "confidential", "results driven"] }
    ]
  },

  // Seasonal & Holiday Templates
  seasonal: {
    icon: Calendar,
    title: "Seasonal Marketing",
    description: "Holiday and seasonal campaign keywords",
    color: "text-red-500",
    category: "Seasonal",
    groups: [
      { id: "1", name: "Holidays", keywords: ["Christmas", "Black Friday", "Valentine's Day", "Mother's Day", "Father's Day", "Halloween"] },
      { id: "2", name: "Seasons", keywords: ["spring", "summer", "fall", "winter", "back to school", "graduation"] },
      { id: "3", name: "Promotions", keywords: ["sale", "discount", "special offer", "limited time", "exclusive", "early bird"] }
    ]
  },
  gift_guides: {
    icon: Gift,
    title: "Gift Guide Ideas",
    description: "Holiday and occasion gift recommendations",
    color: "text-green-500",
    category: "Seasonal",
    groups: [
      { id: "1", name: "Recipients", keywords: ["mom", "dad", "kids", "teens", "grandparents", "teachers", "coworkers"] },
      { id: "2", name: "Occasions", keywords: ["Christmas", "birthday", "graduation", "wedding", "anniversary", "housewarming"] },
      { id: "3", name: "Budgets", keywords: ["under $25", "under $50", "under $100", "luxury", "budget friendly", "splurge worthy"] }
    ]
  },
  new_year: {
    icon: Star,
    title: "New Year Content",
    description: "New Year resolution and goal-setting content",
    color: "text-purple-500",
    category: "Seasonal",
    groups: [
      { id: "1", name: "Resolutions", keywords: ["health goals", "career goals", "financial goals", "relationship goals", "learning goals"] },
      { id: "2", name: "Topics", keywords: ["goal setting", "habit formation", "productivity", "self improvement", "planning"] },
      { id: "3", name: "Timeframes", keywords: ["30 day", "90 day", "6 month", "year long", "daily", "weekly"] }
    ]
  },
  summer_content: {
    icon: Sun,
    title: "Summer Content",
    description: "Summer activities and seasonal content",
    color: "text-yellow-500",
    category: "Seasonal",
    groups: [
      { id: "1", name: "Activities", keywords: ["vacation", "travel", "beach", "camping", "BBQ", "outdoor activities"] },
      { id: "2", name: "Products", keywords: ["swimwear", "sunscreen", "outdoor gear", "travel accessories", "summer fashion"] },
      { id: "3", name: "Themes", keywords: ["relaxation", "adventure", "family fun", "fitness", "entertaining", "wellness"] }
    ]
  }
};

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSelectTemplate = (templateKey: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateKey];
    onSelectTemplate(template.groups);
    onClose();
  };

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(Object.values(TEMPLATES).map(t => t.category)))];

  // Filter templates based on search term and category
  const filteredTemplates = Object.entries(TEMPLATES).filter(([key, template]) => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-white/90 border border-white/20">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900">Choose a Template</DialogTitle>
          <p className="text-gray-600">Select from over 50 professionally crafted keyword templates</p>
        </DialogHeader>
        
        {/* Search and Filter Controls */}
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates (e.g., 'e-commerce', 'local seo', 'beauty')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                  : "bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No templates found matching your search.</p>
              <p className="text-gray-400 text-sm mt-2">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
              {filteredTemplates.map(([key, template]) => {
                const Icon = template.icon;
                return (
                  <div
                    key={key}
                    className="backdrop-blur-md bg-white/60 border border-white/30 rounded-lg p-4 hover:bg-white/80 hover:border-white/50 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
                    onClick={() => handleSelectTemplate(key as keyof typeof TEMPLATES)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-white/40">
                        <Icon className={`h-5 w-5 ${template.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{template.title}</h4>
                        <Badge variant="secondary" className="text-xs bg-white/50 text-gray-600">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    <div className="mt-3 pt-3 border-t border-white/30">
                      <p className="text-xs text-gray-500">
                        {template.groups.length} keyword groups • {template.groups.reduce((acc, group) => acc + group.keywords.length, 0)} total keywords
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing {filteredTemplates.length} of {Object.keys(TEMPLATES).length} templates
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
