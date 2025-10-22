"use client";

import { useState } from 'react';

type CardProps = {
    card: {
        id: string;
        formatted_created_at: string;
        // created_at: string;
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

    const handleRevealContact = () => {
        setIsContactVisible(true);
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
                    <button onClick={handleRevealContact} style={revealButtonStyle}>
                        Reveal Contact
                    </button>
                )}
            </div>
            <p style={{ margin: '5px 0', fontSize: '0.8em', color: '#888' }}>
                Posted: {card.formatted_created_at}
            </p>
        </div>
    );
}