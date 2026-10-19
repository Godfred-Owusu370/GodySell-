import { Product, Order, Inquiry, SiteAnnouncement } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INQUIRIES: Inquiry[] = [];

export const INITIAL_ANNOUNCEMENT: SiteAnnouncement = {
  id: 'ann-1',
  text: 'Special Ghana Marketplace Promo: Enjoy Free Delivery on Tech & Electronics across Greater Accra & Kumasi!',
  badgeText: 'HOT DEAL',
  active: true
};

export const GHANA_REGIONS: { name: string; cities: string[] }[] = [
  {
    name: 'Greater Accra',
    cities: ['Accra Central', 'East Legon', 'Spintex', 'Osu', 'Airport Residential', 'Tema', 'Madina', 'Cantonments', 'Dansoman', 'Kasoa']
  },
  {
    name: 'Ashanti',
    cities: ['Kumasi Central', 'Adum', 'Bantama', 'KNUST', 'Asokwa', 'Ahodwo', 'Suame', 'Tafo']
  },
  {
    name: 'Western',
    cities: ['Takoradi', 'Sekondi', 'Tarkwa', 'Effia']
  },
  {
    name: 'Central',
    cities: ['Cape Coast', 'Winneba', 'Elmina', 'Mfantseman']
  },
  {
    name: 'Eastern',
    cities: ['Koforidua', 'Akosombo', 'Nkawkaw', 'Nsawam']
  },
  {
    name: 'Northern',
    cities: ['Tamale', 'Yendi', 'Savelugu']
  },
  {
    name: 'Volta',
    cities: ['Ho', 'Hohoe', 'Keta', 'Aflao']
  }
];

export const CATEGORIES_WITH_META = [
  { name: 'Vehicles', icon: 'Car', count: 1840, subcategories: ['Cars', 'Buses & Microbuses', 'Motorcycles & Scooters', 'Trucks & Trailers', 'Vehicle Parts & Accessories'] },
  { name: 'Property & Real Estate', icon: 'Home', count: 3200, subcategories: ['Houses & Apartments for Sale', 'Houses & Apartments for Rent', 'Land & Plots', 'Commercial Property'] },
  { name: 'Mobile Phones & Tablets', icon: 'Smartphone', count: 4890, subcategories: ['Mobile Phones', 'Tablets', 'Accessories', 'Smart Watches'] },
  { name: 'Electronics & Appliances', icon: 'Tv', count: 3750, subcategories: ['Laptops & Computers', 'TVs & DVD Equipment', 'Audio & Music Equipment', 'Cameras & Video Recorders'] },
  { name: 'Home, Furniture & Appliances', icon: 'Armchair', count: 2100, subcategories: ['Furniture', 'Kitchen Appliances', 'Home Accessories', 'Lighting'] },
  { name: 'Fashion & Beauty', icon: 'ShoppingBag', count: 5400, subcategories: ['Shoes', 'Clothing', 'Bags', 'Watches & Jewelry', 'Hair & Cosmetics'] },
  { name: 'Commercial Equipment', icon: 'Wrench', count: 890, subcategories: ['Restaurant & Catering Equipment', 'Manufacturing Equipment', 'Medical Equipment', 'Printing Equipment'] },
  { name: 'Agriculture & Food', icon: 'Wheat', count: 1250, subcategories: ['Livestock & Poultry', 'Farm Machinery & Equipment', 'Crops & Seeds', 'Feeds & Supplements'] },
  { name: 'Jobs & Services', icon: 'Briefcase', count: 960, subcategories: ['Artisans & Handyman', 'IT & Software', 'Cleaning & Housekeeping', 'Driving & Transport'] },
  { name: 'Others', icon: 'MoreHorizontal', count: 1420, subcategories: ['General Goods', 'Books, Sports & Hobbies', 'Musical Instruments', 'Kids & Baby Essentials', 'Pets & Pet Care', 'Miscellaneous Items'] }
];
