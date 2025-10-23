"use client";

import { useState } from 'react';
import Turnstile from "react-turnstile";
import toast from 'react-hot-toast';

type CardProps = {
    card: {
        id: string;
        formatted_created_at: string;
        goal_type: string;
        tech_tags: string[];
        description: string;
        skill_level: string;
        vibe: string;
        contact_handle: string;
        contact_method: string;
    };
};

export default function GoalCard({ card }: CardProps) {
    const [isContactVisible, setIsContactVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaError, setCaptchaError] = useState<string | null>(null);

    const handleRevealClick = () => {
        setShowCaptcha(true);
        setCaptchaError(null);
    };

    const verifyTurnstileToken = async (token: string | null) => {
        if (!token) {
            setCaptchaError("CAPTCHA challenge failed. Please try again.");
            setShowCaptcha(false);
            toast.error("CAPTCHA challenge failed. Please try again.");
            return;
        }

        setIsVerifying(true);
        setCaptchaError(null);

        try {
            const response = await fetch('/api/verify-turnstile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const result = await response.json();

            if (result.success) {
                setIsContactVisible(true);
                setShowCaptcha(false);
            } else {
                setCaptchaError(result.message || "Verification failed. Please try again.");
                setShowCaptcha(false);
                toast.error(result.message || "Verification failed. Please try again.");
            }
        } catch (error) {
            console.error("Error calling verification API:", error);
            setCaptchaError("An error occurred during verification. Please try again.");
            setShowCaptcha(false);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div key={card.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md text-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-white wrap-break-words">{card.description}</h3>
            <div className="mb-3 flex flex-wrap gap-2">
                {card.tech_tags?.map((tag: string) => (
                    <span key={tag} className="bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full lowercase">
                        {tag}
                    </span>
                ))}
            </div>
            <p className="text-sm text-gray-400 mb-1">
                <span className="font-medium text-gray-300">Level:</span> {card.skill_level} |
                <span className="font-medium text-gray-300"> Vibe:</span> {card.vibe} |
                <span className="font-medium text-gray-300"> Goal:</span> {card.goal_type}
            </p>
            <div className="text-sm text-gray-400 my-2">
                <span className="font-medium text-gray-300">Contact:</span> {card.contact_method} @{' '}
                {isContactVisible ? (
                    <span className="text-gray-100">{card.contact_handle}</span>
                ) : (
                    <>
                        {!showCaptcha && (
                            <button
                                onClick={handleRevealClick}
                                className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded disabled:opacity-50 transition-colors"
                                disabled={isVerifying}
                            >
                                Reveal Contact
                            </button>
                        )}
                        {showCaptcha && (
                            <div className="mt-2 relative">
                                <Turnstile
                                    sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                                    onVerify={verifyTurnstileToken}
                                    onError={() => { setCaptchaError("CAPTCHA challenge failed to load. Please refresh."); setShowCaptcha(false); }}
                                    onExpire={() => { setCaptchaError("CAPTCHA challenge expired. Please click Reveal again."); setShowCaptcha(false); }}
                                    theme="dark"
                                />
                                {isVerifying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded">
                                        <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="ml-2 text-xs text-gray-400">Verifying...</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {captchaError && (
                            <p className="text-red-500 text-xs mt-1 bg-red-100 border border-red-300 p-1 rounded">
                                {captchaError}
                            </p>
                        )}
                    </>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Posted: {card.formatted_created_at}
            </p>
        </div>
    );
}