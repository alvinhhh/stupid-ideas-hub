const openers = [
  "Thanks for sharing the deck.",
  "We took a look at the materials.",
  "Appreciate you sending this over.",
  "We gave this a thoughtful review.",
  "Thank you for the update.",
];

const reasons = [
  "the market is still too early for our platform strategy",
  "we need to see stronger pull from an existing customer base",
  "the company feels a bit too ambitious for our current thesis",
  "we are focusing on categories with faster distribution loops",
  "the round is not a fit for us at this time",
];

const softeners = [
  "we would still love to stay in touch",
  "please keep us posted on progress",
  "we are cheering you on from the sidelines",
  "this may become interesting later",
  "feel free to send another update in a few months",
];

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

export function buildRejectionEmail(clickCount: number): { subject: string; body: string } {
  const opener = pick(openers, clickCount);
  const reason = pick(reasons, clickCount * 3 + 1);
  const softener = pick(softeners, clickCount * 5 + 2);

  return {
    subject: "Re: VC intro " + clickCount,
    body: [
      opener,
      "",
      "After discussion, we do not think this is the right investment for us because " + reason + ".",
      "",
      "That said, " + softener + ".",
      "",
      "Best,",
      "The Partner Team",
    ].join("\n"),
  };
}
