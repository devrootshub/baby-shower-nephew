import demo from './DemoDataService';import real from './SupabaseDataService';import {isSupabaseConfigured} from '../lib/supabase';
export const dataService=isSupabaseConfigured?real:demo;export const isDemo=!isSupabaseConfigured;
