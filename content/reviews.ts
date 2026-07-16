// Shared content layer. The static chrome below (nav, strap, facts, motto,
// about, submitFields) is what every theme reads at runtime.
//
// The `reviews[]` array is NOT a runtime source — the live feed comes from the
// Airtable "Reviews" table via lib/reviews-data.ts#getReviews(), and marquee
// images come from each record's uploaded Photo attachment through /api/photo.
// This array is the original seed that populated Airtable (one-off, via
// scripts/airtable-reviews-migrate.mts); its /art/art-0X.jpg paths reference the
// real CC0 originals in public/art that were uploaded as those attachments.

export type Review = {
  slug: string;
  no: string;
  date: string;      // display, e.g. "07.11.26"
  iso: string;       // sortable
  section: string;   // Painting, Prints, Photography, Old Masters, Portraiture
  title: string;     // the show / gallery title (big + bold)
  venue: string;
  hood: string;
  by: string;        // author byline
  dek: string;       // one-line summary
  body: string[];    // paragraphs
  image: string;     // /art/art-0X.jpg
  artist: string;
  artwork: string;   // artwork title
  credit: string;    // full public-domain credit line
  alt: string;
};

export const reviews: Review[] = [
  {
    slug: "toulouse-lautrec-night-work",
    no: "8", date: "07.11.26", iso: "2026-07-11", section: "Painting",
    title: "Toulouse-Lautrec: Night Work",
    venue: "The Morgan Library & Museum", hood: "Murray Hill", by: "Coleman Reyes",
    dek: "The green-lit face shoved to the edge is the whole argument.",
    body: [
      "Everyone remembers the crowd, but the painting belongs to the woman shoved half out of the frame at right, her face lit acid green by unseen footlights. She is the reason to make the trip. Lautrec painted Montmartre from the inside — he practically lived at the Moulin Rouge — and he refuses to sell it to us as spectacle. The dancers are off the clock. The drinkers look bored. The artist himself turns up in the back, a top-hatted dwarf beside his towering cousin, too honest to leave himself out of the transaction.",
      "The Morgan’s hang leans into the cropping, and it pays off. What reads at first as loose reportage is really composition as ambush. Lautrec cuts the bodies at the balustrade so the eye can never quite come to rest; the diagonal rail shoves you into the room whether you like it or not; and the whole machine is built to deposit you, finally, on that ghoulish, gorgeous, gaslit face. It is a green that has no business in a human complexion, and it is the truest thing in the picture.",
      "The wall text wants to talk about absinthe and decadence, the usual Montmartre package. Ignore it. What Lautrec understood — before the century turned, before the movies, before any of the machinery we now use to sell nightlife back to ourselves — is that entertainment is labor, and that the people who perform intimacy for money are the most watched and least seen figures in modern life. He watched them. He saw them. This small, sharp show lets you do the same, and it is the most modern hour you can spend in New York this month, assembled from a picture made in a smoke-filled basement a hundred years ago.",
    ],
    image: "/art/art-01.jpg",
    artist: "Henri de Toulouse-Lautrec", artwork: "At the Moulin Rouge",
    credit: "Henri de Toulouse-Lautrec, At the Moulin Rouge, 1892–95. Public domain, Art Institute of Chicago.",
    alt: "Nightlife scene at the Moulin Rouge with figures around a table and a woman’s green-lit face in the foreground.",
  },
  {
    slug: "van-gogh-in-arles",
    no: "7", date: "07.04.26", iso: "2026-07-04", section: "Painting",
    title: "Van Gogh in Arles",
    venue: "The Metropolitan Museum of Art", hood: "Upper East Side", by: "June Tanaka",
    dek: "A room painted by someone desperate to believe in rest.",
    body: [
      "The tilt is the tell. The floor pitches forward, the back wall refuses to meet its neighbors at any angle a builder would recognize, the two chairs sit at odds like people who have quarreled — and yet Van Gogh insisted, in letter after letter, that this picture was about rest. “Looking at the picture ought to rest the brain,” he wrote. It is the most strenuous calm ever committed to canvas.",
      "“The Bedroom” is the sound of a man talking himself into a peace he does not have, in colors turned up well past the point of comfort. That blue is not the blue of a restful room; it is a blue with its jaw set. The bed is a slab of chrome yellow. The blanket is a red so saturated it reads less as bedding than as a held breath. Van Gogh believed color could do the work of sedation. He was wrong, and the wrongness is the painting’s whole achievement: you feel him wanting the calm so badly that the wanting becomes the subject.",
      "The Met surrounds it with the correspondence, which is either generous or a crutch, depending on your patience for biography. My advice is to skip the vitrines on the first pass. The painting says everything the letters do, and says it in brushwork you could set your watch by — each plank of the floor, each frame on the wall, laid down with a carpenter’s insistence that if the room is only built solidly enough it might finally hold still. It doesn’t. That is the point. This is not a restful picture; it is a picture of the longing to rest, which is a harder thing to paint and a better one to stand in front of, and it has rarely looked better lit than it does here.",
    ],
    image: "/art/art-02.jpg",
    artist: "Vincent van Gogh", artwork: "The Bedroom",
    credit: "Vincent van Gogh, The Bedroom, 1889. Public domain, Art Institute of Chicago.",
    alt: "Van Gogh’s bedroom in Arles with blue walls, red blanket, yellow bed and wooden furniture in bold flat color.",
  },
  {
    slug: "the-face-in-the-glass",
    no: "6", date: "06.27.26", iso: "2026-06-27", section: "Portraiture",
    title: "The Face in the Glass",
    venue: "Brooklyn Museum", hood: "Prospect Heights", by: "Marcus Bell",
    dek: "Thirty self-portraits in two years; this is the one that stops lying.",
    body: [
      "Van Gogh painted himself compulsively — more than thirty times in two years — for the least romantic of reasons: models cost money and a mirror is free. Keep that in mind at the Brooklyn Museum, where the 1887 head hangs among four centuries of people arranging their own faces for posterity. It cuts through the room like a slap.",
      "What is happening here is the moment the borrowed becomes his own. Van Gogh had arrived in Paris and swallowed Impressionism whole; you can see the flickering, divided brushwork he lifted from the younger painters, the little commas of color. But where they used the technique to dissolve a haystack into light, he turns it into weather. The blue-green background churns like a sky about to do something violent, and the face — ginger-bearded, hollow-cheeked, wary — holds against it, gathered out of the same nervous strokes yet refusing to come apart. Technique becomes temperament.",
      "The show’s premise, self-portraiture across the centuries, mostly flatters this one by contrast. Hang it beside so much careful self-presentation — the powdered courtiers, the artists in their good coats, the practiced three-quarter turns — and Van Gogh’s refusal to flatter reads as sheer nerve. He is not asking to be liked. He is not even, exactly, asking to be remembered. He is checking, with a kind of grim curiosity, whether the man in the glass is still there, still holding, still worth the paint. He was, and this is the portrait that knows it, and Brooklyn has given it just enough room to do its quiet, unsettling work.",
    ],
    image: "/art/art-03.jpg",
    artist: "Vincent van Gogh", artwork: "Self-Portrait",
    credit: "Vincent van Gogh, Self-Portrait, 1887. Public domain, Art Institute of Chicago.",
    alt: "Van Gogh self-portrait with red beard against a swirling blue-green background of short brushstrokes.",
  },
  {
    slug: "renoir-on-the-terrace",
    no: "5", date: "06.20.26", iso: "2026-06-20", section: "Painting",
    title: "Renoir: On the Terrace",
    venue: "The Metropolitan Museum of Art", hood: "Upper East Side", by: "Priya Anand",
    dek: "Sweetness this aggressive is a position, not an accident.",
    body: [
      "It is easy to dismiss Renoir as the painter of the chocolate box, and “Two Sisters” hands the skeptic every weapon in the drawer: the rosy cheeks, the basket of wool spilling like fallen fruit, the wall of foliage doing frantic Impressionist somersaults behind two impossibly wholesome girls. Half the visitors will coo. The other half will smirk. Both are missing how hard the picture is working.",
      "Look at the blue of the older girl’s dress. It is not a natural blue; it is a new, chemical, industrial blue, freshly available from a tube, and Renoir lays it on with the confidence of a man who knows he is showing off. The flowers on the younger one’s hat are almost violent in their red. This is not the palette of innocence. It is the palette of a professional charmer who has calibrated, to the exact degree, how much sweetness a Parisian audience of 1881 will pay to feel.",
      "Given a quiet room and decent light — which it gets here — the painting’s real subject floats up through the sugar: not innocence, but the display of it. Renoir is selling a mood, knowingly, to a city that badly wanted the mood sold to it, and he is very, very good at his job. That is not a lesser ambition than the one we grant the tortured moderns; it is simply a more honest one, and we have spent a century pretending otherwise. The show doesn’t quite have the nerve to say so out loud, but stand in front of this picture long enough and it says so for you. Charm this deliberate is a position. Treat it like one.",
    ],
    image: "/art/art-04.jpg",
    artist: "Pierre-Auguste Renoir", artwork: "Two Sisters (On the Terrace)",
    credit: "Pierre-Auguste Renoir, Two Sisters (On the Terrace), 1881. Public domain, Art Institute of Chicago.",
    alt: "Two young sisters on a terrace, one in a blue dress with a red flowered hat, amid lush greenery.",
  },
  {
    slug: "whistler-nocturnes",
    no: "4", date: "06.13.26", iso: "2026-06-13", section: "Painting",
    title: "Whistler: Nocturnes",
    venue: "The Frick Collection", hood: "Upper East Side", by: "Dov Frankel",
    dek: "A painting that dares you to admit almost nothing is happening.",
    body: [
      "Whistler borrowed the word “nocturne” from music because music had a permission painting did not: to be about nothing but mood. No story, no moral, no anecdote — just a key, a tempo, a feeling held in the air. This blue-and-gold twilight over Southampton Water is his argument’s best witness, and the Frick has hung it exactly as such a picture wants to be hung: low, alone, and gently lit.",
      "Almost nothing happens in it, and that is the achievement. The boats dissolve into their own reflections. The horizon is less a line than a rumor the eye agrees to believe. A few flecks of gold — a lamp, a spark on the water — are all that keep the whole thing from sliding clean off into abstraction, which is plainly where Whistler’s heart wanted to take it, forty years before anyone had a name for the place. He is painting the exact moment when the world stops being a list of things and becomes a single wash of atmosphere.",
      "This asks the one thing museums are worst at granting: time. Give it ninety seconds and it is a smudge. Give it five minutes and the smudge organizes itself into a whole weather, a whole hour, a whole mood you could not describe but could pick out of a lineup. Ruskin famously accused Whistler of flinging a pot of paint in the public’s face, and got sued for it; Ruskin lost, but you can see why he panicked. Here is a painting betting its entire existence on atmosphere alone, refusing every ordinary reason a picture gives you to keep looking — and winning the bet, quietly, every time, if you will only slow down enough to let it.",
    ],
    image: "/art/art-05.jpg",
    artist: "James McNeill Whistler", artwork: "Nocturne: Blue and Gold—Southampton Water",
    credit: "James McNeill Whistler, Nocturne: Blue and Gold—Southampton Water, 1872. Public domain, Art Institute of Chicago.",
    alt: "Twilight harbor nocturne in muted blue and gold with distant boats and a low glowing horizon.",
  },
  {
    slug: "the-painted-curtain",
    no: "3", date: "06.06.26", iso: "2026-06-06", section: "Old Masters",
    title: "The Painted Curtain",
    venue: "The Leiden Collection", hood: "Upper East Side", by: "Alina Costa",
    dek: "The blue curtain is the painting; the flowers are the excuse.",
    body: [
      "Van der Spelt paints a garland of flowers, ripe and Dutch and slightly overblown, and then he paints a blue silk curtain drawn halfway across it — a curtain that is, of course, also paint. Your hand twitches. You want to pull the cloth aside to see the bouquet it is hiding, and for a half-second, before the mind catches up with the eye, you believe you could.",
      "The gag is ancient. Pliny tells it about Zeuxis and Parrhasius: one painter fools the birds with painted grapes, the other fools the painter himself with a painted curtain, and the painter concedes the match. Van der Spelt knows the story cold and executes it with a straight face and genuinely unnerving skill — the silk has weight, the thread catches the light, the whole illusion is pitched at exactly the register where admiration curdles into unease. This is a 1658 painting about the act of looking, made by a man entirely in control of yours.",
      "The Leiden Collection’s tight little survey of Dutch trompe-l’oeil makes a sly, persuasive case that illusionism was the seventeenth century’s conceptual art: paintings about painting, wearing the modest costume of mere décor to sneak the idea past the patron. The flowers are gorgeous and completely beside the point. The real subject is your own eye, caught red-handed in the act of believing something it knows to be false — which is, when you think about it, the subject of every painting, most of which are too polite to admit it. Four hundred years on, the trick still lands. Whether that leaves you humbled or laughing is between you and the curtain.",
    ],
    image: "/art/art-06.jpg",
    artist: "Adriaen van der Spelt", artwork: "Trompe-l’Oeil Still Life with a Flower Garland and a Curtain",
    credit: "Adriaen van der Spelt, Trompe-l’Oeil Still Life with a Flower Garland and a Curtain, 1658. Public domain, Art Institute of Chicago.",
    alt: "Trompe-l’oeil still life of a flower garland behind a blue silk curtain drawn half across the panel.",
  },
  {
    slug: "hokusai-thirty-six-views",
    no: "2", date: "05.30.26", iso: "2026-05-30", section: "Prints",
    title: "Hokusai: Thirty-Six Views",
    venue: "Japan Society", hood: "Turtle Bay", by: "Hana Okafor",
    dek: "The most reproduced image on earth, seen as if for the first time.",
    body: [
      "You have seen “The Great Wave” on tote bags, phone cases, socks, shower curtains, and the inside of your own eyelids, and that ubiquity is precisely the problem this show has to solve. How do you actually look at the most reproduced image on earth? Japan Society’s answer is disarmingly simple: hang it small, hang it in sequence, and let the logo become a print again.",
      "It works. Restored to its place as one of thirty-six views of Mount Fuji, the wave stops being a brand and goes back to being what Hokusai made — a print in which the mountain is very nearly the last thing you notice, crouched small and calm on the horizon while the sea rears up to swallow three boatloads of men. Up close, the color carries the argument. That blue is Prussian blue, a shocking new import when Hokusai used it, and he grids it into the water’s clawed foam with the precision of a man who has decided that a wave is also a pattern. The fishermen bow their heads. Whether they are doomed or merely soaked, we are never told.",
      "Hokusai was around seventy when he cut these blocks, signing himself, gloriously, “the old man mad about painting” and promising that if he lived to a hundred and ten every dot and line would finally come alive. He didn’t get there, but the wave did — it has outlived him, outlived Edo, outlived even its own fame, which is the rarest kind of survival an image can manage. This modest, rigorous, beautifully sequenced show performs a small miracle: for about twenty minutes, it lets you forget you have ever seen it before, and meet the thing itself.",
    ],
    image: "/art/art-07.jpg",
    artist: "Katsushika Hokusai", artwork: "Under the Wave off Kanagawa (The Great Wave)",
    credit: "Katsushika Hokusai, Under the Wave off Kanagawa (The Great Wave), 1830/33. Public domain, Art Institute of Chicago.",
    alt: "Hokusai woodblock of a great cresting blue wave with white claws of foam and Mount Fuji beyond.",
  },
  {
    slug: "stieglitz-hand-of-man",
    no: "1", date: "05.23.26", iso: "2026-05-23", section: "Photography",
    title: "Stieglitz: The Hand of Man",
    venue: "International Center of Photography", hood: "Essex Crossing", by: "Sam Whitfield",
    dek: "Stieglitz argued photography was art by photographing a train.",
    body: [
      "In 1902 the question that mattered was whether a machine could make art, and Alfred Stieglitz answered it, with characteristic nerve, by photographing another machine. “The Hand of Man” is a locomotive steaming into a rail yard — all haze, wet track, and industrial melancholy — and it is also a manifesto in a trench coat, an argument for photography’s soul disguised as a moody picture of a train.",
      "The trick is that nothing here is left to the camera alone. Stieglitz printed the smoke like charcoal, dodged and burned the sky into genuine weather, and pulled the whole scene toward the tonal richness everyone at the time reserved for etching and lithography. He wanted to prove that a photographer chooses — light, moment, print, meaning — as deliberately as any painter, and he stacked the deck to prove it. The title states the thesis out loud: the hand of man is everywhere in this image and nowhere in the frame, no human figure in sight, only the tracks and smoke and deliberate beauty that a human intelligence arranged.",
      "ICP frames the picture as the opening shot of a war Stieglitz would spend the next four decades winning — for the gallery, the magazine, the whole idea that a photograph could hang beside a painting and not apologize. Seen now, when the argument is so thoroughly settled that we photograph our lunches without a flicker of doubt, the irony he engineered still lands, and so does the silvery, insistent loveliness of the print itself. He wanted photography taken seriously. Standing in front of this small, gray, gorgeous thing, you genuinely cannot reconstruct why anyone ever thought otherwise — which is the surest sign that he won.",
    ],
    image: "/art/art-08.jpg",
    artist: "Alfred Stieglitz", artwork: "The Hand of Man",
    credit: "Alfred Stieglitz, The Hand of Man, 1902, printed 1920/39. Public domain, Art Institute of Chicago.",
    alt: "Atmospheric photograph of a steaming locomotive in a rail yard under a hazy sky, in silvery gray tones.",
  },
];

export const nav = [
  { label: "Current", href: "" },
  { label: "Archive", href: "" },
  { label: "About", href: "about" },
  { label: "Submit", href: "submit" },
];

export const strap =
  "Art criticism for the New York metropolitan area. Every review between 200 and 400 words.";

export const facts = [
  "Blind, anonymous pitches",
  "One marquee image per review",
  "Published authors paid a $200 flat fee",
];

export const motto = "King Kong died here, and it’s where the best art lives.";

export const about = {
  title: "About & Submissions",
  lede:
    "A publication solely focused on art criticism in the New York metropolitan area, with all reviews between 200 and 400 words.",
  body: [
    "Pitches are considered and approved in the order they are received, through a blind review process via an anonymous form. Publication is not based on a show’s opening or closing date, ad revenue, or a writer’s reputation; it is determined solely by a pitch’s promise and its place in the queue. We are committed to a more equitable submission and publication process.",
    "We welcome early pitches before a show opens or during its run, and we also accommodate reviews of shows that have closed — something that stuck with you, something rejected elsewhere, something you saw last week. Authors of published reviews are compensated with a flat fee of $200. There is one marquee image per review, and we prefer photos taken by the author on their phone over professional photography.",
    "We will not publish exhibition summaries, theoretical jargon, or glorified press releases. We are looking for an original position on the show: what’s at stake, why it matters, what your central argument is. Judgments should be clear and grounded in evidence. And why New York? Because King Kong died here, and it’s where the best art lives.",
  ],
};

export type SubmitField = {
  name: string;
  label: string;
  type: "text" | "email" | "url" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  help?: string;
  options?: string[];
};

export const submitFields: SubmitField[] = [
  { name: "show", label: "Exhibition or show", type: "text", placeholder: "Artist / show title", required: true },
  { name: "venue", label: "Venue", type: "text", placeholder: "Gallery or museum, neighborhood", required: true },
  { name: "section", label: "Discipline", type: "select", options: ["Painting", "Sculpture", "Photography", "Prints", "Installation", "Old Masters", "Group Show", "Other"] },
  { name: "pitch", label: "Your pitch", type: "textarea", placeholder: "Your central argument, in a few sentences. What’s at stake, and why does it matter?", required: true, help: "200–400 words when published. Tell us your position, not the press release." },
  { name: "sample", label: "Writing sample (link)", type: "url", placeholder: "https://…", help: "Optional. Reviews are read blind; this is only used if we need it." },
  { name: "name", label: "Your name", type: "text", placeholder: "First and last", help: "Hidden during our blind review — used only if your pitch is accepted." },
  { name: "email", label: "Contact email", type: "email", placeholder: "you@example.com", required: true, help: "Kept private. We only use it to reply about your pitch." },
];
