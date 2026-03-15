import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EditProfileForm from "./EditProfileForm";
import styles from "./page.module.css";

export default async function EditProfilePage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/login");
    }

    // Используем данные из сессии, так как на бэкенде пока нет эндпоинта /users/me/
    const user = {
        id: (session.user as any).id || session.user.email,
        name: session.user.name || "",
        email: session.user.email,
        image: session.user.image || "",
        bio: "" // В сессии нет био
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Редактировать профиль</h1>
                <EditProfileForm user={user as any} />
            </div>
        </div>
    );
}
