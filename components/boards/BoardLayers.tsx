"use client";

import { useState, type DragEvent, type KeyboardEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
	addLayer,
	removeLayer,
	renameLayer,
	reorderLayers,
	setActiveLayer,
	setLayerOpacity,
	setLayerVisibility,
} from "@/lib/store/boardSlice";

export function BoardLayers() 
{
	const dispatch = useAppDispatch();
	const layers = useAppSelector((state) => state.board.layers);
	const activeLayerId = useAppSelector((state) => state.board.activeLayerId);
	const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
	const [editingLayerId, setEditingLayerId] = useState<string | null>(null);

	const addNewLayer = () => {
		dispatch(addLayer(`Layer ${layers.length + 1}`));
	};

	const commitName = (layerId: string, name: string) => {
		const nextName = name.trim();
		if (nextName) dispatch(renameLayer({ id: layerId, name: nextName }));
		setEditingLayerId(null);
	};

	const handleDrop = (event: DragEvent<HTMLLIElement>, targetLayerId: string) => {
		event.preventDefault();
		if (!draggedLayerId || draggedLayerId === targetLayerId) return;

		const fromIndex = layers.findIndex((layer) => layer.id === draggedLayerId);
		const toIndex = layers.findIndex((layer) => layer.id === targetLayerId);
		dispatch(reorderLayers({ fromIndex, toIndex }));
		setDraggedLayerId(null);
	};

	const handleRenameKeyDown = (
		event: KeyboardEvent<HTMLInputElement>,
	) => {
		if (event.key === "Enter") event.currentTarget.blur();
		if (event.key === "Escape") setEditingLayerId(null);
	};

	return (
		<aside className="bly-layers-panel" aria-label="Layers">
			<div className="bly-layers-heading">
				<h2>Layers</h2>
				<button className="bly-layers-add-button" type="button" onClick={addNewLayer} aria-label="Add layer" title="Add layer">
					+
				</button>
			</div>

			<ul className="bly-layers-list">
				{layers.map((layer) => (
					<li
						className={`bly-layer-item ${layer.id === activeLayerId ? "bly-active" : ""} ${draggedLayerId === layer.id ? "bly-dragging" : ""}`}
						draggable
						key={layer.id}
						onDragStart={() => setDraggedLayerId(layer.id)}
						onDragEnd={() => setDraggedLayerId(null)}
						onDragOver={(event) => event.preventDefault()}
						onDrop={(event) => handleDrop(event, layer.id)}
					>
						<button
							className="bly-layer-drag-handle"
							type="button"
							aria-label={`Drag ${layer.name}`}
							title="Drag to reorder"
						>
							::
						</button>

						<button
							className="bly-layer-visibility"
							type="button"
							onClick={() => dispatch(setLayerVisibility({ id: layer.id, visible: !layer.visible }))}
							aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
							title={layer.visible ? "Hide layer" : "Show layer"}
						>
							{layer.visible ? "●" : "○"}
						</button>

						<button className="bly-layer-select" type="button" onClick={() => dispatch(setActiveLayer(layer.id))}>
							{editingLayerId === layer.id ? (
								<input
									autoFocus
									className="bly-layer-name-input"
									defaultValue={layer.name}
									onBlur={(event) => commitName(layer.id, event.currentTarget.value)}
									onClick={(event) => event.stopPropagation()}
									  onKeyDown={handleRenameKeyDown}
									aria-label={`Rename ${layer.name}`}
								/>
							) : (
								<span>{layer.name}</span>
							)}
						</button>

						<button
							className="bly-layer-rename"
							type="button"
							onClick={() => setEditingLayerId(layer.id)}
							aria-label={`Rename ${layer.name}`}
							title="Rename layer"
						>
							...
						</button>

						<button
							className="bly-layer-delete"
							type="button"
							onClick={() => dispatch(removeLayer(layer.id))}
							aria-label={`Delete ${layer.name}`}
							title="Delete layer"
						>
							x
						</button>

							<label className="bly-layer-opacity" title={`${Math.round(layer.opacity * 100)}% opacity`}>
							<input
								type="range"
								min="0"
								max="100"
								value={Math.round(layer.opacity * 100)}
								onChange={(event) => dispatch(setLayerOpacity({ id: layer.id, opacity: Number(event.target.value) / 100 }))}
								aria-label={`${layer.name} opacity`}
							/>
							<span>{Math.round(layer.opacity * 100)}%</span>
						</label>
					</li>
				))}
			</ul>
		</aside>
	);
}
