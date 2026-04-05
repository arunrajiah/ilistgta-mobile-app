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
