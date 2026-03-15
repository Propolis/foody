import { auth } from "@/auth";
import FeedItem from "@/components/FeedItem";
import Tabs from "@/components/Tabs";
import { getSearchPosts } from "@/app/actions/post";

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab = tab || "Рекомендации";
  const tabs = ["Новое", "Подписки", "Рекомендации"];

  const session = await auth() as any;
  const accessToken = session?.user?.accessToken;

  const posts = await getSearchPosts(undefined, undefined, accessToken);

  const dishes = posts.map((dish: any) => {
    return {
      dish,
      isLiked: dish.isLiked, // mapDjangoPostToDish ставит это поле
      isSubscribed: false,
      communityRating: dish.userRating
    }
  });

  return (
    <div style={{ paddingBottom: "20px" }}>
      <Tabs tabs={tabs} activeTab={activeTab} />

      <div className="feed-container">
        {dishes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
            <p>Пока нет постов.</p>
          </div>
        ) : (
          dishes.map(({ dish, isLiked, isSubscribed, communityRating }) => (
            <FeedItem
              key={dish.id}
              dish={dish}
              initialIsLiked={isLiked}
              initialIsSubscribed={isSubscribed}
              communityRating={communityRating}
            />
          ))
        )}
      </div>
    </div>
  );
}
