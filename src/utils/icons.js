import {
  Utensils, Car, ShoppingBag, Film, HeartPulse, GraduationCap, Zap, Home,
  Shield, Sparkles, Plane, Gift, Wallet, Laptop, TrendingUp, PlusCircle,
  Target, AlertTriangle, AlertCircle, PieChart, Repeat, CheckCircle2,
  Activity, Clock, XCircle, Banknote, CreditCard, Building2, Smartphone,
  MoreHorizontal,
} from "lucide-react";

const iconMap = {
  Utensils, Car, ShoppingBag, Film, HeartPulse, GraduationCap, Zap, Home,
  Shield, Sparkles, Plane, Gift, Wallet, Laptop, TrendingUp, PlusCircle,
  Target, AlertTriangle, AlertCircle, PieChart, Repeat, CheckCircle2,
  Activity, Clock, XCircle, Banknote, CreditCard, Building2, Smartphone,
  MoreHorizontal,
};

// Returns the icon component for a name like "Utensils", or null.
export const getIcon = (name) => iconMap[name] || null;
