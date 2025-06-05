import { supabase } from "../lib/supabase";
import type { Metadata } from "next";

type Props = {
  params: { name: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent(params.name);

  try {
    const { data } = await supabase
      .from("eid_submissions")
      .select("name")
      .eq("name", name)
      .limit(1)
      .maybeSingle();

    if (data) {
      return {
        title: `${data.name}'s Eid Greeting | Eid Mubarak Canvas`,
        description: `Beautiful Eid greeting created by ${data.name}`,
        openGraph: {
          title: `${data.name}'s Eid Greeting`,
          description: "Beautiful Eid Mubarak greeting",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Eid Greeting | Eid Mubarak Canvas",
    description: "Beautiful Eid Mubarak greeting",
  };
}

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
