"use client";

import { useState } from 'react';
import Turnstile from "react-turnstile";

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
            <h3 className="text-lg font-semibold mb-2 text-white">{card.description}</h3>
            <div className="mb-3 flex flex-wrap gap-2">
                {card.tech_tags?.map((tag: string) => (
                    // Tag styling
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
                            // Reveal button styling
                            <button
                                onClick={handleRevealClick}
                                className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded disabled:opacity-50 transition-colors"
                                disabled={isVerifying}
                            >
                                Reveal Contact
                            </button>
                        )}
                        {showCaptcha && (
                            <div className="mt-2">
                                <Turnstile
                                    sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                                    onVerify={verifyTurnstileToken}
                                    onError={() => { /* ... */ }}
                                    onExpire={() => { /* ... */ }}
                                    theme="dark"
                                />
                                {isVerifying && <p className="text-xs text-gray-500 mt-1">Verifying...</p>}
                            </div>
                        )}
                        {captchaError && <p className="text-red-500 text-xs mt-1">{captchaError}</p>}
                    </>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Posted: {card.formatted_created_at}
            </p>
        </div>
    );
}