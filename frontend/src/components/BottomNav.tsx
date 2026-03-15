"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Search, Heart, User } from "lucide-react";
import styles from "./BottomNav.module.css";

const BottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Главная", path: "/" },
        { icon: Search, label: "Поиск", path: "/search" },
        { icon: Heart, label: "Избранное", path: "/favorites" },
        { icon: User, label: "Профиль", path: "/profile" },
    ];

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.item} ${isActive ? styles.active : ""}`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
