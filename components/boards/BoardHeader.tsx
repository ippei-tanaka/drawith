"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { changeBoardNamebyId } from "@/actions/board-actions";
import { useRouter } from "next/navigation";
import { Board, deleteBoardById } from "@/actions/board-actions";
import { Popup } from "@/components/Popup";
import "@/styles/board/board-header.css";

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
      <header className="bhd-topbar">
        <div className="bhd-brand">
          <span className="bhd-brand-mark"></span>
          <span></span>
        </div>
        <div className="bhd-room-title">
          <span className="bhd-room-dot" />
          <span>{board.display_name}</span>
        </div>
        <div className="bhd-top-actions">
          <div className="bhd-gear-menu" ref={menuRef}>
            <button
              className="bhd-gear-button"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
            <Image src="/gear.svg" alt="Board options" width={20} height={20} />
            </button>
            {isMenuOpen && (
              <div className="bhd-gear-dropdown" role="menu">
                <button
                  className="bhd-gear-dropdown-item"
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
                  className="bhd-gear-dropdown-item"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                  }}
                >
                  Share board
                </button> */}
                <button
                  className="bhd-gear-dropdown-item bhd-gear-dropdown-item-danger"
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
      
      <Popup isOpen={isDeletePopupOpen} onClickBackground={() => setIsDeletePopupOpen(false)}>
        <div className="bhd-board-form">
          <p className="bhd-board-form-message">Are you sure you want to delete the board "<span className="bhd-text-bold">{board.display_name}</span>"?</p>
          <div className="bhd-button-container">
            <button className="orange-filled-button" onClick={async () => {
              setIsDeletePopupOpen(false); 
              await deleteBoardById(board.id);
              router.push(`/dashboard`); 
            }}>Delete</button>
            <button className="blue-blank-button" onClick={() => setIsDeletePopupOpen(false)}>Cancel</button>
          </div>
        </div>
      </Popup>
      
      <Popup isOpen={isChangeDisplayNamePopupOpen} onClickBackground={() => setIsChangeDisplayNamePopupOpen(false)}>
        <div className="bhd-board-form">
          <p className="bhd-board-form-message">Change the display name of the board "<span className="bhd-text-bold">{board.display_name}</span>":</p>
          <input
            type="text"
            className="bhd-board-form-input"
            defaultValue={board.display_name}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />
          <div className="bhd-button-container">
            <button className="blue-filled-button" onClick={async () => {
              setIsChangeDisplayNamePopupOpen(false);
              await changeBoardNamebyId(board.id, newDisplayName);
              router.refresh();
            }}>Save</button>
            <button className="blue-blank-button" onClick={() => setIsChangeDisplayNamePopupOpen(false)}>Cancel</button>
          </div>
        </div>
      </Popup>
    </>
  );
}
