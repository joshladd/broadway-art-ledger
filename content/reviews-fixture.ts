import type { PortableTextBlock } from "@portabletext/types";
import type { Review } from "./review";

// Mock data for building the finalized design before Sanity is wired (Plan 2).
// Bodies are Portable Text so the renderer is real from day one — Plan 2 only
// swaps the source, never the shape.
//
// The prose and art are the existing CC0 seed set. Run dates and show URLs are
// FABRICATED scaffolding: this fixture is development-only and must never be
// mistaken for real content. Image dimensions are the assets' true pixel sizes.

let seq = 0;
// Minimal Portable Text paragraph builder — mirrors what Sanity emits.
function p(text: string): PortableTextBlock {
  seq += 1;
  return {
    _type: "block",
    _key: `b${seq}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${seq}`, text, marks: [] }],
  } as unknown as PortableTextBlock;
}

export const fixtureReviews: Review[] = [
  {
    slug: "toulouse-lautrec-night-work",
    headline: "Toulouse-Lautrec: Night Work",
    showName: "The Morgan Library & Museum",
    startDate: "2026-05-15",
    endDate: "2026-06-13",
    showUrl: "https://www.themorgan.org/",
    publishedAt: "2026-07-11T09:00:00.000Z",
    body: [
      p("Everyone remembers the crowd, but the painting belongs to the woman shoved half out of the frame at right, her face lit acid green by unseen footlights. She is the reason to make the trip. Lautrec painted Montmartre from the inside — he practically lived at the Moulin Rouge — and he refuses to sell it to us as spectacle. The dancers are off the clock. The drinkers look bored."),
      p("The Morgan's hang leans into the cropping, and it pays off. What reads at first as loose reportage is really composition as ambush. Lautrec cuts the bodies at the balustrade so the eye can never quite come to rest; the diagonal rail shoves you into the room whether you like it or not; and the whole machine is built to deposit you, finally, on that ghoulish, gorgeous, gaslit face."),
      p("The wall text wants to talk about absinthe and decadence, the usual Montmartre package. Ignore it. What Lautrec understood is that entertainment is labor, and that the people who perform intimacy for money are the most watched and least seen figures in modern life. He watched them. He saw them. This small, sharp show lets you do the same."),
    ],
    image: {
      url: "/art/art-01.jpg",
      width: 1000,
      height: 874,
      alt: "Nightlife scene at the Moulin Rouge with figures around a table and a woman's green-lit face in the foreground.",
      caption: "Henri de Toulouse-Lautrec, At the Moulin Rouge, 1892–95. Public domain, Art Institute of Chicago.",
    },
  },
  {
    slug: "van-gogh-in-arles",
    headline: "Van Gogh in Arles",
    showName: "The Metropolitan Museum of Art",
    startDate: "2026-05-02",
    endDate: "2026-05-24",
    showUrl: "https://www.metmuseum.org/",
    publishedAt: "2026-07-04T09:00:00.000Z",
    tagline: "A room painted by someone desperate to believe in rest.",
    body: [
      p("The tilt is the tell. The floor pitches forward, the back wall refuses to meet its neighbors at any angle a builder would recognize, the two chairs sit at odds like people who have quarreled — and yet Van Gogh insisted, in letter after letter, that this picture was about rest. It is the most strenuous calm ever committed to canvas."),
      p("That blue is not the blue of a restful room; it is a blue with its jaw set. The bed is a slab of chrome yellow. The blanket is a red so saturated it reads less as bedding than as a held breath. Van Gogh believed color could do the work of sedation. He was wrong, and the wrongness is the painting's whole achievement: you feel him wanting the calm so badly that the wanting becomes the subject."),
      p("The Met surrounds it with the correspondence, which is either generous or a crutch, depending on your patience for biography. My advice is to skip the vitrines on the first pass. The painting says everything the letters do, in brushwork laid down with a carpenter's insistence that if the room is only built solidly enough it might finally hold still. It doesn't. That is the point."),
    ],
    image: {
      url: "/art/art-02.jpg",
      width: 1000,
      height: 783,
      alt: "Van Gogh's bedroom in Arles with blue walls, red blanket, yellow bed and wooden furniture in bold flat color.",
      caption: "Vincent van Gogh, The Bedroom, 1889. Public domain, Art Institute of Chicago.",
    },
  },
  {
    slug: "the-face-in-the-glass",
    headline: "The Face in the Glass",
    showName: "Brooklyn Museum",
    startDate: "2025-12-10",
    endDate: "2026-01-20",
    showUrl: "",
    publishedAt: "2026-06-27T09:00:00.000Z",
    body: [
      p("Van Gogh painted himself compulsively — more than thirty times in two years — for the least romantic of reasons: models cost money and a mirror is free. Keep that in mind at the Brooklyn Museum, where the 1887 head hangs among four centuries of people arranging their own faces for posterity. It cuts through the room like a slap."),
      p("What is happening here is the moment the borrowed becomes his own. Van Gogh had arrived in Paris and swallowed Impressionism whole; you can see the flickering, divided brushwork he lifted from the younger painters. But where they used the technique to dissolve a haystack into light, he turns it into weather. The blue-green background churns like a sky about to do something violent, and the face — ginger-bearded, hollow-cheeked, wary — holds against it, gathered out of the same nervous strokes yet refusing to come apart."),
      p("Hang it beside so much careful self-presentation — the powdered courtiers, the practiced three-quarter turns — and Van Gogh's refusal to flatter reads as sheer nerve. He is not asking to be liked. He is checking, with a kind of grim curiosity, whether the man in the glass is still there, still holding, still worth the paint. He was, and this is the portrait that knows it."),
    ],
    image: {
      url: "/art/art-03.jpg",
      width: 640,
      height: 816,
      alt: "Van Gogh self-portrait with red beard against a swirling blue-green background of short brushstrokes.",
      caption: "Vincent van Gogh, Self-Portrait, 1887. Public domain, Art Institute of Chicago.",
    },
  },
];
