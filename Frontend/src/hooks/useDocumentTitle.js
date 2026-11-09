import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} — CineAtlas` : 'CineAtlas — Discover Something Great';
  }, [title]);
};
