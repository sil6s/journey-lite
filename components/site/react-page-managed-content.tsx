import Link from "next/link";
import { getReactPageOverride } from "@/lib/site/overrides";

export async function ReactPageManagedContent({ path }: { path: string }) {
  const override = await getReactPageOverride(path).catch(() => null);
  if (!override || (!override.headline && !override.summary && !override.contentBlocks?.length)) return null;

  return (
    <section className="border-y border-[#dce4df] bg-[#f7faf8]">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {override.eyebrow ? <p className="eyebrow">{override.eyebrow}</p> : null}
        {override.headline ? <h2 className="mt-3 max-w-3xl font-serif text-4xl text-[#1e2b24]">{override.headline}</h2> : null}
        {override.summary ? <p className="mt-4 max-w-3xl text-lg leading-8 text-[#516059]">{override.summary}</p> : null}
        {override.contentBlocks?.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {override.contentBlocks.map((block, index) => (
              <article className="rounded-lg border border-[#dce4df] bg-white p-6" key={block._key ?? `${block.heading}-${index}`}>
                {block.heading ? <h3 className="text-xl font-semibold text-[#1f2c25]">{block.heading}</h3> : null}
                {block.body ? <p className="mt-3 whitespace-pre-line leading-7 text-[#516059]">{block.body}</p> : null}
                {block.link?.href && block.link.label ? (
                  <Link className="mt-4 inline-flex font-semibold text-[#145c42] underline underline-offset-4" href={block.link.href}>
                    {block.link.label}
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
