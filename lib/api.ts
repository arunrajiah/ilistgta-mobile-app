import { Category, Coupon, Event, Listing, Pagination, Review, UserProfile } from './types';

const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

if (!BASE_URL) {
  console.warn('[api] EXPO_PUBLIC_API_BASE_URL is not set. API calls will fail.');
}

async function request<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Parse JSON after checking ok so non-JSON error bodies (e.g. 502 HTML) don't mask the real status
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try { const json = await res.json(); message = json.error ?? message; } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ── Categories ───────────────────────────────────────────────
export async function getCategories(type: 'business' | 'event' = 'business') {
  const data = await request<{ categories: Category[] }>(`/api/v1/categories?type=${type}`);
  return data.categories;
}

// ── Listings ─────────────────────────────────────────────────
export async function getListings(params: {
  query?: string; category?: string; city?: string; page?: number; limit?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.query)    q.set('query', params.query);
  if (params.category) q.set('category', params.category);
  if (params.city)     q.set('city', params.city);
  if (params.page)     q.set('page', String(params.page));
  if (params.limit)    q.set('limit', String(params.limit));

  return request<{ listings: Listing[]; pagination: Pagination }>(
    `/api/v1/listings?${q.toString()}`
  );
}

export async function getListingBySlug(slug: string) {
  return request<{ listing: Listing; reviews: Review[] }>(`/api/v1/listings/${slug}`);
}

// ── Events ───────────────────────────────────────────────────
export async function getEvents(params: {
  category?: string; city?: string; page?: number; limit?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.city)     q.set('city', params.city);
  if (params.page)     q.set('page', String(params.page));
  if (params.limit)    q.set('limit', String(params.limit));

  return request<{ events: Event[]; pagination: Pagination }>(`/api/v1/events?${q.toString()}`);
}

export async function getEventBySlug(slug: string) {
  return request<{ event: Event }>(`/api/v1/events/${slug}`);
}

// ── Coupons ───────────────────────────────────────────────────
export async function getCoupons(params: { page?: number; limit?: number } = {}) {
  const q = new URLSearchParams();
  if (params.page)  q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));

  return request<{ coupons: Coupon[]; pagination: Pagination }>(`/api/v1/coupons?${q.toString()}`);
}

// ── Search ────────────────────────────────────────────────────
export async function search(params: {
  q: string; type?: 'all' | 'listings' | 'events' | 'coupons'; city?: string; page?: number;
}) {
  const qs = new URLSearchParams();
  qs.set('q', params.q);
  if (params.type) qs.set('type', params.type);
  if (params.city) qs.set('city', params.city);
  if (params.page !== undefined) qs.set('page', String(params.page));
  return request<{
    query: string; results: {
      listings?: { items: Listing[]; total: number };
      events?: { items: Event[]; total: number };
      coupons?: { items: Coupon[]; total: number };
    };
  }>(`/api/v1/search?${qs.toString()}`);
}

// ── Auth endpoints ────────────────────────────────────────────
export async function getMe(token: string) {
  return request<{ user: UserProfile }>('/api/v1/me', {}, token);
}

export async function getMyListings(token: string) {
  return request<{ listings: Listing[] }>('/api/v1/me/listings', {}, token);
}

export async function createListing(
  token: string,
  data: {
    name: string;
    category_id?: string;
    short_description?: string;
    description?: string;
    address?: string;
    city: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    website?: string;
  },
): Promise<{ listing: Listing }> {
  return request<{ listing: Listing }>(
    '/api/v1/me/listings',
    { method: 'POST', body: JSON.stringify(data) },
    token,
  );
}

export async function updateListing(
  token: string,
  id: string,
  data: Partial<{
    name: string;
    category_id: string;
    short_description: string;
    description: string;
    address: string;
    city: string;
    postal_code: string;
    phone: string;
    email: string;
    website: string;
  }>,
): Promise<{ listing: Listing }> {
  return request<{ listing: Listing }>(
    `/api/v1/me/listings/${id}`,
    { method: 'PUT', body: JSON.stringify(data) },
    token,
  );
}

export async function deleteListing(token: string, id: string): Promise<void> {
  await request(`/api/v1/me/listings/${id}`, { method: 'DELETE' }, token);
}

export async function getMySaved(token: string) {
  return request<{ saved: Array<{ id: string; created_at: string; business_listings: Listing }> }>(
    '/api/v1/me/saved', {}, token
  );
}

export async function saveListing(token: string, listing_id: string) {
  return request<{ saved: boolean; id?: string }>(
    '/api/v1/me/saved',
    { method: 'POST', body: JSON.stringify({ listing_id }) },
    token,
  );
}

/** Alias for removeSaved — removes a saved entry by its favourites row id. */
export async function unsaveListing(token: string, savedId: string) {
  return removeSaved(token, savedId);
}

export async function removeSaved(token: string, id: string) {
  return request(`/api/v1/me/saved/${id}`, { method: 'DELETE' }, token);
}

/**
 * Check whether the authenticated user has saved a given listing.
 * Returns `{ saved: boolean; savedId: string | null }`.
 */
export async function checkSaved(
  token: string,
  listing_id: string,
): Promise<{ saved: boolean; savedId: string | null }> {
  const data = await getMySaved(token);
  const match = data.saved.find(s => s.business_listings?.id === listing_id);
  return match ? { saved: true, savedId: match.id } : { saved: false, savedId: null };
}

export async function submitEnquiry(data: {
  listing_id: string; name: string; email: string; phone?: string; message: string;
}) {
  return request('/api/enquiry', { method: 'POST', body: JSON.stringify(data) });
}

export async function submitReview(
  token: string,
  data: { listing_id: string; rating: number; title?: string; body: string },
): Promise<{ review: Review }> {
  return request<{ review: Review }>(
    '/api/v1/reviews',
    { method: 'POST', body: JSON.stringify(data) },
    token,
  );
}

export async function getMyEnquiries(token: string) {
  return request<{
    enquiries: Array<{
      id: string; name: string; email: string; phone?: string;
      message: string; created_at: string;
      business_listings?: { id: string; name: string; slug: string; city: string };
    }>;
  }>('/api/v1/me/enquiries', {}, token);
}

// ── Helpers ───────────────────────────────────────────────────
export function getPrimaryImage(images?: Array<{ url: string; is_primary: boolean }>) {
  if (!images?.length) return null;
  return images.find(i => i.is_primary)?.url ?? images[0]?.url ?? null;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date));
}

export function formatDiscount(type: string, value: number) {
  if (type === 'percentage') return `${value}% OFF`;
  if (type === 'fixed') return `$${value} OFF`;
  if (type === 'bogo') return 'BOGO';
  return 'DEAL';
}
