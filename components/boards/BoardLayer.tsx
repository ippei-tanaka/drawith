import { useSortable } from '@dnd-kit/react/sortable';
import { useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  renameLayer,
  setActiveLayer,
  setLayerVisibility,
} from "@/lib/store/boardSlice";
import type { Layer } from "@/lib/store/boardSlice";
import { BoardLayerPreview } from "./BoardLayerPreview";

export function BoardLayer (
  {layer, index, isActive}: 
  {layer: Layer, index: number, isActive: boolean}) 
{
  const dispatch = useAppDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
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
    </div>
  )
}