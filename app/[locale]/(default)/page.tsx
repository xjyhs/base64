import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-4">{t("description")}</p>
      </div>
    </main>
  );
}
