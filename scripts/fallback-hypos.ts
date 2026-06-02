// Authored fallback hypotheticals, one per teaching target across both doctrines.
// Each is engineered so the units resolve as that target's configuration requires:
// fair use factors land as specified with the dispositive factor controlling;
// infringement elements land met/fails so AND logic yields the right verdict.
// Used when ANTHROPIC_API_KEY is absent or a generation call fails.
import type { Hypo } from "../lib/types";

export const FALLBACK_HYPOS: Hypo[] = [
  // ---- Fair use (weigh-and-balance) ----
  {
    // T1: {1: fair_use, 2: neutral, 3: fair_use, 4: favors_owner}, dispositive 4.
    doctrine_id: "fair-use",
    target_id: "T1",
    title: "The Sentiment Scraper",
    source_work: "Harborline, a paid investment newsletter",
    use: "an AI tool that resells distilled signals from it",
    fact_pattern:
      "Harborline is a subscription investment newsletter, part dry market data and part the author's pointed commentary, published twice weekly to 4,000 paying readers. A startup, Pulsewave, ingests each issue and runs it through a model that outputs a one-line numeric \"mood score\" and a three-word tag for each company mentioned. Pulsewave never reproduces Harborline's prose; subscribers see only the scores, which Pulsewave sells for a monthly fee. From any single issue the tool keeps only a handful of words to anchor each score. Harborline's publisher had recently begun licensing a structured data feed of exactly these kinds of signals to hedge funds, and several of those funds cancelled their feed contracts once Pulsewave launched a cheaper equivalent. Harborline's subscriptions also dipped as readers found they could get the actionable takeaway from Pulsewave alone. Pulsewave argues its output is a new analytical product that looks nothing like the newsletter and uses only a sliver of each issue.",
  },
  {
    // T2: {1: fair_use, 2: favors_owner, 3: neutral, 4: fair_use}, dispositive 1.
    doctrine_id: "fair-use",
    target_id: "T2",
    title: "A Parody for Profit",
    source_work: "\"Glass Horizon,\" a chart-topping power ballad",
    use: "a commercially released parody single",
    fact_pattern:
      "\"Glass Horizon\" is an original, highly creative power ballad whose earnest chorus about undying devotion sold millions of copies. A comedy band, the Off-Keys, writes and commercially releases \"Gas Horizon,\" a send-up that keeps the instantly recognizable melodic hook and the cadence of the famous chorus but rewrites the lyrics into a deadpan lament about a failing used-car dealership. The Off-Keys sell the parody on streaming services and press vinyl for profit. The track borrows enough of the original's signature musical phrase that listeners immediately recognize the target of the joke, but no more than needed to conjure it. The parody plays for laughs to fans of comedy music; nobody mistakes it for the sincere love song, and listeners who want the real \"Glass Horizon\" still buy the original. The Off-Keys made no attempt to license the song, and the original's publisher, who never authorizes parodies, sues.",
  },
  {
    // T3: {1: neutral, 2: favors_owner, 3: favors_owner, 4: neutral}, dispositive 3.
    doctrine_id: "fair-use",
    target_id: "T3",
    title: "Twelve Seconds of the Heart",
    source_work: "\"Last Light,\" an acclaimed feature film",
    use: "a short clip reused in a retrospective documentary",
    fact_pattern:
      "\"Last Light\" is a celebrated, wholly fictional feature film, two hours long, famous above all for a single wordless scene: the twelve-second shot in which the protagonist finally turns to the camera, the emotional and thematic climax the entire film is built toward. A documentary about the film's director includes that exact twelve-second shot, uncut, while a narrator discusses the director's career. Twelve seconds out of a two-hour film is a tiny fraction of the runtime, yet it is the single most recognizable and affecting moment the film has — the part audiences remember and the studio features in its own marketing. The documentary's use is partly informational and partly just a showcase of the famous moment, and it is hard to say whether the documentary either substitutes for the film or affects any licensing market the studio would plausibly pursue. The studio sues over the use of the clip.",
  },

  // ---- Copyright infringement (all-of) ----
  {
    // E1: {1: fails, 2: met} — ownership fails (no originality), copying obvious.
    doctrine_id: "infringement",
    target_id: "E1",
    title: "The Copied Phone Book",
    source_work: "RegионData's county-wide business listing directory",
    use: "a rival app that scraped the entire listing verbatim",
    fact_pattern:
      "RegionData LLC spent two years and considerable expense compiling \"AllListings,\" a database of every registered business in a three-county area: each entry a name, street address, phone number, and industry code, sorted alphabetically by business name. RegionData added no reviews, no editorial selection, no original descriptions — it simply gathered the publicly available facts and arranged them in the most obvious order. A competitor, QuickFind, copied the entire database wholesale, field for field, and launched a directory app of its own. There is no dispute that QuickFind took the data directly from AllListings — internal logs show automated scraping of every record overnight, and QuickFind even reproduced two deliberately planted fictitious entries. RegionData sues, pointing to the blatant, admitted, verbatim copying and the years of labor it invested. QuickFind concedes it copied everything but argues that what it took was nothing more than an alphabetical list of facts.",
  },
  {
    // E2: {1: met, 2: fails} — ownership valid, copying fails (independent creation).
    doctrine_id: "infringement",
    target_id: "E2",
    title: "Two Songs, No Contact",
    source_work: "\"Paper Lanterns,\" an original indie folk song",
    use: "a later song that sounds similar but was written in isolation",
    fact_pattern:
      "Mara Quinn wrote and recorded \"Paper Lanterns,\" an original indie folk song with a distinctive fingerpicked melody and confessional lyrics, releasing it to a few hundred local listeners. Two years later, a songwriter on the other side of the country, Devon Reyes, released \"Harbor Lights,\" which listeners noticed shared a similar mood, a comparable chord progression, and the common lyrical theme of waiting for someone to come home. Quinn sues, insisting the resemblance is too close to be accidental. But discovery turns up no evidence that Reyes ever heard, streamed, or had any plausible access to \"Paper Lanterns\" — it was never distributed in his region, online or off. Reyes produces dated demos and a co-writer who watched him build \"Harbor Lights\" from scratch. Musicologists testify that the overlapping progression is a stock pattern common to hundreds of folk songs, and that the shared theme is a generic idea, not Quinn's particular expression. Quinn's own authorship of \"Paper Lanterns\" is undisputed and plainly original.",
  },
  {
    // E3: {1: met, 2: met} — both elements satisfied, the claim stands.
    doctrine_id: "infringement",
    target_id: "E3",
    title: "The Lifted Chapters",
    source_work: "\"Tidewater,\" an original published novel",
    use: "a self-published book reproducing whole passages",
    fact_pattern:
      "Nadia Cole wrote and published \"Tidewater,\" an original novel with invented characters, an intricate plot, and a distinctive prose voice developed over four years. The work is unquestionably original — independently created and richly creative. A self-published author, Grant Mercer, released \"Saltline,\" which reproduces, nearly word for word, three full chapters of \"Tidewater,\" including Cole's most memorable passages, with only the protagonist's name changed. Mercer had a copy of \"Tidewater\" — he reviewed it on his blog months before \"Saltline\" appeared and quoted from it there — so access is not in doubt. Side-by-side comparison shows the copied chapters track Cole's protected expression sentence by sentence: the same imagery, the same dialogue, the same narrative turns, not merely the same general ideas. Cole sues for infringement, and Mercer offers no claim of independent creation and no fair use defense; he simply disputes that a self-published book matters. Both the validity of Cole's copyright and the fact of copying are squarely established.",
  },
];
