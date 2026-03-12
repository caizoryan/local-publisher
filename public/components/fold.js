import { button } from "../block.js";
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

export let FoldTyper = {
	id: "fold-typer",
	inputs: {
		rotate: V.number(0),
		x: V.number(0),
		y: V.number(0),
		tracking: V.number(0),
		scale: V.number(1),
		bounding: V.number(0),
		letter: V.array([]).collect(),
		string: V.string(''),
		fill: V.string('white'),
		stroke: V.string('black'),
		strokeWeight: V.number(2),
		bounding: V.number(0),
	},

	render: (node, i, updateOut) => {
		let r = dataR(getNodeLocation(node.id), node.id);
		let string = r("string");

		let text = dom(["textarea", {
			type: "text",
			oninput: (e) => {
				string.next(e.target.value.trim());
				updateOut();
			},
			value: string,
		}, string]);

		return [text,];
	},
	transform: (props) => {
		let letter = props.letter
		console.log(letter)
		if (Array.isArray(letter[0]) && letter.length == 1) letter = letter[0]
		console.log(letter)

		let map = letter.reduce((acc, e) => {
			acc[e.letter] = e
			return acc
		}, {})


		let f = word(props.string, props.x, props.y,
			map,
			props.scale,
			props.tracking,
			props.stroke, props.fill, props.strokeWeight, props.bounding)

		return { 
			draw: ["Group", { 'draw': f.draw }],
			bounds: {
				width: f.width,
				height: f.height,
				x: f.x,
				y: f.y
			}
		}
	}
}

let v = (x, y) => ({ x, y })
let vdup = (v) => ({ x: v.x, y: v.y })

function letter(
	x, y, w, h,
	code, transforms,
	stroke = 'blue',
	fill = [100, 0, 0, 0],
	strokeWeight = 2,
	bounding = 0,
) {

	let spread = []
	let { points, box } = letterPoints({ x, y, width: w, height: h, code, transforms })

	points.forEach(quad => {
		spread.push(
			['Quad', {
				lineJoin: 'round',
				points: quad,
				fill,
				stroke,
				strokeWeight
				// transform: {
				// 	translate: [diffX, di]
				// }
			}]
		)
	})

	if (bounding) {
		spread.push(['Rect', {
			stroke: 'black',
			fill: '#fff0',
			strokeWeight: 1,
			x: box.x,
			y: box.y,
			width: box.width,
			height: box.height,
		}])
	}

	return spread
}

function letterPoints({ x, y, width, height, code, transforms }) {

	let w = width
	let h = height

	let mainrect = [
		v(x, y),
		v(x + w, y),
		v(x + w, y + h),
		v(x, y + h)
	]

	let points = []

	let baselines = []
	code.forEach(points => {
		baselines.push([
			v(x, y + points[0]),
			v(x + w, y + points[1])
		])
	})

	baselines.push([vdup(mainrect[3]), vdup(mainrect[2])])
	let lines = baselines

	function rotateVector(vector, center, angleDeg) {
		const angleRad = angleDeg * (Math.PI / 180);

		const cos = Math.cos(angleRad);
		const sin = Math.sin(angleRad);

		// Translate point to origin
		const dx = vector.x - center.x;
		const dy = vector.y - center.y;

		// Rotate
		const rotatedX = dx * cos - dy * sin;
		const rotatedY = dx * sin + dy * cos;

		// Translate back
		return {
			x: rotatedX + center.x,
			y: rotatedY + center.y
		};
	}


	function scaleVector(vector, center, scale) {
		// Translate point to origin
		const dx = vector.x - center.x;
		const dy = vector.y - center.y;

		// Scale
		const scaledX = dx * scale;
		const scaledY = dy * scale;

		// Translate back
		return {
			x: scaledX + center.x,
			y: scaledY + center.y
		};
	}


	if (transforms.rotate) {
		lines = lines.map(([a, b]) => {
			let pointA = rotateVector(a, { x, y }, transforms.rotate[0])
			let pointB = rotateVector(b, { x, y }, transforms.rotate[0])

			return [pointA, pointB]
		})

		mainrect = mainrect.map(e => rotateVector(e, { x, y }, transforms.rotate[0]))
	}

	// console.log('GOT', transforms.scale)

	if (transforms.scale) {
		lines = lines.map(([a, b]) => {
			let pointA = scaleVector(a, { x, y }, transforms.scale[0])
			let pointB = scaleVector(b, { x, y }, transforms.scale[0])

			return [pointA, pointB]
		})

		mainrect = mainrect.map(e => scaleVector(e, { x, y }, transforms.scale[0]))
	}


	let _index = 0

	let firstQuad = [
		vdup(mainrect[0]),
		vdup(mainrect[1]),
		lines[0][1],
		lines[0][0]
	]

	points.push(firstQuad)

	while (lines.length > 1) {
		let popped = lines.shift()
		let mirrorline = [popped[0], popped[1]]
		let f = [mirrorline[0], mirrorline[1], lines[0][1], lines[0][0],].reduce((acc, e) => {
			let otherside = mirror(e, mirrorline)
			acc.push(otherside)
			return acc
		}, [])

		lines = lines.reduce((acc, e) => {
			// let otherside = mirror(e, mirrorline)
			acc.push([mirror(e[0], mirrorline), mirror(e[1], mirrorline)])
			return acc
		}, [])


		points.push(f)

		_index++
	}

	let box = getBounds(points.flat())

	let diffX = x - box.x //+ random(35)
	let diffY = y - box.y //+ random(35)

	box.x = box.x + diffX
	box.y = box.y + diffY

	points = points.map(quad => quad.map(e => ({ x: e.x + diffX, y: e.y + diffY })))

	return { points, box }
}

let word = (
	w,
	x,
	y,
	map,
	scale = 1,
	tracking = 0,
	stroke = 'blue',
	fill = [100, 0, 0, 0],
	strokeWeight = 2,
	bounding = 0,
	spaceWidth = 25
) => {
	let og_x = x
	let og_y = y
	let width, height=0
	let letters = w
		.split('')
		.map(e => ({
			letter: e,
			data: map[e]
		}))
		.map((e, i) => {
			if (e.letter == " ") {
				x += spaceWidth
				return
			}

			if (!e.data) return
			e = e.data
			let { points, box } = letterPoints({
				x, y, width: e.width, height: e.height, code: e.lines, transforms: {
					rotate: [e.rotate],
					scale: [scale]
				}
			})

			height = Math.max(box.height, height)

			let lett = letter(
				x, y,
				e.width,
				e.height,
				e.lines,
				{ rotate: [e.rotate], scale: [scale] },
				stroke, fill, strokeWeight, bounding
			)

			x += box.width + tracking
			width = x - og_x

			return lett
		})
	return {
		draw: letters.flat(),
		x: og_x,
		y: og_y,
		width,height
	}
}

function mirror(p, m) {
	let dx, dy, a, b;
	let x2, y2;

	let x0 = m[0].x
	let x1 = m[1].x
	let y0 = m[0].y
	let y1 = m[1].y

	dx = (x1 - x0);
	dy = (y1 - y0);

	a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
	b = 2 * dx * dy / (dx * dx + dy * dy);

	x2 = (a * (p.x - x0) + b * (p.y - y0) + x0);
	y2 = (b * (p.x - x0) - a * (p.y - y0) + y0);

	return v(x2, y2)
}

function getBounds(points) {
	if (!points.length) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}

	let minX = points[0].x;
	let maxX = points[0].x;
	let minY = points[0].y;
	let maxY = points[0].y;

	for (const p of points) {
		if (p.x < minX) minX = p.x;
		if (p.x > maxX) maxX = p.x;
		if (p.y < minY) minY = p.y;
		if (p.y > maxY) maxY = p.y;
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}
