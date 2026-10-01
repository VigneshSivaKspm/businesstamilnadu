/** Canonical URL builders — keep every route shape in one place. */
export const urls = {
  business: (slug: string) => `/business/${slug}`,
  category: (slug: string) => `/categories/${slug}`,
  district: (slug: string) => `/district/${slug}`,
  districtCategory: (district: string, category: string) => `/district/${district}/${category}`,
  search(query: string, district?: string) {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (district) params.set('district', district);
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ''}`;
  },
};
