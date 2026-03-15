"use client";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Tabs.module.css";

interface TabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange?: (tab: string) => void; // Optional for backward compatibility if needed
}

const Tabs = ({ tabs, activeTab }: TabsProps) => {
    const router = useRouter();

    const handleTabClick = (tab: string) => {
        router.push(`/?tab=${tab}`);
    };

    return (
        <div className={styles.container}>
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.active : ""}`}
                    onClick={() => handleTabClick(tab)}
                >
                    {tab}
                    {activeTab === tab && <div className={styles.indicator} />}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
