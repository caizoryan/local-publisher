import { Color, CSSTransform, isRectContained, isRectIntersecting, Transform } from "../block.js";
import { memo } from "../chowk.js";
import { dom } from "../dom.js";
import { drag } from "../drag.js";
import { getNodeLocation, state, store } from "../state.js";
import { dataR, getProps, R } from "./index.js";

let groupTitleLabel = (group) => {
	let location = getNodeLocation(group.id);
	let r = R(location, group.id);
	let label = r("label");

	let editingLabel = reactive(false);
	let textLabel = () => ["h4", {
		onclick: () => {
			editingLabel.next(true);
		},
	}, label];
	let editLabel = () => ["div", ["input", {
		oninput: (e) => {
			label.next(e.target.value);
		},
		onkeydown: (e) => {
			if (e.key == "Enter") editingLabel.next(false);
			if (e.key == "Escape") editingLabel.next(false);
		},
		value: label,
	}], button("set", () => editingLabel.next(false))];

	let title = dom([
		".label",
		memo(() => editingLabel.value() ? editLabel() : textLabel(), [
			editingLabel,
		]),
	]);

	return title;
};

// ------------------
// Block and Group El
// ------------------
//
export function GroupElement(group) {
	// Convert From  v3 to v2 incase
	let r = R(getNodeLocation(group.id), group.id);
	let anchored = [];

	let left = r("x");
	let top = r("y");
	let color = r("color");
	let height = r("height");
	let width = r("width");


	let style = memo(
		() => CSSTransform(left, top, width, height) + Color(color.value()),
		[left, top, width, height, color],
	);

	let onstart = (e) => {
		state.selected.next([]);
		//
		// saves this location for undo
		store.startBatch();

		if (!e.metaKey) {
			store.get(["data", "nodes"]).forEach((e, i) => {
				let fn = isRectIntersecting;
				if (e.type == "group") fn = isRectContained;

				if (
					fn(
						Transform(
							left.value(),
							top.value(),
							width.value(),
							height.value(),
						),
						e,
					)
				) {
					let item = {
						blockLocation: ["data", "nodes", i],
						position: { x: e.x, y: e.y },
						offset: {
							x: e.x - left.value(),
							y: e.y - top.value(),
						},
					};
					anchored.push(item);
				}
			});

			anchored.forEach((e, i) => {
				store.tr(e.blockLocation, "set", ["x", e.position.x]);
				store.tr(e.blockLocation, "set", ["y", e.position.y]);
			});
		} else {
			left.next(left.value());
			top.next(top.value());
			width.next(width.value());
			height.next(height.value());
		}

		store.endBatch();
		store.pauseTracking();
	};

	let onend = () => {
		store.resumeTracking();
		anchored = [];
	};


	// let edges = resizers(left, top, width, height, { onstart, onend });
	// let connectionEdges = connectors(group, left, top, width, height);
	let el = dom(
		".draggable.group",
		{ style },
		// colorBars(group, removeButton()),
		// groupTitleLabel(group),
		// ...edges,
		// ...connectionEdges,
	);

	setTimeout(() => {
		drag(el, {
			onstart,
			onend,
			set_position: (x, y) => {
				left.next(x);
				top.next(y);

				anchored.forEach((e) => {
					store.tr(e.blockLocation, "set", ["x", x + e.offset.x]);
					store.tr(e.blockLocation, "set", ["y", y + e.offset.y]);
				});
			},
		});
	}, 50);

	return el;
}
