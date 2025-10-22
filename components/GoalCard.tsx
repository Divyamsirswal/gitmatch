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

    const cardStyle: React.CSSProperties = {
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        background: '#222',
    };

    const tagStyle: React.CSSProperties = {
        display: 'inline-block',
        background: '#0070f3',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '4px',
        marginRight: '5px',
        fontSize: '0.8em',
        textTransform: 'lowercase',
    };

    const revealButtonStyle: React.CSSProperties = {
        background: '#555',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9em',
    };

    const captchaContainerStyle: React.CSSProperties = { marginTop: '10px' };

    return (
        <div key={card.id} style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{card.description}</h3>
            <div style={{ marginBottom: '10px' }}>
                {card.tech_tags?.map((tag: string) => (
                    <span key={tag} style={tagStyle}>{tag}</span>
                ))}
            </div>
            <p style={{ margin: '5px 0', fontSize: '0.9em' }}>
                <span style={{ fontWeight: 'bold' }}>Level:</span> {card.skill_level} |
                <span style={{ fontWeight: 'bold' }}> Vibe:</span> {card.vibe} |
                <span style={{ fontWeight: 'bold' }}> Goal:</span> {card.goal_type}
            </p>
            <div style={{ margin: '10px 0 5px 0', fontSize: '0.9em', color: '#aaa' }}>
                <span style={{ fontWeight: 'bold' }}>Contact:</span> {card.contact_method} @{' '}
                {isContactVisible ? (
                    <span>{card.contact_handle}</span>
                ) : (
                    <>
                        {!showCaptcha && (
                            <button onClick={handleRevealClick} style={revealButtonStyle} disabled={isVerifying}>
                                Reveal Contact
                            </button>
                        )}

                        {showCaptcha && (
                            <div style={captchaContainerStyle}>
                                <Turnstile
                                    sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                                    onVerify={verifyTurnstileToken}
                                    onError={() => {
                                        setCaptchaError("CAPTCHA challenge failed to load. Please refresh.");
                                        setShowCaptcha(false);
                                    }}
                                    onExpire={() => {
                                        setCaptchaError("CAPTCHA challenge expired. Please click Reveal again.");
                                        setShowCaptcha(false);
                                    }}
                                    theme="dark"
                                />
                                {isVerifying && <p style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>Verifying...</p>}
                            </div>
                        )}
                        {captchaError && <p style={{ color: "#ff4d4d", fontSize: '0.8em', marginTop: '5px' }}>{captchaError}</p>}
                    </>
                )}
            </div>
            <p style={{ margin: '5px 0', fontSize: '0.8em', color: '#888' }}>
                Posted: {card.formatted_created_at}
            </p>
        </div>
    );
}