import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";
import styles from "./page.module.css";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    // Используем данные из сессии, так как на бэкенде пока нет эндпоинта /users/me/
    const user = {
        id: (session.user as any).id || session.user.email,
        name: session.user.name || "",
        email: session.user.email,
        image: session.user.image || ""
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Настройки</h1>
            <SettingsForm user={user as any} />
        </div>
    );
}
