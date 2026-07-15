// Shared content layer — every theme reads from here. This is the "backend" for now;
// swap for a real DB/CMS later without touching any theme.

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
    no: "№ 001", date: "07.11.26", iso: "2026-07-11", section: "Painting",
    title: "Toulouse-Lautrec: Night Work",
    venue: "The Morgan Library & Museum", hood: "Murray Hill", by: "Coleman Reyes",
    dek: "The green-lit face shoved to the edge is the whole argument.",
    body: [
      "Everyone remembers the crowd, but the painting belongs to the woman half out of the frame at right, her face lit acid green by unseen footlights. Lautrec paints Montmartre not as spectacle but as labor — the dancers, the drinkers, the artist himself glimpsed small in the back. Nobody performs for us. They are all too tired.",
      "The Morgan’s hang leans into the cropping, and it pays off. What reads at first as reportage is really composition as ambush: Lautrec cuts bodies at the rail so the eye can’t settle, then pins it to that ghoulish, gorgeous face. It is the most modern thing in the room, and it was made in a basement full of smoke over a century ago.",
    ],
    image: "/art/art-01.jpg",
    artist: "Henri de Toulouse-Lautrec", artwork: "At the Moulin Rouge",
    credit: "Henri de Toulouse-Lautrec, At the Moulin Rouge, 1892–95. Public domain, Art Institute of Chicago.",
    alt: "Nightlife scene at the Moulin Rouge with figures around a table and a woman’s green-lit face in the foreground.",
  },
  {
    slug: "van-gogh-in-arles",
    no: "№ 002", date: "07.04.26", iso: "2026-07-04", section: "Painting",
    title: "Van Gogh in Arles",
    venue: "The Metropolitan Museum of Art", hood: "Upper East Side", by: "June Tanaka",
    dek: "A room painted by someone desperate to believe in rest.",
    body: [
      "The tilt is the tell. The floor pitches, the walls won’t quite meet, the chairs sit at odds — and yet Van Gogh insisted this picture was about calm. “The Bedroom” is the sound of a man talking himself into a peace he does not have, in colors turned up past the point of comfort: that blue, that chrome-yellow bed, the red blanket like a held breath.",
      "The Met surrounds it with the letters, which is either generous or a crutch depending on your patience for biography. Skip them. The painting says everything the letters do and says it in paint you could set your watch by. It is not restful. It is a picture of wanting to rest, which is harder, and better.",
    ],
    image: "/art/art-02.jpg",
    artist: "Vincent van Gogh", artwork: "The Bedroom",
    credit: "Vincent van Gogh, The Bedroom, 1889. Public domain, Art Institute of Chicago.",
    alt: "Van Gogh’s bedroom in Arles with blue walls, red blanket, yellow bed and wooden furniture in bold flat color.",
  },
  {
    slug: "the-face-in-the-glass",
    no: "№ 003", date: "06.27.26", iso: "2026-06-27", section: "Portraiture",
    title: "The Face in the Glass",
    venue: "Brooklyn Museum", hood: "Prospect Heights", by: "Marcus Bell",
    dek: "Thirty self-portraits in two years; this is the one that stops lying.",
    body: [
      "Van Gogh painted himself compulsively because models cost money and mirrors don’t. The 1887 head here, marooned in a storm of blue-green dashes, is the moment the borrowed technique becomes his own. The Impressionist flicker he picked up in Paris turns into weather — the background churns, the face holds.",
      "The Brooklyn Museum’s thematic hang, self-portraits across four centuries, mostly flatters this one by contrast. Beside so much careful self-presentation, Van Gogh’s refusal to flatter reads as nerve. He is not asking to be liked. He is checking whether he is still there.",
    ],
    image: "/art/art-03.jpg",
    artist: "Vincent van Gogh", artwork: "Self-Portrait",
    credit: "Vincent van Gogh, Self-Portrait, 1887. Public domain, Art Institute of Chicago.",
    alt: "Van Gogh self-portrait with red beard against a swirling blue-green background of short brushstrokes.",
  },
  {
    slug: "renoir-on-the-terrace",
    no: "№ 004", date: "06.20.26", iso: "2026-06-20", section: "Painting",
    title: "Renoir: On the Terrace",
    venue: "The Metropolitan Museum of Art", hood: "Upper East Side", by: "Priya Anand",
    dek: "Sweetness this aggressive is a position, not an accident.",
    body: [
      "It is easy to dismiss Renoir as the painter of chocolate-box charm, and “Two Sisters” hands the skeptic every weapon: the rosy cheeks, the basket of yarn like fallen fruit, the wall of foliage doing Impressionist somersaults. But look how hard the picture works. The older girl’s blue is a manufactured blue, chemical and new; the flowers on the hat are almost violent.",
      "Given a quiet room and good light, the painting’s real subject surfaces: not innocence but its display. Renoir is selling a mood, knowingly, to a Paris that wanted it. That is not a lesser ambition. It is a more honest one than the halo we usually deny him.",
    ],
    image: "/art/art-04.jpg",
    artist: "Pierre-Auguste Renoir", artwork: "Two Sisters (On the Terrace)",
    credit: "Pierre-Auguste Renoir, Two Sisters (On the Terrace), 1881. Public domain, Art Institute of Chicago.",
    alt: "Two young sisters on a terrace, one in a blue dress with a red flowered hat, amid lush greenery.",
  },
  {
    slug: "whistler-nocturnes",
    no: "№ 005", date: "06.13.26", iso: "2026-06-13", section: "Painting",
    title: "Whistler: Nocturnes",
    venue: "The Frick Collection", hood: "Upper East Side", by: "Dov Frankel",
    dek: "A painting that dares you to admit almost nothing is happening.",
    body: [
      "Whistler called his harbor scenes “nocturnes” to borrow music’s permission to be about nothing but mood, and this blue-and-gold twilight is his best evidence. Boats dissolve. The horizon is a rumor. A few gold flecks — a lamp, a spark — keep the whole thing from sliding into pure abstraction, which is plainly where his heart wanted to go.",
      "Hung low and lit gently at the Frick, it asks the one thing museums rarely grant: time to watch almost nothing resolve into everything. Ruskin accused Whistler of flinging paint in the public’s face. Ruskin was wrong, but you can see why he panicked. This is a picture betting its whole life on atmosphere, and winning.",
    ],
    image: "/art/art-05.jpg",
    artist: "James McNeill Whistler", artwork: "Nocturne: Blue and Gold—Southampton Water",
    credit: "James McNeill Whistler, Nocturne: Blue and Gold—Southampton Water, 1872. Public domain, Art Institute of Chicago.",
    alt: "Twilight harbor nocturne in muted blue and gold with distant boats and a low glowing horizon.",
  },
  {
    slug: "the-painted-curtain",
    no: "№ 006", date: "06.06.26", iso: "2026-06-06", section: "Old Masters",
    title: "The Painted Curtain",
    venue: "The Leiden Collection", hood: "Upper East Side", by: "Alina Costa",
    dek: "The blue curtain is the painting; the flowers are the excuse.",
    body: [
      "Van der Spelt paints a garland of flowers, then paints a blue silk curtain half-drawn across it — a curtain that is, of course, also paint. The gag is ancient (Zeuxis and Parrhasius, the curtain that fooled the painter) and he executes it with a straight face and unnerving skill. You reach, mentally, to pull the cloth.",
      "This tiny survey of Dutch trompe-l’oeil makes a sly case that illusionism was the seventeenth century’s conceptual art: paintings about painting, wearing the costume of mere décor. The flowers are gorgeous and beside the point. The subject is your own eye, caught in the act of believing.",
    ],
    image: "/art/art-06.jpg",
    artist: "Adriaen van der Spelt", artwork: "Trompe-l’Oeil Still Life with a Flower Garland and a Curtain",
    credit: "Adriaen van der Spelt, Trompe-l’Oeil Still Life with a Flower Garland and a Curtain, 1658. Public domain, Art Institute of Chicago.",
    alt: "Trompe-l’oeil still life of a flower garland behind a blue silk curtain drawn half across the panel.",
  },
  {
    slug: "hokusai-thirty-six-views",
    no: "№ 007", date: "05.30.26", iso: "2026-05-30", section: "Prints",
    title: "Hokusai: Thirty-Six Views",
    venue: "Japan Society", hood: "Turtle Bay", by: "Hana Okafor",
    dek: "The most reproduced image on earth, seen as if for the first time.",
    body: [
      "You have seen “The Great Wave” on tote bags, phone cases, and the inside of your own eyelids, which is exactly the problem this show has to solve. Japan Society solves it by hanging it small and in sequence, one of thirty-six views, so the wave stops being a logo and becomes what it is: a print about Mount Fuji, in which the mountain is nearly the last thing you notice.",
      "Up close the blue does the work — Prussian blue, then a shocking new import, gridded into the water’s claws. The fishermen crouch, doomed or fine, we never learn. Hokusai was seventy and signing himself “the old man mad about painting.” The wave has outlived even its own fame, which this modest, rigorous hang briefly lets you forget.",
    ],
    image: "/art/art-07.jpg",
    artist: "Katsushika Hokusai", artwork: "Under the Wave off Kanagawa (The Great Wave)",
    credit: "Katsushika Hokusai, Under the Wave off Kanagawa (The Great Wave), 1830/33. Public domain, Art Institute of Chicago.",
    alt: "Hokusai woodblock of a great cresting blue wave with white claws of foam and Mount Fuji beyond.",
  },
  {
    slug: "stieglitz-hand-of-man",
    no: "№ 008", date: "05.23.26", iso: "2026-05-23", section: "Photography",
    title: "Stieglitz: The Hand of Man",
    venue: "International Center of Photography", hood: "Essex Crossing", by: "Sam Whitfield",
    dek: "Stieglitz argued photography was art by photographing a train.",
    body: [
      "In 1902 the question was whether a machine could make art, and Stieglitz answered with a picture of another machine: a locomotive steaming into a rail yard, all haze and wet track and industrial melancholy. “The Hand of Man” is a manifesto disguised as a mood. He printed the smoke like charcoal, dodged the sky into weather, and dared you to call it merely mechanical.",
      "ICP frames it as the opening shot of a war Stieglitz spent his life winning. The irony he engineers — the hand of man everywhere and nowhere, no human in sight — still lands. So does the silvery, deliberate beauty. He wanted photography taken seriously. Looking at this, you cannot remember why it was ever in doubt.",
    ],
    image: "/art/art-08.jpg",
    artist: "Alfred Stieglitz", artwork: "The Hand of Man",
    credit: "Alfred Stieglitz, The Hand of Man, 1902, printed 1920/39. Public domain, Art Institute of Chicago.",
    alt: "Atmospheric photograph of a steaming locomotive in a rail yard under a hazy sky, in silvery gray tones.",
  },
];

export function getReview(slug: string): Review | undefined {
  return reviews.find((r) => r.slug === slug);
}

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
  { name: "email", label: "Contact email", type: "email", placeholder: "you@example.com", required: true, help: "Kept private. We only use it to reply about your pitch." },
];
