"use client";

import { updateSettings, changePassword, deleteAccount } from "@/app/actions/settings";
import { useState } from "react";
import { Moon, Bell, Shield, LogOut, Eye, EyeOff } from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./page.module.css";

// Define a local interface to avoid Prisma type issues if generation failed
interface SettingsUser {
    settingsTheme: string;
    settingsNotifications: boolean;
}

export default function SettingsForm({ user }: { user: any }) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    async function handleUpdateSettings(formData: FormData) {
        setIsLoading(true);
        setMessage(null);
        const res = await updateSettings(formData);
        setIsLoading(false);

        if (res?.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Настройки сохранены" });
        }
    }

    async function handleChangePassword(formData: FormData) {
        setIsLoading(true);
        setMessage(null);
        const res = await changePassword(formData);
        setIsLoading(false);

        if (res?.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: "Пароль успешно изменен" });
            // Clear form
            (document.getElementById('passwordForm') as HTMLFormElement).reset();
        }
    }

    async function handleDeleteAccount() {
        if (confirm("Вы уверены? Это действие нельзя отменить. Все ваши данные будут удалены.")) {
            await deleteAccount();
        }
    }

    return (
        <div>
            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Appearance & Notifications */}
            <form action={handleUpdateSettings} className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Moon size={20} />
                    Внешний вид
                </div>

                <div className={styles.row}>
                    <span className={styles.label}>Тема оформления</span>
                    <select
                        name="theme"
                        className={styles.select}
                        defaultValue={user.settingsTheme || "system"}
                        onChange={(e) => e.target.form?.requestSubmit()}
                    >
                        <option value="system">Системная</option>
                        <option value="light">Светлая</option>
                        <option value="dark">Темная</option>
                    </select>
                </div>

                <div className={styles.sectionTitle} style={{ marginTop: 24 }}>
                    <Bell size={20} />
                    Уведомления
                </div>

                <div className={styles.row}>
                    <span className={styles.label}>Получать уведомления</span>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            name="notifications"
                            defaultChecked={user.settingsNotifications}
                            onChange={(e) => e.target.form?.requestSubmit()}
                        />
                        <span className={styles.slider}></span>
                    </label>
                </div>
            </form>

            {/* Security */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Shield size={20} />
                    Безопасность
                </div>

                <form id="passwordForm" action={handleChangePassword}>
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            placeholder="Текущий пароль"
                            className={`${styles.input} ${styles.inputPassword}`}
                            required
                        />
                        <button
                            type="button"
                            className={styles.showPasswordButton}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            tabIndex={-1}
                        >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    
                    <div className={styles.passwordWrapper}>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            placeholder="Новый пароль"
                            className={`${styles.input} ${styles.inputPassword}`}
                            required
                        />
                        <button
                            type="button"
                            className={styles.showPasswordButton}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            tabIndex={-1}
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    
                    <button type="submit" className={`${styles.button} ${styles.saveBtn}`} disabled={isLoading}>
                        {isLoading ? "Сохранение..." : "Сменить пароль"}
                    </button>
                </form>
            </div>

            {/* Account Actions */}
            <div className={styles.section} style={{ border: '1px solid rgba(231, 76, 60, 0.3)' }}>
                <div className={styles.sectionTitle} style={{ color: '#e74c3c' }}>
                    <LogOut size={20} />
                    Аккаунт
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={`${styles.button}`}
                    style={{ background: 'var(--surface-highlight)', color: 'var(--text-primary)', marginBottom: '12px' }}
                >
                    Выйти из аккаунта
                </button>

                <button
                    onClick={handleDeleteAccount}
                    className={`${styles.button} ${styles.dangerBtn}`}
                >
                    Удалить аккаунт
                </button>
            </div>
        </div>
    );
}
