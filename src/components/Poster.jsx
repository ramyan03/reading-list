import { useState } from 'react';
import { category } from '../data/categories.js';
import { coverUrl } from '../data/covers.js';
import { posters } from '../data/posters.js';
import AbstractArt from './AbstractArt.jsx';
import { Icon } from './Icons.jsx';

/** Cover art for any item: Open Library for books, the fetched poster otherwise. */
export const artFor = (item, size = 'M') =>
  item.cat === 'book' ? coverUrl(item.coverId, size) : posters[item.id] ?? item.poster ?? null;

/**
 * The image, or when there is none (or it fails to load) generated abstract
 * art in the category colour, with the icon and title over it, so a missing
 * poster still reads as that thing rather than a grey hole.
 */
export default function Poster({ item, size, className = '', showTitle = true }) {
  const [failed, setFailed] = useState(false);
  const src = artFor(item, size);
  const cat = category(item.cat);

  return (
    <span className={`poster ${className}`} style={{ '--cat': cat?.color }}>
      {src && !failed ? (
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <>
          <AbstractArt item={item} />
          {showTitle && (
            <span className="poster-fallback">
              <Icon name={item.cat} size={18} />
              <span>{item.title}</span>
            </span>
          )}
        </>
      )}
    </span>
  );
}
