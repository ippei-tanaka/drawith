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
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    }
  });

  const commitName = (layerId: string, name: string) => {
    const nextName = name.trim();
    if (nextName) dispatch(renameLayer({ id: layerId, name: nextName }));
  };

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
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
      clearHoldTimer();
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
      onContextMenu={openMenu}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        clearHoldTimer();
        holdTimerRef.current = setTimeout(() => openMenu(event), 550);
      }}
      onPointerUp={clearHoldTimer}
      onPointerCancel={clearHoldTimer}
      onPointerLeave={clearHoldTimer}
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

      <span 
        className="bly-layer-visibility"
        role="button"
        tabIndex={0}
        aria-label={visible ? `Hide ${name}` : `Show ${name}`}
        onClick={(e) => {
          e.stopPropagation();
          dispatch(setLayerVisibility({ id, visible: !visible }));
        }}>
        {visible 
        ? <Image src="/eye-open.svg" alt="Layer visible" aria-label="Layer visible" width={16} height={16} /> 
        : <Image src="/eye-closed.svg" alt="Layer hidden" aria-label="Layer hidden" width={16} height={16} /> }
      </span>

      {isMenuOpen && (
        <div
          className="bly-layer-menu"
          ref={menuRef}
          role="menu"
          aria-label={`${name} layer actions`}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button type="button" role="menuitem" onClick={() => { setIsMenuOpen(false); setIsEditingName(true); }}>Rename Layer</button>
          <label className="bly-layer-opacity" role="menuitem">
            <span>Change Opacity</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layer.opacity}
              aria-label="Layer opacity"
              onChange={(event) => dispatch(setLayerOpacity({ id, opacity: Number(event.target.value) }))}
            />
            <span>{Math.round(layer.opacity * 100)}%</span>
          </label>
          <button type="button" role="menuitem" onClick={() => { dispatch(clearLayer({ id })); setIsMenuOpen(false); }}>Clear</button>
          <button type="button" role="menuitem" onClick={() => { setIsMenuOpen(false); onDelete(layer); }}>Delete Layer</button>
        </div>
      )}
    </div>
  )
}