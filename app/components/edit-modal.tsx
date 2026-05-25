"use client";

import type { FormEvent, ReactNode } from "react";

export function EditModal({
  title,
  open,
  onClose,
  onSubmit,
  children,
  submitLabel = "Save changes",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel?: string;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <dialog className="modal" open aria-labelledby="edit-modal-title" onClick={(e) => e.stopPropagation()}>
        <header className="modal__head">
          <h2 id="edit-modal-title">{title}</h2>
          <button className="modal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <form className="modal__form" onSubmit={onSubmit}>
          <div className="form-grid">{children}</div>
          <footer className="modal__foot">
            <button className="btn btn--secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" type="submit">
              {submitLabel}
            </button>
          </footer>
        </form>
      </dialog>
    </div>
  );
}
