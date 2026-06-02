// Preloaded example sources for the ingestion entry screen. These guarantee a
// clean end-to-end run in front of a live audience while the textarea still
// accepts arbitrary pasted text. Each is real copyright source material the
// extractor reliably turns into a test structure. `doctrines` notes which
// structures a source fits best; any source can be run through either doctrine,
// and the combined excerpt is here precisely to show the same source producing a
// balancing grid one way and an element checklist the other.

export interface ExampleSource {
  id: string;
  label: string;
  blurb: string;
  /** Doctrine ids this source extracts cleanly for (annotation only). */
  doctrines?: string[];
  text: string;
}

export const EXAMPLE_SOURCES: ExampleSource[] = [
  {
    id: "campbell",
    label: "Campbell v. Acuff-Rose (fair use)",
    blurb: "The Supreme Court parody opinion that anchors the balancing test.",
    doctrines: ["fair-use"],
    text: `Campbell v. Acuff-Rose Music, Inc., 510 U.S. 569 (1994)

The fair use of a copyrighted work is not an infringement of copyright. Section 107 directs courts to weigh four factors: (1) the purpose and character of the use, including whether such use is of a commercial nature or is for nonprofit educational purposes; (2) the nature of the copyrighted work; (3) the amount and substantiality of the portion used in relation to the copyrighted work as a whole; and (4) the effect of the use upon the potential market for or value of the copyrighted work.

The central purpose of the first inquiry is to see whether the new work merely supersedes the objects of the original creation, or instead adds something new, with a further purpose or different character, altering the first with new expression, meaning, or message; it asks, in other words, whether and to what extent the new work is transformative. The more transformative the new work, the less will be the significance of other factors, like commercialism, that may weigh against a finding of fair use. The fact that a use is commercial is to be weighed against a finding of fair use, but is not presumptively unfair.

2 Live Crew's song "Pretty Woman" was a parody of Roy Orbison's "Oh, Pretty Woman." Parody, like other comment and criticism, may claim fair use because it needs to mimic an original to make its point, and so has some claim to use the creation of its victim's imagination. Like a book review quoting the copyrighted material criticized, parody may or may not be fair use, and the song here, whether or not its parodic character was reasonably perceived, must be judged case by case.

As to the third factor, parody presents a difficult case. Parody's humor, or in any event its comment, necessarily springs from recognizable allusion to its object through distorted imitation. When parody takes aim at a particular original work, the parody must be able to conjure up at least enough of that original to make the object of its critical wit recognizable. Once enough has been taken to assure identification, how much more is reasonable will depend on the extent to which the song's overriding purpose and character is to parody the original.

The fourth factor requires courts to consider not only the extent of market harm caused by the particular actions of the alleged infringer, but also whether unrestricted and widespread conduct of the sort engaged in by the defendant would result in a substantially adverse impact on the potential market for the original. Because parody may quite legitimately aim at garroting the original, destroying it commercially as well as artistically, the role of the courts is to distinguish between biting criticism that merely suppresses demand and copyright infringement, which usurps it. A parody and its target serve different market functions.`,
  },
  {
    id: "explainer",
    label: "Fair use explainer (short)",
    blurb: "A plain-language overview of the four-factor balancing test.",
    doctrines: ["fair-use"],
    text: `Understanding Fair Use Under U.S. Copyright Law

Fair use is a legal doctrine that permits limited use of copyrighted material without permission from the rights holder. It is not a blanket exception; it is a balancing test. Courts weigh four factors together, and no single factor is decisive on its own — though in practice some carry more weight than others.

First, the purpose and character of the use. Courts ask whether the use is "transformative" — whether it adds new meaning, message, or purpose rather than simply republishing the original. Commentary, criticism, parody, news reporting, teaching, and research lean toward fair use. Purely commercial uses that substitute for the original lean against it. A transformative purpose can outweigh the fact that a use is commercial.

Second, the nature of the copyrighted work. Use of factual or published works is more likely to be fair than use of highly creative or unpublished works. This factor rarely decides a case and usually carries little weight.

Third, the amount and substantiality of the portion used. Taking a small portion favors fair use; taking a large portion cuts against it. But quantity is not everything: copying the "heart" of a work — its most important, recognizable part — can defeat fair use even when the amount is small.

Fourth, the effect on the market. This is often the most important factor. If the use substitutes for the original or harms an existing or likely licensing market, it weighs heavily against fair use. If the use serves a different market the owner would not enter, it weighs in favor.

These four factors are weighed and balanced together. A use that looks transformative and takes very little can still fail if it causes real market harm, and a commercial use can still be fair if it is genuinely transformative.`,
  },
  {
    id: "treatise",
    label: "Casebook note on market harm",
    blurb: "A doctrine-chapter excerpt centered on the fourth factor.",
    doctrines: ["fair-use"],
    text: `Chapter 9 — The Market-Harm Factor in Fair Use

Of the four statutory factors, the effect of the use upon the potential market for or value of the copyrighted work has, at various points, been called the single most important element of fair use. While the Supreme Court has since cautioned against treating any one factor as dispositive in isolation, the fourth factor remains the analytical center of gravity in commercial cases.

The inquiry is not limited to whether the defendant's specific use harmed actual sales. Courts must also ask whether the challenged conduct, if it became widespread, would cause substantial harm to the market for the original or its derivatives. Critically, this includes harm to markets the copyright owner has not yet entered but plausibly would — above all, the market to license the work.

A recurring trap for students is to evaluate market harm by looking only at direct, head-to-head sales competition. That is too narrow. Where a copyright owner has an established or readily available licensing market, a defendant's unlicensed use can substitute for a paid license even if it does not displace a single retail sale. The lost licensing revenue is itself cognizable harm.

The market-harm factor also interacts tightly with the first factor. A genuinely transformative use serves a different market function than the original and is therefore less likely to substitute for it. Conversely, a use that merely repackages the original for the same audience is a market substitute, and the fourth factor will weigh decisively against fair use — even where the taking is quantitatively modest and the work is largely factual.`,
  },
  {
    id: "feist",
    label: "Feist v. Rural (infringement)",
    blurb:
      "The originality opinion that anchors the prima facie infringement test.",
    doctrines: ["infringement"],
    text: `Feist Publications, Inc. v. Rural Telephone Service Co., 499 U.S. 340 (1991)

To establish copyright infringement, two elements must be proven: (1) ownership of a valid copyright, and (2) copying of constituent elements of the work that are original. The first element tests whether the plaintiff holds a valid copyright at all; the second tests whether the defendant actually took protected expression.

The sine qua non of copyright is originality. To qualify for copyright protection, a work must be original to the author. Original, as the term is used in copyright, means only that the work was independently created by the author (as opposed to copied from other works), and that it possesses at least some minimal degree of creativity. The requisite level of creativity is extremely low; even a slight amount will suffice. The vast majority of works make the grade quite easily, as they possess some creative spark, no matter how crude, humble or obvious it might be.

Facts are not copyrightable. The distinction is between creation and discovery: the first person to find and report a particular fact has not created the fact; he has merely discovered its existence. No matter how much original authorship the compilation displays, the facts and ideas it exposes are free for the taking. Rural's white-pages directory was a garden-variety alphabetical listing of names, towns, and telephone numbers — an age-old practice, firmly rooted in tradition and so commonplace that it has come to be expected as a matter of course. Rural expended sufficient effort to make the directory useful, but insufficient creativity to make it original. The selection, coordination, and arrangement of Rural's listings could not be more obvious, and lacked the modicum of creativity necessary to transform mere selection into copyrightable expression.

The second element, copying, is often proven by showing that the defendant had access to the plaintiff's work and that the two works are substantially similar as to protected expression. But copying of facts or ideas — even verbatim — is not infringement, because those elements are not protected in the first place. Sweat of the brow, the labor of compiling information, does not by itself create copyrightable subject matter; the constitutional standard is originality, not industriousness.`,
  },
  {
    id: "copyright-dispute",
    label: "Copyright dispute (both doctrines)",
    blurb:
      "A casebook overview covering both the prima facie claim and the fair use defense — run it through either doctrine to see the question form change.",
    doctrines: ["fair-use", "infringement"],
    text: `Chapter 1 — Anatomy of a Copyright Dispute: The Claim and the Defense

A copyright suit unfolds in two structurally different stages, and it is worth seeing how differently each is reasoned.

The plaintiff's prima facie case. To make out infringement, a plaintiff must prove every element of the claim. First, ownership of a valid copyright. A copyright is valid only where the work is original — independently created by its author rather than copied from another source, and carrying at least a minimal spark of creativity. Facts, ideas, and rote, unoriginal compilations are not protected at all, however much labor went into assembling them; effort alone (the discredited "sweat of the brow" theory) earns nothing. Second, copying of the work's original, protected elements. Copying is typically shown by proof of access plus substantial similarity of protected expression. Crucially, similarity confined to unprotectable ideas or facts is not copying in the legal sense, and a defendant who arrived at a similar work by independent creation has not infringed at all. Because these are elements and not factors, the claim is all-or-nothing: fail either one, and the claim collapses entirely. There is no weighing — a defect in any single element is dispositive.

The defendant's fair use defense. Even where every element of infringement is satisfied, a defendant may escape liability by establishing fair use, and here the mode of reasoning flips. Fair use is not an element test but a balancing test. Courts weigh four factors together: the purpose and character of the use, including whether it is transformative or merely commercial; the nature of the copyrighted work, factual or creative, published or not; the amount and substantiality of what was taken, in both quantity and qualitative importance (the "heart" of the work); and the effect of the use upon the potential market for or value of the work, including licensing markets. No single factor controls by rule, though market harm and a transformative purpose tend to carry the most weight, and a strong showing on one factor can outweigh a weak showing on another. The defense is a judgment of degree, not a checklist.

The contrast is the lesson. The claim is conjunctive and unforgiving — every element required. The defense is holistic and elastic — all factors balanced, none decisive alone. Two doctrines, two logics, one dispute.`,
  },
];
