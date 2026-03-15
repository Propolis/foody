"use client";

import { registerUser } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import styles from "../login/page.module.css"; // Reuse login styles

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // Состояния для полей
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        setError(null);
        const res = await registerUser(formData);
        setIsPending(false);
        if (res?.error) {
            setError(res.error);
        } else {
            router.push("/profile");
            router.refresh();
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Регистрация</h1>
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(new FormData(e.currentTarget));
                    }} 
                    className={styles.form}
                >
                    <div className={styles.field}>
                        <label htmlFor="name">Имя</label>
                        <input
                            className={styles.input}
                            id="name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ваше имя"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            className={styles.input}
                            id="email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Пароль</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                className={`${styles.input} ${styles.inputPassword}`}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className={styles.showPasswordButton}
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}
                    <button 
                        className={styles.button} 
                        type="submit" 
                        disabled={isPending}
                    >
                        {isPending ? "Регистрация..." : "Зарегистрироваться"}
                    </button>
                </form>
                <p className={styles.footer}>
                    Уже есть аккаунт? <Link href="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
}
