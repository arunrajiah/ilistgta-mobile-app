import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_KEY = 'ilistgta-lang';

export const translations = {
  en: {
    // Tab labels
    tabs: {
      home: 'Home',
      explore: 'Explore',
      events: 'Events',
      deals: 'Deals',
      map: 'Map',
      profile: 'Profile',
    },
    // Home screen
    home: {
      searchPlaceholder: 'Search businesses...',
      browseCategories: 'Browse Categories',
      viewAll: 'View All',
      seeAll: 'See All',
      featuredBusinesses: 'Featured Businesses',
      verifiedProfessionals: 'Verified professionals near you',
      upcomingEvents: 'Upcoming Events',
      discoverGTA: "Discover what's happening in the GTA",
      hotDeals: 'Hot Deals & Coupons',
      hotDealsSubtitle: 'Exclusive offers from local businesses',
      browseCity: 'Browse by City',
      findNearYou: 'Find businesses near you',
      newsletter: 'Stay in the Loop',
      newsletterSubtitle: 'Get the latest GTA deals and events in your inbox',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
      subscribed: "You're subscribed!",
      subscribing: 'Subscribing...',
      subscribedMsg: "Thanks for subscribing! We'll send you the best GTA deals.",
      more: 'More',
      noData: 'No data available',
      loading: 'Loading...',
      loadError: 'Failed to load. Please try again.',
      retry: 'Try Again',
      businesses: 'businesses',
      explore: 'Explore',
    },
    // Auth
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      resetSent: 'Password reset email sent!',
      resetInstruction: 'Check your inbox and follow the link to reset your password.',
      sendReset: 'Send Reset Email',
      sending: 'Sending...',
      backToLogin: 'Back to Login',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signInWith: 'Sign in with',
      continueWithGoogle: 'Continue with Google',
      orEmail: 'or sign in with email',
      welcomeBack: 'Welcome back',
      joinTitle: 'Join iListGTA',
      fullName: 'Full Name',
      confirmPassword: 'Confirm Password',
      createAccount: 'Create Account',
      cancel: 'Cancel',
      signOutConfirm: 'Are you sure you want to sign out?',
      error: 'Error',
      loginFailed: 'Login failed',
      registerFailed: 'Registration failed',
    },
    // Profile
    profile: {
      title: 'Profile',
      welcome: 'Welcome to iListGTA',
      signInPrompt: 'Sign in to save businesses, track your listings, and more.',
      myListings: 'My Listings',
      saved: 'Saved',
      savedBusinesses: 'Saved Businesses',
      language: 'Language',
      english: 'English',
      tamil: 'தமிழ்',
      settings: 'Settings',
      accountSettings: 'Account Settings',
      myEnquiries: 'My Enquiries',
      help: 'Help & Support',
      about: 'About iListGTA',
      contact: 'Contact Us',
      listBusiness: 'List Your Business',
      vendorProfile: 'Vendor Profile',
      myEvents: 'My Events',
      myCoupons: 'My Coupons',
      vendorDashboard: 'Vendor Dashboard',
      analytics: 'Analytics',
      blogArticles: 'Blog & Articles',
      addListing: 'Add a Listing',
      addListingSubtitle: 'Submit your business to iListGTA',
    },
    // Listings / Businesses
    listings: {
      title: 'Businesses',
      searchPlaceholder: 'Search businesses...',
      allCategories: 'All Categories',
      allCities: 'All Cities',
      filters: 'Filters',
      clearAll: 'Clear All',
      noResults: 'No businesses found',
      tryOther: 'Try a different search or category.',
      viewDetails: 'View Details',
      callNow: 'Call Now',
      getDirections: 'Get Directions',
      sendEnquiry: 'Send Enquiry',
      website: 'Website',
      share: 'Share',
      save: 'Save',
      saved: 'Saved',
      reviews: 'reviews',
      review: 'review',
      openNow: 'Open Now',
      closed: 'Closed',
    },
    // Events
    events: {
      title: 'Events',
      subtitle: "What's happening in the GTA",
      allEvents: 'All Events',
      upcoming: 'Upcoming',
      past: 'Past Events',
      noEvents: 'No events found',
      noUpcoming: 'Check back soon for upcoming GTA events!',
      free: 'Free',
      paid: 'Paid',
      online: 'Online',
    },
    // Deals / Coupons
    deals: {
      title: 'Deals & Coupons',
      subtitle: 'Exclusive offers from local businesses',
      noCoupons: 'No deals available',
      checkBack: 'Check back soon for exclusive deals!',
      expires: 'Expires',
      revealCode: 'Reveal Code',
      copyCode: 'Copy Code',
      copied: 'Copied!',
      off: 'off',
    },
    // Common
    common: {
      viewAll: 'View All',
      loadMore: 'Load More',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      close: 'Close',
      search: 'Search',
      share: 'Share',
      call: 'Call',
      directions: 'Directions',
      website: 'Website',
      enquiry: 'Enquiry',
      loading: 'Loading...',
      error: 'Something went wrong',
      retry: 'Retry',
      ok: 'OK',
    },
  },

  ta: {
    // Tab labels
    tabs: {
      home: 'முகப்பு',
      explore: 'ஆராய்க',
      events: 'நிகழ்வுகள்',
      deals: 'சலுகைகள்',
      map: 'வரைபடம்',
      profile: 'சுயவிவரம்',
    },
    // Home screen
    home: {
      searchPlaceholder: 'வணிகங்களை தேடுங்கள்...',
      browseCategories: 'வகைகளை உலாவுங்கள்',
      viewAll: 'அனைத்தையும் காண்க',
      seeAll: 'அனைத்தையும் பார்க்க',
      featuredBusinesses: 'சிறப்பு வணிகங்கள்',
      verifiedProfessionals: 'உங்களுக்கு அருகில் சரிபார்க்கப்பட்ட நிபுணர்கள்',
      upcomingEvents: 'வரவிருக்கும் நிகழ்வுகள்',
      discoverGTA: 'GTA-வில் என்ன நடக்கிறது என்று கண்டறியுங்கள்',
      hotDeals: 'சிறப்பு சலுகைகள் & தள்ளுபடிகள்',
      hotDealsSubtitle: 'உள்ளூர் வணிகங்களிலிருந்து சிறப்பு சலுகைகள்',
      browseCity: 'நகரின்படி உலாவுங்கள்',
      findNearYou: 'உங்களுக்கு அருகில் வணிகங்களை கண்டறியுங்கள்',
      newsletter: 'தகவல்களை அறிந்திருங்கள்',
      newsletterSubtitle: 'சிறந்த GTA சலுகைகள் மற்றும் நிகழ்வுகளை உங்கள் inbox-ல் பெறுங்கள்',
      emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடுங்கள்',
      subscribe: 'பதிவு செய்யுங்கள்',
      subscribed: 'பதிவு செய்யப்பட்டது!',
      subscribing: 'பதிவு செய்கிறோம்...',
      subscribedMsg: 'நன்றி! சிறந்த GTA சலுகைகளை உங்களுக்கு அனுப்புவோம்.',
      more: 'மேலும்',
      noData: 'தரவு எதுவும் இல்லை',
      loading: 'ஏற்றுகிறோம்...',
      loadError: 'ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      retry: 'மீண்டும் முயற்சி',
      businesses: 'வணிகங்கள்',
      explore: 'ஆராயுங்கள்',
    },
    // Auth
    auth: {
      signIn: 'உள்நுழைவு',
      signOut: 'வெளியேறு',
      register: 'பதிவு செய்யுங்கள்',
      email: 'மின்னஞ்சல்',
      password: 'கடவுச்சொல்',
      forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
      resetPassword: 'கடவுச்சொல்லை மீட்டமை',
      resetSent: 'கடவுச்சொல் மீட்டமை மின்னஞ்சல் அனுப்பப்பட்டது!',
      resetInstruction: 'உங்கள் inbox-ஐ சரிபாருங்கள், இணைப்பைப் பின்பற்றி கடவுச்சொல்லை மீட்டமையுங்கள்.',
      sendReset: 'மீட்டமை மின்னஞ்சல் அனுப்பு',
      sending: 'அனுப்புகிறோம்...',
      backToLogin: 'உள்நுழைவுக்கு திரும்பு',
      noAccount: 'கணக்கு இல்லையா?',
      haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      signInWith: 'இதன் மூலம் உள்நுழைக',
      continueWithGoogle: 'Google உடன் தொடரவும்',
      orEmail: 'அல்லது மின்னஞ்சலுடன் உள்நுழைக',
      welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
      joinTitle: 'iListGTA-ல் சேருங்கள்',
      fullName: 'முழு பெயர்',
      confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்துங்கள்',
      createAccount: 'கணக்கை உருவாக்குங்கள்',
      cancel: 'ரத்து செய்',
      signOutConfirm: 'வெளியேற விரும்புகிறீர்களா?',
      error: 'பிழை',
      loginFailed: 'உள்நுழைவு தோல்வியடைந்தது',
      registerFailed: 'பதிவு தோல்வியடைந்தது',
    },
    // Profile
    profile: {
      title: 'சுயவிவரம்',
      welcome: 'iListGTA-க்கு வரவேற்கிறோம்',
      signInPrompt: 'வணிகங்களை சேமிக்க, உங்கள் பட்டியல்களை கண்காணிக்க உள்நுழையுங்கள்.',
      myListings: 'என் பட்டியல்கள்',
      saved: 'சேமிக்கப்பட்டவை',
      savedBusinesses: 'சேமிக்கப்பட்ட வணிகங்கள்',
      language: 'மொழி',
      english: 'English',
      tamil: 'தமிழ்',
      settings: 'அமைப்புகள்',
      accountSettings: 'கணக்கு அமைப்புகள்',
      myEnquiries: 'என் விசாரணைகள்',
      help: 'உதவி & ஆதரவு',
      about: 'iListGTA பற்றி',
      contact: 'தொடர்பு கொள்ளுங்கள்',
      listBusiness: 'உங்கள் வணிகத்தை பட்டியலிடுங்கள்',
      vendorProfile: 'விற்பனையாளர் சுயவிவரம்',
      myEvents: 'என் நிகழ்வுகள்',
      myCoupons: 'என் சலுகைகள்',
      vendorDashboard: 'விற்பனையாளர் டாஷ்போர்டு',
      analytics: 'பகுப்பாய்வு',
      blogArticles: 'வலைப்பதிவு & கட்டுரைகள்',
      addListing: 'பட்டியல் சேர்க்கவும்',
      addListingSubtitle: 'உங்கள் வணிகத்தை iListGTA-ல் சமர்ப்பிக்கவும்',
    },
    // Listings / Businesses
    listings: {
      title: 'வணிகங்கள்',
      searchPlaceholder: 'வணிகங்களை தேடுங்கள்...',
      allCategories: 'அனைத்து வகைகளும்',
      allCities: 'அனைத்து நகரங்களும்',
      filters: 'வடிப்பான்கள்',
      clearAll: 'அனைத்தையும் நீக்கு',
      noResults: 'வணிகங்கள் எதுவும் கிடைக்கவில்லை',
      tryOther: 'வேறு தேடல் அல்லது வகையை முயற்சிக்கவும்.',
      viewDetails: 'விவரங்களை காண்க',
      callNow: 'இப்போது அழையுங்கள்',
      getDirections: 'வழிகாட்டுதல் பெறு',
      sendEnquiry: 'தொடர்பு கொள்ளுங்கள்',
      website: 'இணையதளம்',
      share: 'பகிர்',
      save: 'சேமி',
      saved: 'சேமிக்கப்பட்டது',
      reviews: 'மதிப்புரைகள்',
      review: 'மதிப்புரை',
      openNow: 'இப்போது திறந்திருக்கிறது',
      closed: 'மூடப்பட்டுள்ளது',
    },
    // Events
    events: {
      title: 'நிகழ்வுகள்',
      subtitle: 'GTA-வில் என்ன நடக்கிறது',
      allEvents: 'அனைத்து நிகழ்வுகளும்',
      upcoming: 'வரவிருக்கும்',
      past: 'கடந்த நிகழ்வுகள்',
      noEvents: 'நிகழ்வுகள் எதுவும் கிடைக்கவில்லை',
      noUpcoming: 'வரவிருக்கும் GTA நிகழ்வுகளுக்கு விரைவில் மீண்டும் சரிபாருங்கள்!',
      free: 'இலவசம்',
      paid: 'கட்டணம்',
      online: 'ஆன்லைன்',
    },
    // Deals / Coupons
    deals: {
      title: 'சலுகைகள் & தள்ளுபடிகள்',
      subtitle: 'உள்ளூர் வணிகங்களிலிருந்து சிறப்பு சலுகைகள்',
      noCoupons: 'சலுகைகள் எதுவும் இல்லை',
      checkBack: 'சிறப்பு சலுகைகளுக்கு விரைவில் மீண்டும் சரிபாருங்கள்!',
      expires: 'காலாவதி',
      revealCode: 'குறியீட்டை காட்டு',
      copyCode: 'குறியீட்டை நகலெடு',
      copied: 'நகலெடுக்கப்பட்டது!',
      off: 'தள்ளுபடி',
    },
    // Common
    common: {
      viewAll: 'அனைத்தையும் காண்க',
      loadMore: 'மேலும் காட்டு',
      back: 'திரும்பு',
      save: 'சேமி',
      cancel: 'ரத்து செய்',
      submit: 'சமர்ப்பி',
      close: 'மூடு',
      search: 'தேடு',
      share: 'பகிர்',
      call: 'அழை',
      directions: 'வழிகாட்டுதல்',
      website: 'இணையதளம்',
      enquiry: 'தொடர்பு கொள்',
      loading: 'ஏற்றுகிறோம்...',
      error: 'ஏதோ தவறு நடந்தது',
      retry: 'மீண்டும் முயற்சி',
      ok: 'சரி',
    },
  },
};

export type Lang = 'en' | 'ta';
export type TranslationKeys = typeof translations.en;

// ── Language Context ──────────────────────────────────────────────────────────

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

export const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved === 'ta' || saved === 'en') setLangState(saved);
    }).catch(() => {});
  }, []);

  const setLang = useCallback((code: Lang) => {
    setLangState(code);
    AsyncStorage.setItem(LANG_KEY, code).catch(() => {});
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[lang];
    for (const k of keys) {
      if (value == null || typeof value !== 'object') return key;
      value = (value as Record<string, unknown>)[k];
    }
    return typeof value === 'string' ? value : key;
  }, [lang]);

  return React.createElement(LangContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useLang() {
  return useContext(LangContext);
}
