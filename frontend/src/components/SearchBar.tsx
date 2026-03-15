"use client";

import { Search } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = "Поиск еды..." }: SearchBarProps) => {
    return (
        <div className={styles.container}>
            <Search className={styles.icon} size={20} />
            <input
                type="text"
                className={styles.input}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

export default SearchBar;
