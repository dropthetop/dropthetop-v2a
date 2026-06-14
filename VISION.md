dropthetop.com — Product Vision
Strategic North Star. Sits above the build: this is the "what and why." CONVERSION_PLAN.md tracks current build status, CLAUDE.md holds technical rules, BACKLOG.md holds future ideas. This document is iterated deliberately, not casually — significant strategic changes should be reasoned through, not made on a whim.

What this is
The modern home for buying, selling, and talking about Corvettes — where the marketplace and the community are one integrated thing, not a marketplace with a forum stapled on or a forum with classifieds in the corner.
The thesis
Community + Marketplace, fused, Corvette-only, on modern tech. The integration between them is the product. Every competitor treats one as primary and the other as secondary, which is why each is missing something. No one has built marketplace and community as co-equal and intertwined for Corvettes. That fusion is the moat.

The two fused domains
Marketplace — buy and sell.

Vehicles (most-built today; modern, server-rendered, shareable)
Parts
Auctions (future — heavy complexity: bidding, escrow/trust, disputes; named here so the architecture stays open to it, not built near-term)

Community — belong and talk.

Forum (tag-based: generation tag + topic tag; technical Q&A and enthusiast discussion)
Garage / Showcase (show off your car, not for sale; a home for every Corvette; a low-pressure on-ramp to listing it for sale if it draws interest)

The weave (the differentiator). Listings link to discussion; discussions link to listings and generations; showcase cars carry comments; eventually live commentary on auctions in the Bring a Trailer spirit. The two halves are designed as one thing, not two things that link out to each other.

Knowledge layer — Corvette depth
Supports both domains; not a third domain.

History (per-generation, static, SEO-strong)
News (fresh, crawlable, sparks community)

Corvette-deep means authoritative in service of the marketplace and community — not an attempt to be a comprehensive "everything Corvette" encyclopedia. Depth supports focus; it does not replace it.

What "modern" means
Our differentiation rests on being modern where the incumbents are dated. "Modern" is a concrete standard, not a vibe — it applies across the whole platform, every domain and the knowledge layer:

SEO-first, everywhere. Every public page — vehicles, parts, forum threads, showcase cars, history, news — is server-rendered with real content and metadata in the initial HTML, crawlable and shareable. This is both the differentiation and the cold-start engine: the marketplace bootstraps an audience via search, which only works if every public surface ranks and previews correctly. SEO is a property of the whole product, not one pillar.
Mobile-first, responsive. Clean and fully usable on a phone, not a desktop layout crammed onto a small screen — the most visible way the incumbents show their age.
Fast and app-like. Quick loads, smooth navigation, no full-page reloads where they don't belong.
Clean, uncluttered design. Readable, contemporary, image-forward — the opposite of dense bulletin-board UX.
Shareable. Every listing, thread, and showcase page produces a correct rich preview when shared (iMessage, social) — already proven on vehicle listings.
AI-enhanced. AI is part of the product experience, not just how it's built — a core element of being modern rather than dated. Specific AI capabilities are a stated direction, not yet designed: candidates include smarter/natural-language search, AI-assisted listing creation (e.g. drafting descriptions from photos/specs), and enthusiast Q&A grounded in the site's Corvette knowledge. To be defined in a dedicated design pass before any AI feature is built; until then this is intent, not specification.

The test: if a feature would look or feel at home on CorvetteForum circa 2010, it isn't done to standard.

Design principles
The durable rules that guide decisions. When a future choice conflicts with one of these, the principle wins unless there's a strong, explicit reason to revisit it.
1. It's one integrated thing. Marketplace and Community are co-equal and fused, joined by the weave (listings ↔ discussion ↔ showcase). Not a marketplace with a forum added, nor a forum with classifieds added. Why it matters: the integration is the entire differentiation; every competitor treats one half as secondary and starves it, so building them as one thing is what creates the moat. Rejected: "marketplace-primary, community as a feature" and "community-primary, marketplace as a feature" — both recreate an existing competitor instead of the new thing.
2. Corvette-deep, not everything-Corvette. Depth (History, News, generation-awareness, knowledgeable community) makes the product authoritative and distinguishes it from generic marketplaces. Why it matters: depth in service of focus is a moat; unbounded "everything Corvette" is a vision-killer with no boundary. Rejected: becoming a comprehensive Corvette encyclopedia or one-stop-shop. Depth supports the marketplace and community; it does not become an open-ended mission.
3. Equal weight as philosophy, not as equal v1 effort. All parts are co-equal in the vision and genuinely integrated at launch — but v1 depth will be deliberately uneven (the marketplace is further built; community pillars start minimal). Why it matters: treating "equal" as "equal launch effort" would hold the nearly-done marketplace hostage to building deep community from scratch — recreating the never-ship risk. Equality shows up in "all present and truly woven together," not in equal build hours. Rejected: gating launch on every pillar being equally deep.
4. Launch gate is "all parts present at v1 scope, working and integrated" — not "the whole vision complete." Why it matters: the vision is never finished (it grows for years), so making completeness the gate means never meeting a user. A defined minimal-but-working v1 across all parts is reachable; "done" is not. Corollary: the v1-vs-future line is a defended boundary — scope creep within a pillar is how "minimal" silently becomes "never ship."

Strategic context — how we got here
Background reasoning. Not rules, but the context that explains the principles above.

The competitive gap. CorvetteForum: large beloved community, ancient tech, no real marketplace. Rennlist: proven forum + integrated marketplace model (for Porsche), but forum-first and dated — a competitor, Rennzone, exists specifically to escape its clunky classifieds. Rennzone & classic.com: clean marketplace / strong aggregation, but no community — transactional and replaceable (classic.com is also a direct comp for any aggregation we do, so our aggregation must be Corvette-deep and community-connected, not just match theirs). Bring a Trailer & Cars & Bids: excellent listing/auction energy and live-comment engagement, but not Corvette-specific and not a community you belong to. No one has modern + clean + SEO-strong + integrated community, Corvette-only. That empty space is the opportunity.
Cold-start is the central launch risk. A marketplace and a community are both worthless empty. The marketplace can bootstrap from zero via SEO — strangers arrive from search (someone Googles "1967 Corvette for sale" and lands on us). The community cannot bootstrap that way — no one Googles into an empty forum. So the marketplace's SEO is the mechanism that brings the audience the community needs. This is why the integration and the sequencing matter — not merely that they're nice to have.
Seeding via aggregation (parallel track, pending legal clearance). Aggregating Corvette listings from other sites (e.g. Mershons, Vanguard, Bring a Trailer, Cars & Bids) is a candidate tactic to seed the marketplace so it's useful before native sellers and community exist. Open question: most sites' terms forbid scraping/republishing and photos carry copyright, so this would require source-site permission. Owner is researching. Captured as strategy, not commitment; it does not gate the build, and the pillars are being built independent of it.


v1 scope vs. future
The defended boundary (Principle 4). v1 = everything in the v1 list below, each minimal but working and integrated. Everything in the Future list is explicitly out of v1. Scope creep — pulling Future items into v1, or deepening v1 items past "minimal but working" — is the risk this line defends against.
Architectural note that makes v1 affordable: Vehicles and Parts are built as one listing system with two types underneath — shared data-access (in packages/shared), shared listing components, shared SSR/SEO treatment, shared create/edit flow; the difference is which fields and filters apply per type. But the user sees them as separate destinations: a Vehicle Inventory page and a Parts Inventory page, browsable separately. Shared plumbing, separate surfaces. This is why Parts fits in v1 — it's a type of the existing listing system, not a second marketplace built from scratch.
v1 — the launch scope
All present, minimal but working, and integrated.

Vehicle marketplace: Vehicle Inventory page (browse/search/filter, server-rendered); listing detail with full content, OG tags, structured data; create/edit/delete; photos; seller contact and offers. (Largely complete from the conversion work.)
Parts marketplace: Parts Inventory page (browse/search/filter, server-rendered, a separate destination from vehicles); parts listing detail (same SSR/SEO); create/edit a part with type-specific fields (condition, generation/model fitment); seller contact. Maximum reuse of the vehicle listing architecture.
Forum: Create a post with generation tag + topic tag; post list filterable by tag; post view with replies; reply; markdown + images; search; basic moderation (member flagging + admin review). Light integration: posts reference generations; listings/showcase can link to related discussion.
Garage / Showcase: Create a showcase page for your car (photos, specs, story, generation); public view; comments; shown on your profile; a "list this car for sale" path to the marketplace.
Knowledge layer (History & News): Carried over from the conversion; server-rendered. Light integration: history links to relevant inventory; news can link to discussion.
Platform-wide: Everything meets the "modern" standard — SEO-first on every public page, mobile-first, fast, clean, shareable. Supabase Auth. Web only.

Future — explicitly out of v1 (v2, v3, …)
Captured so the direction is clear and the architecture stays open; not built for launch. Pillar-deepening items also accumulate in BACKLOG.md.

AI (strong, early v2 priority): First AI feature after a dedicated design pass — candidates: natural-language/smarter search, AI-assisted listing description drafting, Corvette Q&A grounded in site content. Designed deliberately before built.
Auctions: A future way to transact in the marketplace — heavy complexity (bidding, escrow/trust, disputes); architecture stays open to it, not built near-term.
Vehicle marketplace depth: saved searches/alerts; buyer analytics; price-history/market data; comparison tools.
Parts marketplace depth: detailed fitment matching (part-to-trim); deeper parts taxonomy; wanted/ISO ads; vendor/sponsor storefronts.
Forum depth: voting/reputation; trust levels; real-time updates; deep listing↔discussion weaving; Bring-a-Trailer-style live commenting; bookmarks; notification depth.
Garage / Showcase depth: featured cars / car-of-the-month; galleries; activity feeds; following/favoriting; richer showcase→sale conversion.
Knowledge layer depth: editorial expansion; richer cross-linking; user-contributed content; deeper content/SEO strategy.
Mobile app: separate React Native/Expo app sharing packages/shared (per CLAUDE.md); post-web-launch, once the platform is proven.
Seeding via aggregation: pending legal/permission research (see Strategic context).
