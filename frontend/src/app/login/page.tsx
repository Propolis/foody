"use client";

import { authenticate } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import styles from "./page.module.css";

export default function LoginPage() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    
    // Используем состояние для сохранения значений при ошибке
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const error = await authenticate(undefined, formData);
            if (error) {
                setErrorMessage(error);
            }
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Вход в Foody</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
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
                    {errorMessage && (
                        <div className={styles.error}>{errorMessage}</div>
                    )}
                    <button className={styles.button} disabled={isPending} type="submit">
                        {isPending ? "Вход..." : "Войти"}
                    </button>
                </form>
                <p className={styles.footer}>
                    Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}
