"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartLine = {
  key: string;
  itemId: string;
  variantId: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  variantEn: string;
  variantAr: string;
  unitHalalas: number | null;
  quantity: number;
  note: string;
  image: string | null;
};

type PriceIndexRow = { itemId: string; variantId: string; priceHalalas: number | null; available: boolean };

const STORAGE_KEY = "aj_cart_v1";
const MAX_QTY = 50;

/* ---- A tiny external store over localStorage so every tab and component stays in sync ---- */
let lines: CartLine[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const EMPTY: CartLine[] = [];

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    lines = Array.isArray(parsed) ? parsed.filter((l) => l && l.itemId && l.quantity > 0) : [];
  } catch {
    lines = [];
  }
}
function emit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: cart still works for this page view */
  }
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    load();
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}
const noopSubscribe = () => () => {};

function snapshot() {
  load();
  return lines;
}

export function lineKey(itemId: string, variantId: string, note: string) {
  return `${itemId}::${variantId}::${note.trim().toLowerCase()}`;
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  hasUnpriced: boolean;
  ready: boolean;
  isOpen: boolean;
  lastAdded: string | null;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "key" | "quantity"> & { quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  setNote: (key: string, note: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children, priceIndex }: { children: ReactNode; priceIndex: PriceIndexRow[] }) {
  const current = useSyncExternalStore(subscribe, snapshot, () => EMPTY);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // Re-price saved lines against the live menu; drop lines whose dish was removed or paused.
  useEffect(() => {
    load();
    const index = new Map(priceIndex.map((p) => [`${p.itemId}::${p.variantId}`, p]));
    let changed = false;
    const next = lines.flatMap((l) => {
      const p = index.get(`${l.itemId}::${l.variantId}`);
      if (!p || !p.available) {
        changed = true;
        return [];
      }
      if (p.priceHalalas !== l.unitHalalas) {
        changed = true;
        return [{ ...l, unitHalalas: p.priceHalalas }];
      }
      return [l];
    });
    if (changed) emit(next);
  }, [priceIndex]);

  const add: CartContextValue["add"] = useCallback((line) => {
    const note = line.note.trim();
    const key = lineKey(line.itemId, line.variantId, note);
    const qty = Math.max(1, Math.min(MAX_QTY, line.quantity ?? 1));
    const existing = lines.find((l) => l.key === key);
    const next = existing
      ? lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + qty) } : l))
      : [...lines, { ...line, note, key, quantity: qty }];
    emit(next);
    setLastAdded(key);
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) emit(lines.filter((l) => l.key !== key));
    else emit(lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)));
  }, []);

  const setNote = useCallback((key: string, note: string) => {
    const target = lines.find((l) => l.key === key);
    if (!target) return;
    const newKey = lineKey(target.itemId, target.variantId, note);
    const clash = lines.find((l) => l.key === newKey && l.key !== key);
    if (clash) {
      emit(
        lines
          .filter((l) => l.key !== key)
          .map((l) => (l.key === newKey ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + target.quantity) } : l)),
      );
    } else {
      emit(lines.map((l) => (l.key === key ? { ...l, note: note.slice(0, 200), key: newKey } : l)));
    }
  }, []);

  const remove = useCallback((key: string) => emit(lines.filter((l) => l.key !== key)), []);
  const clear = useCallback(() => emit([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    let subtotal = 0;
    let count = 0;
    let hasUnpriced = false;
    for (const l of current) {
      count += l.quantity;
      if (l.unitHalalas == null) hasUnpriced = true;
      else subtotal += l.unitHalalas * l.quantity;
    }
    return { lines: current, count, subtotal, hasUnpriced, ready, isOpen, lastAdded, open, close, add, setQuantity, setNote, remove, clear };
  }, [current, ready, isOpen, lastAdded, open, close, add, setQuantity, setNote, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
