import { UserRole } from "@/lib/types";
import { Lock, Package } from "lucide-react";
import React, { useState } from "react";

interface LoginProps {
    onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === "admin" && password === "4466") {
            onLogin("admin");
        } else if (username === "visitor" && password === "7595") {
            onLogin("visitor");
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="min-h-screen bg-[#800000] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-orange-500 p-8 text-center">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Package className="text-[#800000]" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest">
                        ABS FEED
                    </h1>
                    <p className="text-orange-100 text-xs font-bold mt-1">
                        PRODUCTION MANAGEMENT SYSTEM
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-stone-500 uppercase tracking-widest">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 focus:border-[#800000] outline-none transition-colors"
                            placeholder="admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-stone-500 uppercase tracking-widest">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full border-2 border-stone-100 rounded-xl px-4 py-3 focus:border-[#800000] outline-none transition-colors"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-[#800000] hover:bg-[#a00000] text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Lock size={20} />
                        LOGIN TO SYSTEM
                    </button>
                </form>

                <div className="p-4 bg-stone-50 text-center text-[10px] text-stone-400 font-bold">
                    &copy; 2025 ABS FEED INDUSTRIES LTD. | ALL RIGHTS RESERVED
                </div>
            </div>
        </div>
    );
};
