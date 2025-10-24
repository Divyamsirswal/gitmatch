"use client";

import { useState } from 'react';
import Turnstile from "react-turnstile";
import Link from 'next/link';
import toast from 'react-hot-toast';
import { deleteCard } from '@/app/actions';

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
        user_id: string;
    };
    currentUserId?: string;
};

export default function GoalCard({ card, currentUserId }: CardProps) {
    const [isContactVisible, setIsContactVisible] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [captchaError, setCaptchaError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const isOwner = card.user_id === currentUserId;

    const handleRevealClick = () => {
        setShowCaptcha(true);
        setCaptchaError(null);
    };

    const verifyTurnstileToken = async (token: string | null) => {
        if (!token) {
            toast.error("CAPTCHA challenge failed. Please try again.");
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
                toast.error(result.message || "Verification failed. Please try again.");
                setShowCaptcha(false);
            }
        } catch (error) {
            console.error("Error calling verification API:", error);
            toast.error("An error occurred during verification. Please try again.");
            setShowCaptcha(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDelete = async () => {
        if (!isOwner) return;
        if (!window.confirm("Are you sure you want to delete this goal card? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        const toastId = toast.loading('Deleting card...');

        try {
            const result = await deleteCard(card.id);
            toast.dismiss(toastId);

            if (result.success) {
                toast.success("Card deleted successfully!");
                setIsHidden(true);
            } else {
                toast.error(`Failed to delete card: ${result.error || 'Unknown error'}`);
            }
        } catch (err) {
            toast.dismiss(toastId);
            let errorMessage = "An unexpected error occurred during deletion.";
            if (err instanceof Error) errorMessage = err.message;
            toast.error(errorMessage);
            console.error("Delete action error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isHidden) {
        return null;
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md text-gray-200 relative">
            {isOwner && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Link
                        href={`/edit/${card.id}`}
                        className="p-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                        aria-label="Edit Card"
                        title="Edit Card"
                    >
                        ✏️
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 transition-colors"
                        aria-label="Delete Card"
                        title="Delete Card"
                    >
                        {isDeleting ? '⏳' : '🗑️'}
                    </button>
                </div>
            )}

            <h3 className="text-lg font-semibold mb-2 text-white wrap-break-word pr-16">{card.description}</h3>
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
                    <span className="text-gray-100 break-all">{card.contact_handle}</span>
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
                                    onError={() => { toast.error("CAPTCHA challenge failed to load. Please refresh."); setShowCaptcha(false); }}
                                    onExpire={() => { toast.error("CAPTCHA challenge expired. Please click Reveal again."); setShowCaptcha(false); }}
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
                    </>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Posted: {card.formatted_created_at}
            </p>
        </div>
    );
}