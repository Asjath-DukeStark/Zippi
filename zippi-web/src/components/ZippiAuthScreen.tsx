import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, User, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, MessageSquareCode } from 'lucide-react';
import { triggerHapticFeedback } from '../utils';

interface ZippiAuthScreenProps {
    onAuthSuccess: (name: string, phone: string, email: string) => void;
}

interface SavedUser {
    name: string;
    phone: string;
    email: string;
}

export default function ZippiAuthScreen({ onAuthSuccess }: ZippiAuthScreenProps) {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

    // Signup State
    const [signupName, setSignupName] = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupEmail, setSignupEmail] = useState('');

    // Login State
    const [loginPhone, setLoginPhone] = useState('');

    // OTP Verification States
    const [otpSent, setOtpSent] = useState(false);
    const [simulatedOtp, setSimulatedOtp] = useState('');
    const [enteredOtp, setEnteredOtp] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpError, setOtpError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [tempUserData, setTempUserData] = useState<SavedUser | null>(null);

    // Simulated push SMS notification state
    const [showSmsNotification, setShowSmsNotification] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');
    const [validationError, setValidationError] = useState('');

    // Pre-seed local database with default user if not exists
    useEffect(() => {
        const existingUsers = localStorage.getItem('zippi_users_db');
        if (!existingUsers) {
            const defaultUsers: SavedUser[] = [
                {
                    name: 'Asjath Ahamed',
                    phone: '0771234567',
                    email: 'asjathahamed0@gmail.com',
                },
                {
                    name: 'Asjath Ahamed',
                    phone: '+94771234567',
                    email: 'asjathahamed0@gmail.com',
                },
                {
                    name: 'Asjath Ahamed',
                    phone: '771234567',
                    email: 'asjathahamed0@gmail.com',
                }
            ];
            localStorage.setItem('zippi_users_db', JSON.stringify(defaultUsers));
        }
    }, []);

    // Timer cooldown logic for OTP
    useEffect(() => {
        if (otpTimer > 0) {
            const timerId = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [otpTimer]);

    // Clean form errors when changing tabs
    const handleTabChange = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        setValidationError('');
        setOtpError('');
        setEnteredOtp('');
        setOtpSent(false);
        triggerHapticFeedback('light');
    };

    // Regular expression to check basic format of phone numbers
    const isValidPhoneNumber = (num: string) => {
        const digitsOnly = num.replace(/\D/g, '');
        return digitsOnly.length >= 8 && digitsOnly.length <= 15;
    };

    // Normalize phone number to match records (removes non-digits, standardizes ending digits)
    const getNormalizedPhone = (num: string): string => {
        const digits = num.replace(/\D/g, '');
        // Take last 9 digits for Sri Lankan mobile compatibility (e.g. 771234567)
        return digits.length >= 9 ? digits.slice(-9) : digits;
    };

    // Triggers simulated SMS OTP arrival
    const triggerSmsPush = (otp: string, phoneNum: string) => {
        setNotificationMsg(`💬 Zippi OTP: Your verification code is ${otp}. Please enter this to complete your login on Zippi.`);
        setShowSmsNotification(true);
        triggerHapticFeedback('double');

        // Auto hide standard notification banner after 8 seconds
        setTimeout(() => {
            setShowSmsNotification(false);
        }, 8000);
    };

    const handleSendOtpLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (!loginPhone.trim()) {
            setValidationError('Please enter your mobile phone number.');
            triggerHapticFeedback('error');
            return;
        }

        if (!isValidPhoneNumber(loginPhone)) {
            setValidationError('Please enter a valid mobile number (min. 9 digits).');
            triggerHapticFeedback('error');
            return;
        }

        // Check if the user is in our simulated DB
        const usersDb: SavedUser[] = JSON.parse(localStorage.getItem('zippi_users_db') || '[]');
        const targetNorm = getNormalizedPhone(loginPhone);
        const matchedUser = usersDb.find(u => getNormalizedPhone(u.phone) === targetNorm);

        if (!matchedUser) {
            setValidationError('This mobile number is not registered yet. Please slide to Sign Up!');
            triggerHapticFeedback('error');
            return;
        }

        // Success - generate 4-digit OTP
        const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
        setSimulatedOtp(generatedOtp);
        setTempUserData(matchedUser);
        setOtpSent(true);
        setOtpTimer(60);
        setOtpError('');
        setEnteredOtp('');

        // Send simulated SMS
        triggerSmsPush(generatedOtp, matchedUser.phone);
    };

    const handleSendOtpSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (!signupName.trim()) {
            setValidationError('Please enter your full name.');
            triggerHapticFeedback('error');
            return;
        }

        if (!signupPhone.trim()) {
            setValidationError('Please enter your mobile phone number.');
            triggerHapticFeedback('error');
            return;
        }

        if (!isValidPhoneNumber(signupPhone)) {
            setValidationError('Please enter a valid mobile phone number.');
            triggerHapticFeedback('error');
            return;
        }

        if (signupEmail.trim() && !signupEmail.includes('@')) {
            setValidationError('Please enter a valid email address.');
            triggerHapticFeedback('error');
            return;
        }

        // Check if phone already registered in Database to prevent duplicate Signups
        const usersDb: SavedUser[] = JSON.parse(localStorage.getItem('zippi_users_db') || '[]');
        const signupNorm = getNormalizedPhone(signupPhone);
        const isAlreadyRegistered = usersDb.some(u => getNormalizedPhone(u.phone) === signupNorm);

        if (isAlreadyRegistered) {
            setValidationError('This phone number is already registered. Please slide to Login.');
            triggerHapticFeedback('error');
            return;
        }

        // Success - generate 4-digit OTP
        const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
        setSimulatedOtp(generatedOtp);
        setTempUserData({
            name: signupName,
            phone: signupPhone,
            email: signupEmail || 'no-email@zippi.lk'
        });
        setOtpSent(true);
        setOtpTimer(60);
        setOtpError('');
        setEnteredOtp('');

        triggerSmsPush(generatedOtp, signupPhone);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setOtpError('');

        if (enteredOtp.length !== 4) {
            setOtpError('Please enter the 4-digit verification code.');
            triggerHapticFeedback('error');
            return;
        }

        if (enteredOtp !== simulatedOtp) {
            setOtpError('Incorrect verification code. Please try again or resend!');
            triggerHapticFeedback('error');
            return;
        }

        // Success! Verify OTP action completed
        setIsVerifying(true);
        triggerHapticFeedback('success');

        setTimeout(() => {
            if (tempUserData) {
                // If it was a signup, append the new user to our local DB
                if (activeTab === 'signup') {
                    const usersDb: SavedUser[] = JSON.parse(localStorage.getItem('zippi_users_db') || '[]');
                    usersDb.push(tempUserData);
                    localStorage.setItem('zippi_users_db', JSON.stringify(usersDb));
                }

                // Notify parent about login success
                onAuthSuccess(tempUserData.name, tempUserData.phone, tempUserData.email);
            }
            setIsVerifying(false);
        }, 1200);
    };

    // Helper autofill for testing convenience
    const handleAutofillOtp = () => {
        setEnteredOtp(simulatedOtp);
        triggerHapticFeedback('light');
    };

    const handleResendOtp = () => {
        if (otpTimer > 0) return;
        const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
        setSimulatedOtp(generatedOtp);
        setOtpTimer(60);
        setOtpError('');
        setEnteredOtp('');

        if (tempUserData) {
            triggerSmsPush(generatedOtp, tempUserData.phone);
        }
    };

    return (
        <div className="flex-grow flex flex-col justify-between h-full bg-white relative font-sans overflow-y-auto" id="zippi-auth-container">

            {/* Brand SMS push notification slide-down wrapper */}
            <AnimatePresence>
                {showSmsNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -90, scale: 0.95 }}
                        animate={{ opacity: 1, y: 12, scale: 1 }}
                        exit={{ opacity: 0, y: -90, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                        className="absolute left-3 right-3 top-0 z-[10000] bg-zinc-900 text-white rounded-2xl p-3.5 shadow-2xl border border-zinc-700/50 flex flex-col gap-1.5 select-none"
                        id="sms-push-notification-banner"
                    >
                        <div className="flex justify-between items-center text-[11px] font-bold text-zinc-400">
                            <div className="flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="text-sm">💬</span>
                                <span>Messages • Now</span>
                            </div>
                            <span className="bg-amber-400 text-zinc-900 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                                ZIPPI OTP
                            </span>
                        </div>

                        <p className="text-[12px] font-medium leading-normal text-zinc-100">
                            {notificationMsg}
                        </p>

                        <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                                onClick={handleAutofillOtp}
                                className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs text-amber-300 font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                id="otp-autofill-action-btn"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Autofill Code ({simulatedOtp})</span>
                            </button>
                            <button
                                onClick={() => setShowSmsNotification(false)}
                                className="text-zinc-400 hover:text-white px-2 py-1 text-xs font-semibold"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Graphic Banner Area */}
            <div className="pt-10 pb-6 px-6 bg-gradient-to-b from-brand-yellow-light/60 to-white flex flex-col items-center border-b border-gray-100 text-center select-none">
                {/* Rounded mini badge logo */}
                <div className="w-14 h-14 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-md mb-3.5 overflow-hidden">
                    <img src="/logo.jpg" className="w-full h-full object-cover" alt="Zippi Logo" />
                </div>

                <h2 className="text-xl font-black text-brand-charcoal tracking-tight font-sans uppercase">
                    Zippi Grocery
                </h2>
                <p className="text-[11.5px] text-gray-500 font-medium font-sans mt-0.5 max-w-[280px]">
                    Experience the real fast delivery in Sri Lanka. Verification completed via instant OTP SMS.
                </p>

                {/* Sliding Tab Switch (Yellow Background Pill) */}
                {!otpSent && (
                    <div className="bg-zinc-100 p-1 rounded-full flex w-64 max-w-full justify-between items-center mt-6 border border-gray-200">
                        <button
                            onClick={() => handleTabChange('login')}
                            className={`flex-1 text-center py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${activeTab === 'login'
                                    ? 'bg-brand-yellow text-brand-charcoal shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-800'
                                }`}
                            id="tab-select-login"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => handleTabChange('signup')}
                            className={`flex-1 text-center py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${activeTab === 'signup'
                                    ? 'bg-brand-yellow text-brand-charcoal shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-800'
                                }`}
                            id="tab-select-signup"
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>

            {/* Main Form Fields Container */}
            <div className="flex-grow flex flex-col px-6 py-6" id="auth-forms-scroller">
                <AnimatePresence mode="wait">
                    {!otpSent ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: activeTab === 'login' ? -15 : 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: activeTab === 'login' ? 15 : -15 }}
                            transition={{ duration: 0.18 }}
                            className="w-full flex-grow flex flex-col justify-between"
                        >
                            {activeTab === 'login' ? (
                                /* ── LOGIN FORM ── */
                                <form onSubmit={handleSendOtpLogin} className="space-y-5 flex flex-col justify-between flex-grow">
                                    <div className="space-y-4">
                                        <div className="space-y-1 text-left">
                                            <h3 className="font-extrabold text-[#111] text-[15px] font-sans">
                                                Welcome Back!
                                            </h3>
                                            <p className="text-[12px] text-zinc-500">
                                                Enter your registered Sri Lankan phone number to request a secure OTP code.
                                            </p>
                                        </div>

                                        {validationError && (
                                            <div className="bg-red-50/50 border border-red-200 text-brand-red rounded-xl p-3 text-[11px] font-medium flex items-start gap-2 text-left">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>{validationError}</span>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block text-left">
                                                Mobile Phone Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center gap-1.5 pointer-events-none text-zinc-500 text-xs font-black">
                                                    <span className="text-sm select-none">🇱🇰</span>
                                                    <span>+94</span>
                                                    <span className="h-4 w-px bg-zinc-200"></span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    required
                                                    id="login-phone-field"
                                                    placeholder="e.g. 77 123 4567"
                                                    value={loginPhone}
                                                    onChange={(e) => {
                                                        // Only allow digits and spaces
                                                        const sanitized = e.target.value.replace(/[^0-9\s-]/g, '');
                                                        setLoginPhone(sanitized);
                                                    }}
                                                    className="w-full pl-18 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-brand-yellow rounded-xl text-brand-charcoal text-[13.5px] font-semibold outline-none focus:ring-4 focus:ring-brand-yellow/10 transition-all font-sans"
                                                />
                                            </div>
                                            <span className="text-[10px] text-gray-400 block text-left">
                                                We will send a 4-digit verification code to this number.
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-charcoal font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] select-none mt-6"
                                        id="login-submit-btn"
                                    >
                                        <span>Receive OTP Code</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            ) : (
                                /* ── SIGNUP FORM ── */
                                <form onSubmit={handleSendOtpSignup} className="space-y-5 flex flex-col justify-between flex-grow">
                                    <div className="space-y-4">
                                        <div className="space-y-1 text-left">
                                            <h3 className="font-extrabold text-[#111] text-[15px] font-sans">
                                                Let's Create Your Profile
                                            </h3>
                                            <p className="text-[12px] text-zinc-500">
                                                Join Zippi! Verify your mobile number and enjoy super-fast grocery delivery.
                                            </p>
                                        </div>

                                        {validationError && (
                                            <div className="bg-red-50/50 border border-red-200 text-brand-red rounded-xl p-3 text-[11px] font-medium flex items-start gap-2 text-left">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>{validationError}</span>
                                            </div>
                                        )}

                                        {/* Name input */}
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                                                Full Name <span className="text-zinc-400 font-normal">(Required)</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    id="signup-name-field"
                                                    placeholder="Asjath Ahamed"
                                                    value={signupName}
                                                    onChange={(e) => setSignupName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-brand-yellow rounded-xl text-brand-charcoal text-[13.5px] font-semibold outline-none focus:ring-4 focus:ring-brand-yellow/10 transition-all font-sans"
                                                />
                                            </div>
                                        </div>

                                        {/* Mobile input with Sri Lanka code */}
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                                                Mobile Phone Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center gap-1.5 pointer-events-none text-zinc-500 text-xs font-black">
                                                    <span className="text-sm select-none">🇱🇰</span>
                                                    <span>+94</span>
                                                    <span className="h-4 w-px bg-zinc-200"></span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    required
                                                    id="signup-phone-field"
                                                    placeholder="77 123 4567"
                                                    value={signupPhone}
                                                    onChange={(e) => {
                                                        const sanitized = e.target.value.replace(/[^0-9\s-]/g, '');
                                                        setSignupPhone(sanitized);
                                                    }}
                                                    className="w-full pl-18 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-brand-yellow rounded-xl text-brand-charcoal text-[13.5px] font-semibold outline-none focus:ring-4 focus:ring-brand-yellow/10 transition-all font-sans"
                                                />
                                            </div>
                                        </div>

                                        {/* Email Input (Optional) */}
                                        <div className="space-y-1.5 text-left">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">
                                                    Email Address
                                                </label>
                                                <span className="text-[9px] text-zinc-400 font-bold bg-[#E8F0FE] text-brand-blue px-1.5 py-0.5 rounded border border-blue-100 font-sans uppercase">
                                                    Optional
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
                                                <input
                                                    type="email"
                                                    id="signup-email-field"
                                                    placeholder="e.g. name@domain.com"
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-brand-yellow rounded-xl text-brand-charcoal text-[13.5px] font-semibold outline-none focus:ring-4 focus:ring-brand-yellow/10 transition-all font-sans"
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-brand-yellow hover:bg-brand-yellow-hover text-brand-charcoal font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] select-none mt-6"
                                        id="signup-submit-btn"
                                    >
                                        <span>Send Verification OTP</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    ) : (
                        /* ── OTP CODE VERIFICATION SCREEN ── */
                        <motion.div
                            key="otp-screen"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full flex-grow flex flex-col justify-between"
                        >
                            <div className="space-y-5">
                                {/* Back button */}
                                <button
                                    onClick={() => {
                                        setOtpSent(false);
                                        setValidationError('');
                                        setEnteredOtp('');
                                        triggerHapticFeedback('light');
                                    }}
                                    className="flex items-center gap-1.5 text-zinc-400 hover:text-black text-xs font-bold py-1 px-2 -ml-2 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                                    id="otp-back-btn"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Use different mobile number</span>
                                </button>

                                <div className="space-y-2 text-left">
                                    <div className="w-10 h-10 bg-brand-blue-light text-brand-blue rounded-full flex items-center justify-center">
                                        <MessageSquareCode className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-extrabold text-[#111] text-[15px] font-sans">
                                        Verification Code Sent!
                                    </h3>
                                    <p className="text-[12px] text-zinc-500 leading-relaxed font-sans">
                                        We sent a 4-digit code to the mobile number:<br />
                                        <span className="font-extrabold text-brand-charcoal font-mono text-[13px] tracking-wide">
                                            🇱🇰 +94 {tempUserData?.phone.replace(/^(\+94|0)/, '')}
                                        </span>
                                    </p>
                                </div>

                                {otpError && (
                                    <div className="bg-red-50/50 border border-red-200 text-brand-red rounded-xl p-3 text-[11px] font-medium flex items-start gap-2 text-left">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{otpError}</span>
                                    </div>
                                )}

                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block text-left">
                                            4-Digit verification code (OTP)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            required
                                            placeholder="e.g. 1234"
                                            value={enteredOtp}
                                            onChange={(e) => {
                                                const sanitized = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                setEnteredOtp(sanitized);
                                            }}
                                            className="w-full tracking-[12px] text-center text-xl font-extrabold py-3.5 bg-zinc-50 border border-zinc-200 focus:border-brand-blue rounded-2xl text-brand-charcoal outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all font-mono"
                                            id="otp-code-input"
                                        />
                                    </div>

                                    {/* SMS received visual helper inside mock screen */}
                                    <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3 text-[11.5px] text-amber-900 font-medium text-left flex gap-2">
                                        <span className="text-base">💡</span>
                                        <div className="font-sans">
                                            <p className="font-bold">Did not receive SMS?</p>
                                            <p className="text-[10.5px] text-amber-800/85 mt-0.5 leading-relaxed">
                                                Look at the dark notification banner that slides down at the top of the mobile screen. You can tap <span className="font-bold">"Autofill Code"</span> inside it!
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 text-xs">
                                        <span className="text-zinc-400 font-sans font-medium">No SMS? Resend code in:</span>
                                        {otpTimer > 0 ? (
                                            <span className="font-bold text-zinc-800 font-mono">{otpTimer}s</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                className="text-brand-blue hover:underline font-extrabold cursor-pointer"
                                                id="resend-otp-btn"
                                            >
                                                Resend Code
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isVerifying || enteredOtp.length !== 4}
                                        className="w-full bg-brand-blue hover:bg-brand-blue-hover disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] select-none mt-6"
                                        id="verify-otp-submit-btn"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Verifying Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Verify & Continue</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
}
