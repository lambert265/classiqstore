export type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ProductCategory =
  | "beanie"
  | "skirt"
  | "set"
  | "bag"
  | "accessory"
  | "shorts"
  | "baby_wear";

export type CustomRequestStatus =
  | "pending"
  | "in_progress"
  | "quoted"
  | "accepted"
  | "completed";

export type InsightType = "alert" | "opportunity" | "content";
export type AssistantMode = "chat" | "insight" | "plan" | "content";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock_count: number;
  category: ProductCategory;
  description: string | null;
  images: string[];
  size_prices: { size: string; price: number }[];
  is_flash_sale: boolean;
  flash_sale_price: number | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: {
    full_name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  items: { product_id: string; name: string; quantity: number; price: number; size: string }[];
  created_at: string;
  profiles?: { full_name: string | null; email: string | null };
}

export interface CustomRequest {
  id: string;
  user_id: string;
  product_type: string | null;
  description: string | null;
  reference_images: string[];
  status: CustomRequestStatus;
  quote_amount: number | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null };
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface LookbookEntry {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  published: boolean;
  created_at: string;
}

export interface Insight {
  type: InsightType;
  title: string;
  body: string;
  action: string;
  actionHref: string;
  urgent: boolean;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}
