
// Available languages
export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'pa';

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

// Basic translations (to be expanded)
export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Auth translations
    'sign_in': 'Sign In',
    'sign_up': 'Create Account',
    'email': 'Email',
    'phone': 'Phone Number',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'name': 'Full Name',
    'forgot_password': 'Forgot password?',
    'reset_password': 'Reset Password',
    'verify_otp': 'Verify OTP',
    'send_otp': 'Send OTP',
    'resend_otp': 'Resend OTP',
    'dont_have_account': "Don't have an account? Sign up",
    'already_have_account': 'Already have an account? Sign in',
    
    // Settings translations
    'settings': 'Settings',
    'profile': 'Profile',
    'change_password': 'Change Password',
    'language': 'Language',
    'currency': 'Currency',
    'date_format': 'Date Format',
    'default_view': 'Default View',
    'theme': 'Theme',
    'font_size': 'Font Size',
    'save': 'Save',
    'cancel': 'Cancel',
    'old_password': 'Old Password',
    'new_password': 'New Password',
    
    // Calculations
    'calculations': 'Calculations',
    'tax_calculator': 'Tax Calculator',
    'interest_calculator': 'Interest Calculator',
    'currency_converter': 'Currency Converter',
    'calculate': 'Calculate',
    'result': 'Result',
  },
  hi: {
    // Auth translations
    'sign_in': 'साइन इन करें',
    'sign_up': 'खाता बनाएं',
    'email': 'ईमेल',
    'phone': 'फ़ोन नंबर',
    'password': 'पासवर्ड',
    'confirm_password': 'पासवर्ड की पुष्टि करें',
    'name': 'पूरा नाम',
    'forgot_password': 'पासवर्ड भूल गए?',
    'reset_password': 'पासवर्ड रीसेट करें',
    'verify_otp': 'OTP सत्यापित करें',
    'send_otp': 'OTP भेजें',
    'resend_otp': 'OTP पुनः भेजें',
    'dont_have_account': 'खाता नहीं है? साइन अप करें',
    'already_have_account': 'पहले से ही खाता है? साइन इन करें',
    
    // Settings translations
    'settings': 'सेटिंग्स',
    'profile': 'प्रोफ़ाइल',
    'change_password': 'पासवर्ड बदलें',
    'language': 'भाषा',
    'currency': 'मुद्रा',
    'date_format': 'दिनांक प्रारूप',
    'default_view': 'डिफ़ॉल्ट दृश्य',
    'theme': 'थीम',
    'font_size': 'फ़ॉन्ट आकार',
    'save': 'सेव करें',
    'cancel': 'रद्द करें',
    'old_password': 'पुराना पासवर्ड',
    'new_password': 'नया पासवर्ड',
    
    // Calculations
    'calculations': 'गणना',
    'tax_calculator': 'कर कैलकुलेटर',
    'interest_calculator': 'ब्याज कैलकुलेटर',
    'currency_converter': 'मुद्रा परिवर्तक',
    'calculate': 'गणना करें',
    'result': 'परिणाम',
  },
  bn: {
    // Basic Bengali translations
    'sign_in': 'সাইন ইন',
    'sign_up': 'অ্যাকাউন্ট তৈরি করুন',
    'email': 'ইমেইল',
    'phone': 'ফোন নম্বর',
    'password': 'পাসওয়ার্ড',
    'confirm_password': 'পাসওয়ার্ড নিশ্চিত করুন',
    'name': 'পুরো নাম',
    'forgot_password': 'পাসওয়ার্ড ভুলে গেছেন?',
    'reset_password': 'পাসওয়ার্ড রিসেট',
    'verify_otp': 'OTP যাচাই করুন',
    'send_otp': 'OTP পাঠান',
    'resend_otp': 'OTP আবার পাঠান',
    'dont_have_account': 'অ্যাকাউন্ট নেই? সাইন আপ করুন',
    'already_have_account': 'ইতিমধ্যে একটি অ্যাকাউন্ট আছে? সাইন ইন করুন',
    
    // Settings translations
    'settings': 'সেটিংস',
    'profile': 'প্রোফাইল',
    'change_password': 'পাসওয়ার্ড পরিবর্তন করুন',
    'language': 'ভাষা',
    'currency': 'মুদ্রা',
    'date_format': 'তারিখ ফরম্যাট',
    'default_view': 'ডিফল্ট ভিউ',
    'theme': 'থিম',
    'font_size': 'ফন্ট সাইজ',
    'save': 'সংরক্ষণ করুন',
    'cancel': 'বাতিল করুন',
    'old_password': 'পুরানো পাসওয়ার্ড',
    'new_password': 'নতুন পাসওয়ার্ড',
    
    // Calculations
    'calculations': 'গণনা',
    'tax_calculator': 'ট্যাক্স ক্যালকুলেটর',
    'interest_calculator': 'সুদ ক্যালকুলেটর',
    'currency_converter': 'মুদ্রা কনভার্টার',
    'calculate': 'গণনা করুন',
    'result': 'ফলাফল',
  },
  te: {
    // Basic Telugu translations
    'sign_in': 'సైన్ ఇన్',
    'sign_up': 'ఖాతా సృష్టించండి',
    'email': 'ఇమెయిల్',
    'phone': 'ఫోన్ నంబర్',
    'password': 'పాస్‌వర్డ్',
    'confirm_password': 'పాస్‌వర్డ్ నిర్ధారించండి',
    'name': 'పూర్తి పేరు',
    'forgot_password': 'పాస్‌వర్డ్ మర్చిపోయారా?',
    'reset_password': 'పాస్‌వర్డ్ రీసెట్ చేయండి',
    'verify_otp': 'OTP ధృవీకరించండి',
    'send_otp': 'OTP పంపండి',
    'resend_otp': 'OTP మళ్ళీ పంపండి',
    'dont_have_account': 'ఖాతా లేదా? సైన్ అప్ చేయండి',
    'already_have_account': 'ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి',
    
    // Settings translations
    'settings': 'సెట్టింగ్‌లు',
    'profile': 'ప్రొఫైల్',
    'change_password': 'పాస్‌వర్డ్ మార్చండి',
    'language': 'భాష',
    'currency': 'కరెన్సీ',
    'date_format': 'తేదీ ఫార్మాట్',
    'default_view': 'డిఫాల్ట్ వీక్షణ',
    'theme': 'థీమ్',
    'font_size': 'ఫాంట్ సైజు',
    'save': 'సేవ్ చేయండి',
    'cancel': 'రద్దు చేయండి',
    'old_password': 'పాత పాస్‌వర్డ్',
    'new_password': 'కొత్త పాస్‌వర్డ్',
    
    // Calculations
    'calculations': 'లెక్కింపులు',
    'tax_calculator': 'పన్ను క్యాల్క్యులేటర్',
    'interest_calculator': 'వడ్డీ క్యాల్క్యులేటర్',
    'currency_converter': 'కరెన్సీ కన్వర్టర్',
    'calculate': 'లెక్కించండి',
    'result': 'ఫలితం',
  },
  ta: {
    // Basic Tamil translations
    'sign_in': 'உள்நுழைக',
    'sign_up': 'கணக்கை உருவாக்குக',
    'email': 'மின்னஞ்சல்',
    'phone': 'தொலைபேசி எண்',
    'password': 'கடவுச்சொல்',
    'confirm_password': 'கடவுச்சொல்லை உறுதிப்படுத்துக',
    'name': 'முழு பெயர்',
    'forgot_password': 'கடவுச்சொல் மறந்துவிட்டீர்களா?',
    'reset_password': 'கடவுச்சொல்லை மீட்டமைக்க',
    'verify_otp': 'OTP ஐ சரிபார்க்கவும்',
    'send_otp': 'OTP அனுப்பு',
    'resend_otp': 'OTP ஐ மீண்டும் அனுப்பு',
    'dont_have_account': 'கணக்கு இல்லையா? பதிவு செய்யுங்கள்',
    'already_have_account': 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைக',
    
    // Settings translations
    'settings': 'அமைப்புகள்',
    'profile': 'சுயவிவரம்',
    'change_password': 'கடவுச்சொல்லை மாற்று',
    'language': 'மொழி',
    'currency': 'நாணயம்',
    'date_format': 'தேதி வடிவம்',
    'default_view': 'இயல்புநிலை காட்சி',
    'theme': 'தீம்',
    'font_size': 'எழுத்துரு அளவு',
    'save': 'சேமி',
    'cancel': 'ரத்து செய்',
    'old_password': 'பழைய கடவுச்சொல்',
    'new_password': 'புதிய கடவுச்சொல்',
    
    // Calculations
    'calculations': 'கணக்கீடுகள்',
    'tax_calculator': 'வரி கால்குலேட்டர்',
    'interest_calculator': 'வட்டி கால்குலேட்டர்',
    'currency_converter': 'நாணய மாற்றி',
    'calculate': 'கணக்கிடு',
    'result': 'முடிவு',
  },
  pa: {
    // Basic Punjabi translations
    'sign_in': 'ਸਾਈਨ ਇਨ',
    'sign_up': 'ਖਾਤਾ ਬਣਾਓ',
    'email': 'ਈਮੇਲ',
    'phone': 'ਫੋਨ ਨੰਬਰ',
    'password': 'ਪਾਸਵਰਡ',
    'confirm_password': 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'name': 'ਪੂਰਾ ਨਾਮ',
    'forgot_password': 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',
    'reset_password': 'ਪਾਸਵਰਡ ਰੀਸੈਟ ਕਰੋ',
    'verify_otp': 'OTP ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'send_otp': 'OTP ਭੇਜੋ',
    'resend_otp': 'OTP ਦੁਬਾਰਾ ਭੇਜੋ',
    'dont_have_account': 'ਖਾਤਾ ਨਹੀਂ ਹੈ? ਸਾਈਨ ਅੱਪ ਕਰੋ',
    'already_have_account': 'ਪਹਿਲਾਂ ਤੋਂ ਹੀ ਖਾਤਾ ਹੈ? ਸਾਈਨ ਇਨ ਕਰੋ',
    
    // Settings translations
    'settings': 'ਸੈਟਿੰਗਾਂ',
    'profile': 'ਪ੍ਰੋਫਾਈਲ',
    'change_password': 'ਪਾਸਵਰਡ ਬਦਲੋ',
    'language': 'ਭਾਸ਼ਾ',
    'currency': 'ਮੁਦਰਾ',
    'date_format': 'ਤਾਰੀਖ ਫਾਰਮੈਟ',
    'default_view': 'ਡਿਫੌਲਟ ਵਿਊ',
    'theme': 'ਥੀਮ',
    'font_size': 'ਫੋਂਟ ਆਕਾਰ',
    'save': 'ਸੰਭਾਲੋ',
    'cancel': 'ਰੱਦ ਕਰੋ',
    'old_password': 'ਪੁਰਾਣਾ ਪਾਸਵਰਡ',
    'new_password': 'ਨਵਾਂ ਪਾਸਵਰਡ',
    
    // Calculations
    'calculations': 'ਗਣਨਾ',
    'tax_calculator': 'ਟੈਕਸ ਕੈਲਕੁਲੇਟਰ',
    'interest_calculator': 'ਵਿਆਜ ਕੈਲਕੁਲੇਟਰ',
    'currency_converter': 'ਮੁਦਰਾ ਕਨਵਰਟਰ',
    'calculate': 'ਗਣਨਾ ਕਰੋ',
    'result': 'ਨਤੀਜਾ',
  },
};

// This context will be used to provide translations throughout the app
import React, { createContext, useState, useContext, ReactNode } from 'react';

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
};

const defaultLanguage: LanguageCode = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>(() => {
    // Try to get language from localStorage
    const savedLanguage = localStorage.getItem('language') as LanguageCode;
    return savedLanguage && translations[savedLanguage] ? savedLanguage : defaultLanguage;
  });

  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // You could also adjust document.dir for RTL languages if needed
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations[defaultLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
