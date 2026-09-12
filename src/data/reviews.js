// Books on this list that have a review on Ramyan Reviews.
//
// Kept as a hand-maintained map rather than fetched: there are five of them,
// the review site is statically built, and a cross-site request at runtime
// would be a lot of machinery for one line of metadata. Add a slug here when a
// new book review goes up.

export const REVIEWS_ORIGIN = "https://ramyan-reviews.vercel.app";

/** book id (see books.js slugify) -> review slug */
const reviewSlugs = {
  "kafka-on-the-shore-haruki-murakami": "kafka-on-the-shore",
  "the-bell-jar-sylvia-plath": "the-bell-jar",
  "the-blade-itself-joe-abercrombie": "the-blade-itself",
  "the-picture-of-dorian-gray-oscar-wilde": "the-picture-of-dorian-gray",
  "the-setting-sun-osamu-dazai": "the-setting-sun",
};

export const reviewUrl = (bookId) =>
  reviewSlugs[bookId] ? `${REVIEWS_ORIGIN}/reviews/${reviewSlugs[bookId]}` : null;

export const hasReview = (bookId) => bookId in reviewSlugs;
