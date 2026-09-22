"use client";

// import { router } from "better-auth/api";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { changeBoardNamebyId } from "@/actions/board-actions";
import { useRouter } from "next/navigation";
import { Board, deleteBoardById } from "@/actions/board-actions";

export function BoardHeader({ board }: { board: Board })
{
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isChangeDisplayNamePopupOpen, setIsChangeDisplayNamePopupOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(board.display_name);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"></span>
          <span></span>
        </div>
        <div className="room-title">
          <span className="room-dot" />
          <span>{board.display_name}</span>
        </div>
        <div className="top-actions">
          <div className="gear-menu" ref={menuRef}>
            <button
              className="gear-button"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
            <Image src="/gear.svg" alt="Board options" width={20} height={20} />
            </button>
            {isMenuOpen && (
              <div className="gear-dropdown" role="menu">
                <button
                  className="gear-dropdown-item"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    setIsChangeDisplayNamePopupOpen(true);
                  }}
                >
                  Change board name
                </button>
                {/* <button
                  className="gear-dropdown-item"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                  }}
                >
                  Share board
                </button> */}
                <button
                  className="gear-dropdown-item gear-dropdown-item-danger"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    setIsDeletePopupOpen(true);
                  }}
                >
                  Delete board
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {isDeletePopupOpen && (
        <div className="popup-background">
          <div className="popup">
            <div className="board-form">
              <p className="board-form-message">Are you sure you want to delete the board "<span className="text-bold">{board.display_name}</span>"?</p>
              <div className="button-container">
                <button className="cancel-button" onClick={() => setIsDeletePopupOpen(false)}>Cancel</button>
                <button className="delete-button invite-button-danger" onClick={async () => { 
                  setIsDeletePopupOpen(false); 
                  await deleteBoardById(board.id);
                  router.push(`/dashboard`); 
                }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isChangeDisplayNamePopupOpen && (
        <div className="popup-background">
          <div className="popup">
            <div className="board-form">
              <p className="board-form-message">Change the display name of the board "<span className="text-bold">{board.display_name}</span>":</p>
              <input
                type="text"
                className="board-form-input"
                defaultValue={board.display_name}
                onChange={(e) => setNewDisplayName(e.target.value)}
              />
              <div className="button-container">
                <button className="cancel-button" onClick={() => setIsChangeDisplayNamePopupOpen(false)}>Cancel</button>
                <button className="save-button" onClick={async () => {
                  setIsChangeDisplayNamePopupOpen(false);
                  await changeBoardNamebyId(board.id, newDisplayName);
                  router.refresh();
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
