"use client";

import { useState } from 'react';
import Turnstile from "react-turnstile";
import Link from 'next/link';
import toast from 'react-hot-toast';
import { deleteCard } from '@/app/actions';
import UserAvatar from './UserAvatar';
import CardDetails from './CardDetails';

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

    const isOwner = card.user_id === currentUserId;

    const handleRevealClick = () => {
        setShowCaptcha(true);
    };

    const verifyTurnstileToken = async (token: string | null) => {
        if (!token) {
            toast.error("CAPTCHA challenge failed. Please try again.");
            setShowCaptcha(false);
            return;
        }
        setIsVerifying(true);
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
        if (!window.confirm("Are you sure you want to delete this goal card? This action cannot be undone.")) { return; }
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
            console.error("Delete error:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isHidden) { return null; }

    return (
        <div className="group bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-gray-200 relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">

            <div className="p-4 flex gap-4 items-start">
                <UserAvatar userId={card.user_id} />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white wrap-break-word">
                        {card.description}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {card.tech_tags?.map((tag: string) => (
                            <span key={tag} className="bg-gray-700 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full lowercase">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                        href={`/edit/${card.id}`}
                        className="p-1.5 bg-gray-700 hover:bg-yellow-600 text-white rounded-md transition-colors"
                        aria-label="Edit Card" title="Edit Card"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                    </Link>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 bg-gray-700 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors"
                        aria-label="Delete Card" title="Delete Card"
                    >
                        {isDeleting ?
                            (<svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>)
                            :
                            (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>)
                        }
                    </button>
                </div>
            )}

            <div className="px-4">
                <CardDetails
                    goal={card.goal_type}
                    level={card.skill_level}
                    vibe={card.vibe}
                />
            </div>

            <div className="p-4 flex justify-between items-center text-sm text-gray-400">
                <p className="text-xs">
                    Posted: {card.formatted_created_at}
                </p>

                <div className="text-right">
                    <span className="font-medium text-gray-300 capitalize">{card.contact_method.toLowerCase()} @ </span>

                    {isContactVisible ? (
                        <span className="text-gray-100 break-all text-xs sm:text-sm">{card.contact_handle}</span>
                    ) : (
                        <>
                            {!showCaptcha && (
                                <button
                                    onClick={handleRevealClick}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors"
                                    disabled={isVerifying}
                                >
                                    Reveal Contact
                                </button>
                            )}
                            {showCaptcha && (
                                <div className="relative inline-block w-auto min-w-[150px] min-h-[50px]">
                                    {isVerifying ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-700 rounded-md text-white text-sm">
                                            <svg className="animate-spin h-4 w-4 mr-2 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Verifying...
                                        </div>
                                    ) : (
                                        <Turnstile
                                            sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                                            onVerify={verifyTurnstileToken}
                                            onError={() => { toast.error("CAPTCHA failed. Please refresh."); setShowCaptcha(false); }}
                                            onExpire={() => { toast.error("CAPTCHA expired. Please click Reveal again."); setShowCaptcha(false); }}
                                            theme="dark"
                                            size="compact"
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}