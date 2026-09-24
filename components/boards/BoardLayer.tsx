import { useSortable } from '@dnd-kit/react/sortable';
import { useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  renameLayer,
  setActiveLayer,
  setLayerOpacity,
  setLayerVisibility,
} from "@/lib/store/boardSlice";

export function BoardLayer (
  {id, index, name, visible, opacity}: 
  {id: string, index: number, name: string, visible: boolean, opacity: number}) 
{
  const dispatch = useAppDispatch();
  const [isEditingName, setIsEditingName] = useState(false);
  const {ref, isDragging, isDropTarget} = useSortable({
    id,
    index,
    type: 'layer',
    accept: 'layer',
    group: 'layers',
    data: {
      id: 1,
      hasDropTarget: () => isDropTarget
    }
  });

  const commitName = (layerId: string, name: string) => {
    const nextName = name.trim();
    if (nextName) dispatch(renameLayer({ id: layerId, name: nextName }));
  };

  const toggleVisibility = () => {
    dispatch(setLayerVisibility({ id, visible: !visible }));
  };

  return (
    <div 
      className={`bly-layer-item ${isDragging ? "bly-layer-dragging" : ""} ${isDragging && !isDropTarget ? "bly-layer-has-no-drop-target" : ""}`}
      data-has-drop-target={isDropTarget}
      ref={ref}>
      
      <div className="bly-layer-preview">preview</div>
      
      {!isEditingName && 
        <span 
          className="bly-layer-name"
          onClick={() => setIsEditingName(true)}
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
        onClick={toggleVisibility}>
        {visible 
        ? <Image src="/eye-open.svg" alt="Layer visible" aria-label="Layer visible" width={16} height={16} /> 
        : <Image src="/eye-closed.svg" alt="Layer hidden" aria-label="Layer hidden" width={16} height={16} /> }
      </span>
    </div>
  );
}