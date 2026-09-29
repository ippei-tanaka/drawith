import { useSortable } from '@dnd-kit/react/sortable';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  clearLayer,
  renameLayer,
  setActiveLayer,
  setLayerOpacity,
  setLayerVisibility,
} from "@/lib/store/boardSlice";
import type { Layer } from "@/lib/store/boardSlice";
import { BoardLayerPreview } from "./BoardLayerPreview";

export function BoardLayer (
  {layer, index, isActive, onDelete}: 
  {layer: Layer, index: number, isActive: boolean, onDelete: (layer: Layer) => void}) 
{
  const dispatch = useAppDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { id, name, visible } = layer;

  const {ref, isDragging, isDropTarget} = useSortable({
    id,
    index,
    type: 'layer',
    accept: 'layer',
    group: 'layers',
    data: {
      id,
      hasDropTarget: () => isDropTarget
    },
    disabled: isMenuOpen,
  });

  const commitName = (layerId: string, name: string) => {
    const nextName = name.trim();
    if (nextName) dispatch(renameLayer({ id: layerId, name: nextName }));
  };

  const openMenu = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dispatch(setActiveLayer(String(id)));
    setIsMenuOpen(true);
  };

  useEffect(() => {
    const closeMenuOnOutsidePointer = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeMenuOnOutsidePointer);
    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsidePointer);
    };
  }, []);

  return (
    <div 
      className={`
        bly-layer-item ${isDragging ? "bly-layer-dragging" : ""} 
        ${isDragging && !isDropTarget ? "bly-layer-has-no-drop-target" : ""}
        ${isActive ? "bly-layer-active" : ""}
      `}
      data-has-drop-target={isDropTarget}
      ref={ref}
      onClick={() => dispatch(setActiveLayer(String(id)))}
    >
      
      <BoardLayerPreview layer={layer} />
      
      {!isEditingName && 
        <span 
          className="bly-layer-name"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditingName(true);
          }}
          >{name}</span>
      }
      {isEditingName && 
        <input
          autoFocus
          className="bly-layer-name-input"
          defaultValue={name}
          onBlur={(event) => {
            commitName(id, event.currentTarget.value);
            setIsEditingName(false);
          }}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
            if (event.key === "Escape") setIsEditingName(false);
          }}
          aria-label={`Rename ${name}`}/>
      }

      <button
        className="bly-layer-menu-button"
        type="button"
        aria-label={`Open ${name} layer menu`}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        onClick={openMenu}
      >
        <span aria-hidden="true">...</span>
      </button>

      {isMenuOpen && (
        <div
          className="bly-layer-menu"
          ref={menuRef}
          role="menu"
          aria-label={`${name} layer actions`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button className="bly-layer-menu-item" type="button" role="menuitem" onClick={() => { setIsMenuOpen(false); setIsEditingName(true); }}>
            <Image src="/rename.svg" alt="" width={16} height={16} />
            Rename
          </button>
          <button
            className="bly-layer-visibility-menu-item"
            type="button"
            role="menuitem"
            onClick={() => {
              dispatch(setLayerVisibility({ id, visible: !visible }));
              setIsMenuOpen(false);
            }}
          >
            {visible
              ? <Image src="/eye-open.svg" alt="" width={16} height={16} />
              : <Image src="/eye-closed.svg" alt="" width={16} height={16} />}
            {visible ? "Hide" : "Show"}
          </button>
          <label className="bly-layer-opacity" role="menuitem">
            <span className="bly-layer-opacity-label">
              <Image src="/opacity.svg" alt="" width={16} height={16} />
              <span>Opacity</span>
            </span>
            <span className="bly-layer-opacity-value">{Math.round(layer.opacity * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layer.opacity}
              aria-label="Layer opacity"
              onChange={(event) => dispatch(setLayerOpacity({ id, opacity: Number(event.target.value) }))}
            />
          </label>
          <button className="bly-layer-menu-item" type="button" role="menuitem" onClick={() => { dispatch(clearLayer({ id })); setIsMenuOpen(false); }}>
            <Image src="/clean.svg" alt="" width={16} height={16} />
            Clear
          </button>
          <button className="bly-layer-menu-item" type="button" role="menuitem" onClick={() => { setIsMenuOpen(false); onDelete(layer); }}>
            <Image src="/trash.svg" alt="" width={16} height={16} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}