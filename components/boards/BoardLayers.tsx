"use client";

import { type KeyboardEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addLayer, removeLayer, reorderLayers} from "@/lib/store/boardSlice";
import { BoardLayer } from './BoardLayer'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';

export function BoardLayers() 
{
	const dispatch = useAppDispatch();
	const layers = useAppSelector((state) => state.board.layers);

	const addNewLayer = () => {
		dispatch(addLayer());
	};

	const reorderOrRemoveLayer = (event: DragEndEvent) => {
		const {source} = event.operation;
		if (event.canceled || !isSortable(source)) return;
		if (source.data.hasDropTarget()) {
			dispatch(reorderLayers({ fromIndex: source.initialIndex, toIndex: source.index }));
		} else {
			dispatch(removeLayer(String(source.id)));
		}
	};

	return (
		<aside className="bly-layers-panel" aria-label="Layers">
			<div className="bly-layers-heading">
				<h2>Layers</h2>
				<button className="bly-layers-add-button" type="button" onClick={addNewLayer} aria-label="Add layer" title="Add layer">
					+
				</button>
			</div>

			<DragDropProvider onDragEnd={reorderOrRemoveLayer}>
				<div className="bly-layers-list">
					{layers.map((layer, index) => (
						<BoardLayer 
						key={layer.id} 
						id={layer.id}
						index={index} 
						name={layer.name} 
						visible={layer.visible}
						opacity={layer.opacity}
						/>
					))} 
				</div>
			</DragDropProvider>

			{/* BoardLayer component can be used here if needed
			<ul className="bly-layers-list">
				{layers.map((layer, layerIndex) => (
					<li
						className={`bly-layer-item ${layer.id === activeLayerId ? "bly-active" : ""}`}
						onPointerDown={(e) => {
							e.preventDefault();
							const timer = setTimeout(() => {
								// executeHoldAction(layer.id);
								console.log(`Hold action executed for layer: ${layer.id}`);
							}, holdDuration);
							holdTimers.set(layer.id, timer);
						}}
						onPointerUp={(e) => {
							e.preventDefault();
							const timer = holdTimers.get(layer.id);
							if (timer) {
								clearTimeout(timer);
								holdTimers.delete(layer.id);
								console.log(`Hold action cancelled for layer: ${layer.id}`);
							}
						}}
						onPointerLeave={(e) => {
							e.preventDefault();
							const timer = holdTimers.get(layer.id);
							if (timer) {
								clearTimeout(timer);
								holdTimers.delete(layer.id);
								console.log(`Hold action cancelled for layer: ${layer.id}`);
							}
						}}
						key={layer.id}
					>

						<div className="bly-layer-order-controls" aria-label={`Reorder ${layer.name}`}>
							<button
								className="bly-layer-order-button"
								type="button"
								disabled={layerIndex === 0}
								onClick={() => dispatch(reorderLayers({ fromIndex: layerIndex, toIndex: layerIndex - 1 }))}
								aria-label={`Move ${layer.name} up`}
								title="Move layer up"
							>
								^
							</button>
							<button
								className="bly-layer-order-button"
								type="button"
								disabled={layerIndex === layers.length - 1}
								onClick={() => dispatch(reorderLayers({ fromIndex: layerIndex, toIndex: layerIndex + 1 }))}
								aria-label={`Move ${layer.name} down`}
								title="Move layer down"
							>
								v
							</button>
						</div>

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
			 */}
		</aside>
	);
}
