"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { addLayer, clearErrors, removeLayer, reorderLayers} from "@/lib/store/boardSlice";
import type { Layer } from "@/lib/store/boardSlice";
import { BoardLayer } from './BoardLayer'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { Popup } from "../Popup";
import "@/styles/board/board-layers.css";

export function BoardLayers() 
{
	const dispatch = useAppDispatch();
	const layers = useAppSelector((state) => state.board.layerStack.layers);
	const activeLayerId = useAppSelector((state) => state.board.layerStack.activeLayerId);
	const errors = useAppSelector((state) => state.board.errors);
	const [layerToDelete, setLayerToDelete] = useState<Layer | null>(null);

	const addNewLayer = () => {
		dispatch(addLayer());
	};

	const reorderOrRemoveLayer = (event: DragEndEvent) => {
		const {source, target} = event.operation;
		if (event.canceled || !isSortable(source)) return;
		if (source.data.hasDropTarget()) {
			const reversedFromIndex = layers.length - 1 - source.initialIndex;
			const reversedToIndex = layers.length - 1 - source.index;
			dispatch(reorderLayers({ fromIndex: reversedFromIndex, toIndex: reversedToIndex }));
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
					{layers.toReversed().map((layer, index) => (
						<BoardLayer 
							key={layer.id} 
							layer={layer}
							index={index} 
							isActive={layer.id === activeLayerId}
							onDelete={setLayerToDelete}
							/>
					))} 
				</div>
			</DragDropProvider>

			<Popup isOpen={!!layerToDelete} onClickBackground={() => setLayerToDelete(null)}>
				<div className="bly-board-form">
					<p className="bly-board-form-message">Do you want to delete the layer "<span className="bly-text-bold">{layerToDelete?.name}</span>"?</p>
					<div className="bly-button-container">
						<button className="orange-filled-button" onClick={async () => {
							setLayerToDelete(null);
							dispatch(removeLayer({ id: String(layerToDelete?.id) }));
						}}>Delete</button>
						<button className="blue-blank-button" onClick={() => setLayerToDelete(null)}>Cancel</button>
					</div>
				</div>
			</Popup>

			<Popup isOpen={errors.length > 0} onClickBackground={() => dispatch(clearErrors())}>
				<div className="bly-board-form">
					<p className="bly-board-form-message">{errors.map((error) => error.message).join("\n")}</p>
					<div className="bly-button-container-single">
						<button className="blue-filled-button" onClick={() => dispatch(clearErrors())}>OK</button>
					</div>
				</div>
			</Popup>

		</aside>
	);
}
