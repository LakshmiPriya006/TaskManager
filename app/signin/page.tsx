"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';


export default function Signin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/signin", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                router.push('/boards/workspace'); // 👈 REDIRECT HERE
            } else {
                alert(data.error || "Sign in failed");
            }

        } catch (error) {
            console.error("Error during sign in:", error);
            alert("An unexpected error occurred."); 
        }
    };


    return <div className="h-screen flex justify-center flex-col bg-[#1976ad]">
        <div className="flex justify-center mb-6">
            <img src = "https://res.cloudinary.com/ds9pcviv3/image/upload/v1747804978/Screenshot_2025-05-21_105208_yslgta.png"/>
        </div>
        <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="block max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 ">
                <div>
                    <div className="px-18">
                        <div className="text-2xl font-extrabold">
                            Sign in
                        </div>
                    </div>
                    <div className="pt-2">
                        <LabelledInput
                            label="USEREMAIL"
                            placeholder="harkirat@gmail.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        <LabelledInput
                            label="PASSWORD"
                            placeholder="123456"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label className="flex items-center space-x-2 text-sm pt-2">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            <span>Show Password</span>
                        </label>
                        <button type="submit" className="mt-8 w-full text-white bg-[#1976ad] focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">Sign in</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    type?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function LabelledInput({ label, placeholder, type, value, onChange }: LabelledInputType) {
    return <div>
        <label className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
        <input
                type={type || "text"}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
    </div>
}