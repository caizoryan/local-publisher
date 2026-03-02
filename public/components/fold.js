import { memo, reactive } from "../chowk.js";
import { dom } from "../dom.js";
import { drag } from "../drag.js";
import { V } from "../schema.js";
import { getNodeLocation } from "../state.js";
import { dataR } from "./index.js";


export let Fold = {
	id: "fold",
	inputs: {
		lines: V.array([[8, 14], [14, 72]]),
		width: V.number(80),
		height: V.number(300),
	},
	outputs: {},
	render: (node, i, updateOut) => {
		let r = dataR(getNodeLocation(node.id), node.id);
		let lines = r("lines");
		let width = r("width");
		let height = r("height");

		let update = reactive(0)

		let linesEls = memo(() => {
			return lines.value().map(([a, b]) =>
				['line', {
					x1: 0, x2: width.value(), y1: a, y2: b,
					stroke: 'black',
					"stroke-width": 2,
				}]
			)
		}, [lines, update])

		let markers = memo(() => {
			return lines.value().map(([a, b], i) => {
				let top = reactive(a)
				let el = dom(['.marker',
					{
						style: memo(() => `
					position: absolute;
					top: ${top.value()}px;
					left: -10px;
					background: yellow;
					`, [top])
					},
					top
				])

				setTimeout(() => {
					drag(el, {
						set_left: () => null,
						set_top: (y) => {
							top.next(Math.floor(y))
							lines.value()[i][0] = Math.floor(y)
							update.next(e => e + 1)
						}
					})
				}, 150)

				return el
			})
		}, [lines])

		let paper = dom(['div', {
			style: memo(() => `
				background-color: #ddd;
				border: 2px solid black;
				width: ${width.value()}px;
				height: ${height.value()}px;
			`, [height, width])
		}, ['svg', {
			width, height,
		}, linesEls], markers])

		return [paper];
	},
	transform: (props, _props) => {
		let key = _props.key ? _props.key : 'value'
		let obj = {}
		obj[key] = props.value
		return obj
	},
};
