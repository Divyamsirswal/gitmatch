"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { findMatches } from './action';
import toast from 'react-hot-toast';

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
    email?: string;
    website?: string;
    formatted_created_at?: string;
};

export default function PostGoal() {
    const router = useRouter();
    const [formData, setFormData] = useState<Omit<Card, 'id' | 'created_at' | 'formatted_created_at'>>({
        goal_type: "BUILD",
        tech_tags: [],
        description: "",
        skill_level: "BEGINNER",
        vibe: "CASUAL",
        contact_handle: "",
        contact_method: "DISCORD",
        email: "",
        website: "",
    });
    const [techTagInput, setTechTagInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddTag = () => {
        setError(null);
        if (techTagInput && formData.tech_tags.length < 5 && !formData.tech_tags.includes(techTagInput.trim().toLowerCase())) {
            const newTag = techTagInput.trim().toLowerCase();
            if (newTag) {
                setFormData((prev) => ({ ...prev, tech_tags: [...prev.tech_tags, newTag] }));
                setTechTagInput("");
            } else { setError("Tag cannot be empty."); }
        } else if (formData.tech_tags.length >= 5) { setError("Maximum of 5 tags allowed."); }
        else if (!techTagInput) { setError("Tag cannot be empty."); }
        else if (formData.tech_tags.includes(techTagInput.trim().toLowerCase())) { setError("Tag already added."); }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev) => ({ ...prev, tech_tags: prev.tech_tags.filter(tag => tag !== tagToRemove) }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.website) { console.warn("Honeypot filled."); router.push('/'); return; }
        if (formData.tech_tags.length === 0 || formData.tech_tags.length > 5) { setError("Please use between 1 and 5 tech tags."); return; }

        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        const cardToInsert = {
            goal_type: formData.goal_type, tech_tags: formData.tech_tags, description: formData.description.trim(),
            skill_level: formData.skill_level, vibe: formData.vibe, contact_handle: formData.contact_handle.trim(),
            contact_method: formData.contact_method, email: formData.email?.trim() || undefined,
        };

        const { data: insertedData, error: insertError } = await supabase
            .from("cards").insert([cardToInsert]).select().single();

        if (insertError || !insertedData) {
            toast.error(`Error posting goal: ${insertError?.message || 'Unknown error'}`); 
            setIsLoading(false); console.error("Insert Error:", insertError);
            setError(`Error posting goal: ${insertError?.message || 'Unknown error during insert'}`); return;
        }

        try {
            const matches = await findMatches(cardToInsert);
            const matchIds = matches.map(m => m.id);
            const queryParams = new URLSearchParams({ matches: JSON.stringify(matchIds) });
            router.push(`/success?${queryParams.toString()}`);
            toast.success('Goal posted successfully!');
        } catch (matchError) {
            toast.error("Goal posted, but failed to find matches.");
            setIsLoading(false); console.error("Error finding matches:", matchError);
            setError("Goal posted, but failed to find matches. Check the homepage."); router.push("/");
        }
    };

    const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white";
    const labelClasses = "block text-sm font-medium text-gray-300";

    return (
        <div className="max-w-xl mx-auto p-6 md:p-8 bg-gray-800 rounded-lg shadow-xl mt-10 border border-gray-700">
            <h1 className="text-2xl font-semibold text-center text-white mb-2">Post a New Goal</h1>
            <p className="text-center text-gray-400 text-sm mb-6">Your goal will be live for 14 days.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="goal_type" className={labelClasses}>Your Goal:</label>
                    <select id="goal_type" name="goal_type" value={formData.goal_type} onChange={handleChange} className={inputBaseClasses} required>
                        <option value="BUILD">Build a Project</option><option value="LEARN">Learn a Skill</option><option value="SOLVE">Solve Problems (e.g., LeetCode)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className={labelClasses}>Description (Be specific! Max 150 chars):</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="e.g., Build a fast API in Rust with Axum for a portfolio piece" required maxLength={150} className={`${inputBaseClasses} min-h-[80px] resize-y`} />
                </div>
                <div>
                    <label htmlFor="tech-input" className={labelClasses}>Tech Tags (Max 5, press Enter or click Add):</label>
                    <div className="flex items-center gap-2 mt-1">
                        <input id="tech-input" type="text" value={techTagInput} onChange={(e) => { setTechTagInput(e.target.value); setError(null); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="e.g., rust" className={`${inputBaseClasses} grow`} />
                        <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md transition-colors shrink-0">Add</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {formData.tech_tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-blue-200 hover:bg-blue-700 hover:text-white focus:outline-none focus:bg-blue-700 focus:text-white" aria-label={`Remove ${tag} tag`}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="skill_level" className={labelClasses}>Your Skill Level (for this tech):</label>
                    <select id="skill_level" name="skill_level" value={formData.skill_level} onChange={handleChange} className={inputBaseClasses} required>
                        <option value="BEGINNER">Beginner (Just starting)</option><option value="INTERMEDIATE">Intermediate (Know the basics)</option><option value="ADVANCED">Advanced (Experienced)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="vibe" className={labelClasses}>Your Vibe:</label>
                    <select id="vibe" name="vibe" value={formData.vibe} onChange={handleChange} className={inputBaseClasses} required>
                        <option value="CASUAL">Casual (1-2 check-ins/week)</option><option value="FOCUSED">Focused (Meet 2-3 times/week)</option><option value="INTENSE">Intense (Daily grind)</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="contact_method" className={labelClasses}>Contact Method:</label>
                    <select id="contact_method" name="contact_method" value={formData.contact_method} onChange={handleChange} className={inputBaseClasses} required>
                        <option value="DISCORD">Discord</option><option value="TELEGRAM">Telegram</option><option value="LINKEDIN">LinkedIn</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="contact_handle" className={labelClasses}>Your Contact Handle:</label>
                    <input id="contact_handle" type="text" name="contact_handle" value={formData.contact_handle} onChange={handleChange} placeholder="e.g., myusername#1234 or your LinkedIn profile URL" required className={inputBaseClasses} />
                </div>
                <div>
                    <label htmlFor="email" className={labelClasses}>Email (Optional):<span className="text-xs text-gray-400 ml-1">- Get a reminder before your card expires. Never shared publicly.</span></label>
                    <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputBaseClasses} />
                </div>
                <div className="absolute left-[-5000px]" aria-hidden="true">
                    <label htmlFor="honeypot-website">Do not fill this out if you are human:</label>
                    <input type="text" id="honeypot-website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
                </div>
                {error && (
                    <p className="text-red-500 text-sm text-center bg-red-100 border border-red-300 p-2 rounded-md -mt-2 mb-4">
                        {error}
                    </p>
                )}
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-70 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800">
                    {isLoading ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Posting...</>
                    ) : ("Post Your Goal")}
                </button>
            </form>
        </div>
    )
}