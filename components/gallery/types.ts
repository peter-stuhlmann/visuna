/** Shared types for reusable Gallery components */

export type GalleryItem = {
  id: string;
  src: string;
  width: number;
  height: number;
  label?: string;
  format?: string;
};

export type GalleryProps = {
  items: GalleryItem[];
  /** Currently selected (highlighted) item id */
  selectedId?: string;
  /** Called when an item is clicked */
  onSelect?: (id: string) => void;
  /** Show checkboxes on each item */
  selectable?: boolean;
  /** IDs of currently checked items */
  checkedIds?: string[];
  /** Toggle check on an item */
  onToggleCheck?: (id: string) => void;
  /** Return true to dim an item (e.g. when another is selected) */
  dimmedWhen?: (item: GalleryItem) => boolean;
  /** Gap between items in px (default: 8) */
  gap?: number;
};
