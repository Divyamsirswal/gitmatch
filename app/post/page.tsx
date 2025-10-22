"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { findMatches } from './action';

export type Card = {
    id?: string;
    created_at?: string;
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    website?: string;
    formatted_created_at?: string;
};


export default function PostGoal() {
    const router = useRouter()
    const [formData, setFormData] = useState<Omit<Card, 'id' | 'created_at' | 'formatted_created_at'>>({
        goal_type: "BUILD",
        tech_tags: [],
        description: "",
        skill_level: "BEGINNER",
        vibe: "CASUAL",
        contact_handle: "",
        contact_method: "DISCORD",
        website: "",
    })
    const [techTagInput, setTechTagInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleAddTag = () => {
        setError(null);
        if (techTagInput && formData.tech_tags.length < 5 && !formData.tech_tags.includes(techTagInput.trim().toLowerCase())) {
            const newTag = techTagInput.trim().toLowerCase();
            if (newTag) {
                setFormData((prev) => ({
                    ...prev,
                    tech_tags: [...prev.tech_tags, newTag],
                }));
                setTechTagInput("");
            } else {
                setError("Tag cannot be empty.");
            }
        } else if (formData.tech_tags.length >= 5) {
            setError("Maximum of 5 tags allowed.");
        } else if (!techTagInput) {
            setError("Tag cannot be empty.");
        } else if (formData.tech_tags.includes(techTagInput.trim().toLowerCase())) {
            setError("Tag already added.");
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tech_tags: prev.tech_tags.filter(tag => tag !== tagToRemove),
        }));
        setError(null);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.website) {
            console.warn("Honeypot filled.");
            return;
        }
        if (formData.tech_tags.length === 0 || formData.tech_tags.length > 5) {
            setError("Please use between 1 and 5 tech tags.");
            return;
        }

        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const cardToInsert = {
            goal_type: formData.goal_type,
            tech_tags: formData.tech_tags,
            description: formData.description.trim(),
            skill_level: formData.skill_level,
            vibe: formData.vibe,
            contact_handle: formData.contact_handle.trim(),
            contact_method: formData.contact_method,
        };

        const { data: insertedData, error: insertError } = await supabase
            .from("cards")
            .insert([cardToInsert])
            .select()
            .single();


        if (insertError || !insertedData) {
            setIsLoading(false);
            console.error(insertError);
            setError(`Error posting goal: ${insertError?.message || 'Unknown error'}`);
            return;
        }

        try {
            const matches = await findMatches(cardToInsert);
            const matchIds = matches.map(m => m.id);
            const queryParams = new URLSearchParams({ matches: JSON.stringify(matchIds) });
            router.push(`/success?${queryParams.toString()}`);

        } catch (matchError) {
            setIsLoading(false);
            console.error("Error finding matches:", matchError);
            setError("Goal posted, but failed to find matches. Check the homepage.");
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid #555',
        background: '#333',
        color: 'white',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '5px',
    };

    const selectStyle: React.CSSProperties = { ...inputStyle };
    const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '80px', resize: 'vertical' };
    const buttonStyle: React.CSSProperties = {
        padding: '10px 15px',
        borderRadius: '5px',
        border: 'none',
        background: '#0070f3',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1em',
        marginTop: '10px',
    };
    const tagContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginTop: '8px',
    };

    const tagStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        background: '#0070f3',
        color: 'white',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '0.85em',
        cursor: 'default',
    };

    const removeTagButtonStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        color: 'white',
        marginLeft: '5px',
        cursor: 'pointer',
        padding: '0',
        fontSize: '1em',
        lineHeight: '1',
    };

    const honeypotStyle: React.CSSProperties = {
        position: 'absolute',
        left: '-5000px',
        top: '-5000px',
        opacity: 0,
        pointerEvents: 'none',
    };


    return (
        <div style={{ maxWidth: "600px", margin: "40px auto", padding: "30px", background: "#222", borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
            <h1 style={{ textAlign: 'center', marginBottom: '25px' }}>Post a New Goal</h1>
            <p style={{ textAlign: 'center', color: '#aaa', marginTop: '-15px', marginBottom: '30px' }}>Your goal will be live for 14 days.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                <label>
                    Your Goal:
                    <select name="goal_type" value={formData.goal_type} onChange={handleChange} style={selectStyle} required>
                        <option value="BUILD">Build a Project</option>
                        <option value="LEARN">Learn a Skill</option>
                        <option value="SOLVE">Solve Problems (e.g., LeetCode)</option>
                    </select>
                </label>

                <label>
                    Description (Be specific! Max 150 chars):
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="e.g., Build a fast API in Rust with Axum for a portfolio piece"
                        required
                        maxLength={150}
                        style={textareaStyle}
                    />
                </label>

                <label>
                    Tech Tags (Max 5, press Enter or click Add):
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={techTagInput}
                            onChange={(e) => { setTechTagInput(e.target.value); setError(null); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            placeholder="e.g., rust"
                            style={{ ...inputStyle, flexGrow: 1 }}
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            style={{ padding: '8px 15px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', flexShrink: 0 }}
                        >Add</button>
                    </div>
                    <div style={tagContainerStyle}>
                        {formData.tech_tags.map((tag) => (
                            <span key={tag} style={tagStyle}>
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    style={removeTagButtonStyle}
                                    aria-label={`Remove ${tag} tag`}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </label>

                <label>
                    Your Skill Level (for this tech):
                    <select name="skill_level" value={formData.skill_level} onChange={handleChange} style={selectStyle} required>
                        <option value="BEGINNER">Beginner (Just starting)</option>
                        <option value="INTERMEDIATE">Intermediate (Know the basics)</option>
                        <option value="ADVANCED">Advanced (Experienced)</option>
                    </select>
                </label>

                <label>
                    Your Vibe:
                    <select name="vibe" value={formData.vibe} onChange={handleChange} style={selectStyle} required>
                        <option value="CASUAL">Casual (1-2 check-ins/week)</option>
                        <option value="FOCUSED">Focused (Meet 2-3 times/week)</option>
                        <option value="INTENSE">Intense (Daily grind)</option>
                    </select>
                </label>

                <label>
                    Contact Method:
                    <select name="contact_method" value={formData.contact_method} onChange={handleChange} style={selectStyle} required>
                        <option value="DISCORD">Discord</option>
                        <option value="TELEGRAM">Telegram</option>
                        <option value="LINKEDIN">LinkedIn</option>
                    </select>
                </label>

                <label>
                    Your Contact Handle:
                    <input
                        type="text"
                        name="contact_handle"
                        value={formData.contact_handle}
                        onChange={handleChange}
                        placeholder="e.g., myusername#1234 or your LinkedIn profile URL"
                        required
                        style={inputStyle}
                    />
                </label>

                <div style={honeypotStyle} aria-hidden="true">
                    <label htmlFor="honeypot-website">Do not fill this out if you are human:</label>
                    <input
                        type="text"
                        id="honeypot-website"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </div>

                {error && <p style={{ color: "#ff4d4d", textAlign: 'center', marginTop: '-10px' }}>{error}</p>}

                <button type="submit" disabled={isLoading} style={{ ...buttonStyle, opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? "Posting..." : "Post Your Goal"}
                </button>

            </form>
        </div>
    )
}