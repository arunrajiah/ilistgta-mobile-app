export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  type: 'business' | 'event';
}

export interface ListingImage {
  url: string;
  is_primary: boolean;
  alt_text?: string;
}

export interface Listing {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: Record<string, string>;
  avg_rating: number;
  review_count: number;
  is_featured: boolean;
  is_verified: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  category_id?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  categories?: Category;
  listing_images?: ListingImage[];
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
  business_listings?: { id: string; name: string; slug: string; city: string };
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url?: string;
  city: string;
  address?: string;
  start_date: string;
  end_date?: string;
  is_free: boolean;
  price: number;
  is_online: boolean;
  online_url?: string;
  categories?: Category;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'other';
  discount_value: number;
  code?: string;
  end_date?: string;
  is_featured: boolean;
  business_listings?: { name: string; slug: string; city: string };
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  created_at: string;
  user_profiles?: { full_name: string; avatar_url?: string };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'customer' | 'vendor' | 'admin';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface VendorProfile {
  id?: string;
  vendor_id?: string;
  business_name?: string;
  tagline?: string;
  description?: string;
  cover_image_url?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  social_media?: SocialMedia;
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  updated_at?: string;
}

export interface VendorEvent {
  id: string;
  title: string;
  slug?: string;
  city?: string;
  address?: string;
  start_date: string;
  end_date?: string;
  is_free: boolean;
  price?: number;
  is_online: boolean;
  ticket_url?: string;
  image_url?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  category_id?: string;
  listing_id?: string;
  description?: string;
  categories?: Category;
}

export interface VendorCoupon {
  id: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'bogo' | 'other';
  discount_value?: number;
  code?: string;
  start_date?: string;
  end_date?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  listing_id: string;
  business_listings?: { name: string; slug: string } | null;
}

export interface AnalyticsLog {
  page: string;
  created_at: string;
}

export interface AnalyticsEnquiry {
  id: string;
  listing_id: string;
  created_at: string;
  name: string;
  message: string;
}
