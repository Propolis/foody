"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./Header.module.css";

const Header = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Foody
                </Link>

                {!isAuthenticated && status !== "loading" && (
                    <Link href="/login" className={styles.loginLink}>
                        Войти
                    </Link>
                )}
                
                {isAuthenticated && (
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session?.user?.name || session?.user?.email}</span>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
