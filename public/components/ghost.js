import { button } from "../block.js";
import { memo, reactive } from "../chowk.js";
import { dom } from "../dom.js";
import { drag } from "../drag.js";
import { V } from "../schema.js";
import { getNodeLocation } from "../state.js";
import { dataR } from "./index.js";

function ghostRenderer(node, i, updateOut) {
	let r = dataR(getNodeLocation(node.id), node.id);
	let _r = dataR(getNodeLocation(node.id), node.id, '_data');
	let paragraphs = r("lines");
	let width = r("width");
	let rotate = r("rotate");
	let height = r("height");

	let currentSelected

	let addLine = () => {
		let l = paragraphs.value()
		paragraphs.next([
			...l,
			{
				x: Math.random()*500,
				y: Math.random()*500,
				text: "GRABLE GUCKING FORHBLASKJ"

			}
		])
	}

	let update = reactive(0)

	let rotateEl = ['input.number', {
		type: 'number',
		value: rotate,
		oninput: e => {
			rotate.next(parseFloat(e.target.value))
			updateOut()
		}
	}]


	let paragraphRenderer = (text, x, y, width, height, pos = 0) => {
		let el = dom(['.paragraph',
			{
				style: memo(() => `
						position: absolute;
						top: ${x.value()}px;
						left: ${y.value()}px;
				`, [x, y, height, width])
			},
			text
		])

		let setTop = v => {
			y.next(v)
			paragraphs.value()[i]['y'] = v
			updateOut()
			update.next(e => e + 1)
		}

		let setLeft = v => {
			x.next(v)
			paragraphs.value()[i]['x'] = v
			updateOut()
			update.next(e => e + 1)
		}

		setTimeout(() => {
			drag(el, {
				set_left: setLeft,
				set_top: setTop
			})
		}, 150)

		return el
	}
	let markers = memo(() => {
		let paras = paragraphs.value().map((p, i) => {
			let x = reactive(p.x)
			let y = reactive(p.y)
			let width = reactive(p.width)
			let height = reactive(p.height)
			let text = reactive(p.text)

			return paragraphRenderer(text, x, y, width, height, i, 1)
		})

		return paras
	}, [paragraphs])

	let paper = dom(['div', {
		style: memo(() => `
			margin-left: 30px;
			background-color: #6ecae7;
			border: 2px solid black;
			width: ${width.value() * scale.value()}px;
			height: ${height.value() * scale.value()}px;
		`, [height, width, scale])
	}, ['svg', {
		width: memo(() => width.value() * scale.value() - 2, [width, scale]),
		height: memo(() => height.value() * scale.value(), [height, scale]),
		}], markers,
	])

	return [
		{ },
		paper,
		button("add", addLine),
		rotateEl
	];
}

export let Ghost = {
	id: "ghost",
	inputs: {
		lines: V.array([[8, 14], [14, 72]]),
		letter: V.string(''),
		width: V.number(80),
		height: V.number(300),
		rotate: V.number(0),
		x: V.number(0),
		y: V.number(0),
		fill: V.string('white'),
		stroke: V.string('black'),
		strokeWeight: V.number(2),
		bounding: V.number(0),
	},
	outputs: {},
	render: (node, i, updateOut) => {
		let r = dataR(getNodeLocation(node.id), node.id);
		let _r = dataR(getNodeLocation(node.id), node.id, '_data');
		let lines = r("lines");
		let width = r("width");
		let rotate = r("rotate");
		let height = r("height");
		let scale = _r("scale");
		scale.next(scale.value() == undefined ? 1 : scale.value())

		let currentSelected

		let addLine = () => {
			let l = lines.value()
			lines.next([
				...l,
				[l[l.length - 1][0] + 1,
				l[l.length - 1][1] + 1],
			])
		}

		let removeLine = () => {
			let l = lines.value()
			lines.next(l.slice(0, l.length - 1))
		}

		let update = reactive(0)

		let rotateEl = ['input.number', {
			type: 'number',
			value: rotate,
			oninput: e => {
				rotate.next(parseFloat(e.target.value))
				updateOut()
			}
		}]

		let linesEls = memo(() => {
			return lines.value().map(([a, b]) =>
				['line', {
					x1: 0,
					x2: width.value() * scale.value(),
					y1: a * scale.value(),
					y2: b * scale.value(),
					stroke: 'black',
					"stroke-width": 2,
				}]
			)
		}, [lines, update, scale, width])

		let marker = (top, i, pos = 0) => {
			let el = dom(['.marker',
				{
					style: memo(() => `
							position: absolute;
							top: ${top.value() * scale.value()}px;
							left: ${pos == 0 ? 10 : (width.value() * scale.value()) + 40}px;
					`, [top, scale, width])
				},
				top
			])

			let setTop = y => {
				top.next(Math.floor(y / scale.value()))
				lines.value()[i][pos] = Math.floor(y / scale.value())
				updateOut()
				update.next(e => e + 1)
			}

			let plusShiftTop = n => {
				lines.value()[i][0] = lines.value()[i][0] + n
				lines.value()[i][1] = lines.value()[i][1] + n

				lines.next(lines.value())

				updateOut()
				update.next(e => e + 1)
			}

			let minusShiftTop = n => {
				lines.value()[i][0] = lines.value()[i][0] - n
				lines.value()[i][1] = lines.value()[i][1] - n

				lines.next(lines.value())

				updateOut()
				update.next(e => e + 1)
			}

			setTimeout(() => {
				drag(el, {
					set_left: () => null,
					onstart: () => {
						currentSelected = {
							up: () => setTop((top.value() * scale.value()) - scale.value()),
							down: () => setTop((top.value() * scale.value()) + scale.value()),
							upShift: () => { minusShiftTop(1) },
							downShift: () => { plusShiftTop(1) }
						}
					},
					set_top: setTop
				})
			}, 150)

			return el
		}
		let markers = memo(() => {
			let left = lines.value().map(([a, b], i) => {
				let top = reactive(a)
				return marker(top, i, 0)
			})

			let right = lines.value().map(([a, b], i) => {
				let top = reactive(b)
				return marker(top, i, 1)
			})

			return [...left, ...right]
		}, [lines])

		let paper = dom(['div', {
			style: memo(() => `
				margin-left: 30px;
				background-color: #6ecae7;
				border: 2px solid black;
				width: ${width.value() * scale.value()}px;
				height: ${height.value() * scale.value()}px;
			`, [height, width, scale])
		}, ['svg', {
			width: memo(() => width.value() * scale.value() - 2, [width, scale]),
			height: memo(() => height.value() * scale.value(), [height, scale]),
		}, linesEls], markers,

		])

		return [
			{
				keydown: e => {
					if (e.key == 'ArrowUp') {
						if (e.shiftKey) { currentSelected ? currentSelected.upShift() : null }
						else currentSelected ? currentSelected.up() : null
					}

					if (e.key == 'ArrowDown') {
						if (e.shiftKey) { currentSelected ? currentSelected.downShift() : null }
						else currentSelected ? currentSelected.down() : null
					}
				}
			},
			paper,
			button("add", addLine),
			button("remove", removeLine),
			button("++", () => scale.next(scale.value() + .1)),
			// button(scale),
			button("--", () => scale.next(scale.value() - .1)),
			rotateEl
		];
	},
	transform: (props, _props) => {
		let f = ["Group",
			{
				draw: letter(
					props.x, props.y,
					props.width, props.height,
					props.lines,
					{ rotate: [props.rotate] },
					props.stroke, props.fill, props.strokeWeight, props.bounding
				)
			}
		]
		return {
			draw: f,
			lines: JSON.parse(JSON.stringify(props.lines)),
			letter: {
				letter: props.letter,
				width: props.width,
				height: props.height,
				lines: props.lines,
				rotate: props.rotate,
			}
		}
	},
};

