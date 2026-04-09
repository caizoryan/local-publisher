import { button } from "../block.js";
import { memo, reactive } from "../chowk.js";
import { dom } from "../dom.js";
import { drag } from "../drag.js";
import { V } from "../schema.js";
import { getNodeLocation } from "../state.js";
import { dataR } from "./index.js";

export let TypeGrid = {
	id: "type-grid",
	inputs: {
		margin: V.any({
			top: 3,
			bottom: 3,
			inside: 3,
			outside: 3,
		}),

		columns: V.number(6),
		gutter: V.number(3),

		hangline: V.array([6]),

		spreadWidth: V.number(700),
		spreadHeight: V.number(560),

		pageWidth: V.number(792),
		pageHeight: V.number(612),

		frame: V.number(0),
		drawGrid: V.number(1)

	},
	outputs: {},
	render: (node) => {
		let r = dataR(getNodeLocation(node.id), node.id);

		let margin = r("margin");
		let columns = r("columns");
		let gutter = r("gutter");
		let hangline = r("hangline");
		let spreadWidth = r("spreadWidth");
		let spreadHeight = r("spreadHeight");
		let pageWidth = r("pageWidth");
		let pageHeight = r("pageHeight");
		// let frame = r("frame");

		let style = memo(() => `
			position: absolute;
			width: ${pageWidth.value()}px;
			height: ${pageHeight.value()}px;
			background-color: white;
		`, [pageWidth, pageHeight])

		let g = grid({
			margin: margin.value(),
			columns: columns.value(),
			gutter: gutter.value(),
			hangline: hangline.value(),
			spreadWidth: spreadWidth.value(),
			spreadHeight: spreadHeight.value(),
			pageWidth: pageWidth.value(),
			pageHeight: pageHeight.value(),
		})

		let rcols = g.rectoColumns.map(e => {
			return ['rect', {
				x: e.x,
				y: e.y,
				width: e.w,
				height: e.h,
				stroke: 'black',
				"stroke-width": 2,
				fill: '#fff0'
			}]
		})

		let vcols = g.versoColumns.map(e => {
			return ['rect', {
				x: e.x,
				y: e.y,
				width: e.w,
				height: e.h,
				stroke: 'black',
				"stroke-width": 2,
				fill: '#fff0'
			}]
		})

		let crops = [
		['line', {
			x1: g.leftPadding-10, y1: g.topPadding,
			x2: g.leftPadding-3,  y2: g.topPadding,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1: g.leftPadding,  y1: g.topPadding-10,
			x2:g.leftPadding,  y2: g.topPadding-3,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1: g.leftPadding+g.props.spreadWidth + 3, y1:g.topPadding,
			x2: g.leftPadding+g.props.spreadWidth + 10, y2: g.topPadding,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1: g.leftPadding+g.props.spreadWidth, y1: g.topPadding-10,
			x2: g.leftPadding+g.props.spreadWidth, y2: g.topPadding-3,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1:g.leftPadding +g.props.spreadWidth, 
			y1:g.topPadding+ g.props.spreadHeight + 3,
			x2:g.leftPadding+ g.props.spreadWidth, 
			y2:g.topPadding+ g.props.spreadHeight + 10,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1: g.leftPadding+g.props.spreadWidth + 3, 
			y1: g.topPadding+g.props.spreadHeight,
			x2: g.leftPadding+g.props.spreadWidth + 10,
			y2: g.topPadding+g.props.spreadHeight,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1: g.leftPadding-10, 
			y1:g.topPadding+ g.props.spreadHeight,
			x2: g.leftPadding-3,
			y2: g.topPadding+g.props.spreadHeight,
			stroke: 'black',
			"stroke-width": 1
		}],
		['line', {
			x1: g.leftPadding, 
			y1: g.topPadding+g.props.spreadHeight + 3,
			x2: g.leftPadding,
			y2: g.topPadding+g.props.spreadHeight + 10,
			stroke: 'black',
			"stroke-width": 1
		}]
		]
		let cols = [...rcols, ...vcols]

		let svg = ['svg', {
			style: 'position: absolute',
			width: memo(() => pageWidth.value() , [pageWidth]),
			height: memo(() => pageHeight.value() ,[pageHeight]),
		}, ...cols, ...crops]

		return [
			dom('.grid', {style}, 'GRID'),
			svg
		]
	},
	transform: (props, _props) => {
		let g = grid(props)
		let crops = [
			["Line", {
				points: [
					{ x: g.leftPadding - 10, y: g.topPadding },
					{ x: g.leftPadding - 3,  y: g.topPadding }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding, y: g.topPadding - 10 },
					{ x: g.leftPadding, y: g.topPadding - 3 }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding + g.props.spreadWidth + 3, y: g.topPadding },
					{ x: g.leftPadding + g.props.spreadWidth + 10, y: g.topPadding }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding + g.props.spreadWidth, y: g.topPadding - 10 },
					{ x: g.leftPadding + g.props.spreadWidth, y: g.topPadding - 3 }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding + g.props.spreadWidth, y: g.topPadding + g.props.spreadHeight + 3 },
					{ x: g.leftPadding + g.props.spreadWidth, y: g.topPadding + g.props.spreadHeight + 10 }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding + g.props.spreadWidth + 3, y: g.topPadding + g.props.spreadHeight },
					{ x: g.leftPadding + g.props.spreadWidth + 10, y: g.topPadding + g.props.spreadHeight }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding - 10, y: g.topPadding + g.props.spreadHeight },
					{ x: g.leftPadding - 3,  y: g.topPadding + g.props.spreadHeight }
				],
				stroke: 'black',
				strokeWeight: 1,
			}],
			["Line", {
				points: [
					{ x: g.leftPadding, y: g.topPadding + g.props.spreadHeight + 3 },
					{ x: g.leftPadding, y: g.topPadding + g.props.spreadHeight + 10 }
				],
				stroke: 'black',
				strokeWeight: 1,
			}]
		]
		let rcols = g.rectoColumns.map(e => {
			return ["Rect", {
				x: e.x,
				y: e.y,
				width: e.w,
				height: e.h,
				stroke: 'black',
				strokeWeight: .1,
			}]
		})

		let vcols = g.versoColumns.map(e => {
			return ["Rect", {
				x: e.x,
				y: e.y,
				width: e.w,
				height: e.h,
				stroke: 'black',
				strokeWeight: .1,
			}]
		})

		let frame = [
			['Rect', {
				x: 0,
				y: 0,
				width: g.leftPadding,
				height: g.props.pageHeight,
				fill: 'black',
			} ],

			['Rect', {
				x: 0,
				y: 0,
				width: g.props.pageWidth,
				height: g.topPadding,
				fill: 'black',
			} ],

			['Rect', {
				x: g.leftPadding+g.props.spreadWidth,
				y: 0,
				width: g.leftPadding,
				height: g.props.pageHeight,
				fill: 'black',
			} ],

			['Rect', {
				y: g.topPadding+g.props.spreadHeight,
				x: 0,
				width: g.props.pageWidth,
				height: g.topPadding,
				fill: 'black',
			} ]
		]

		if (!props.frame) {
			frame=[]
		}

		if (!props.drawGrid) {
			rcols = []
			vcols = []
		}

		let f = ['Group', {
			draw: [
				...crops,
				...rcols,
				...vcols,
				...frame,
			]		
		}]

		return { draw: f }
	},
};

export let QuadTreeGrid = {
	id: "quad-grid",
	inputs: {
		width: V.number(500),
		height: V.number(500),
		points: V.array([]),
		drawPoints: V.number(0),
		capacity: V.number(1),
		drawGrid: V.number(1),
		shape: V.string('rect'),
		strokeWeight: V.number(1),
		strokeColor: V.string('brown')
	},

	outputs: {},
	render: (node) => {
		let r = dataR(getNodeLocation(node.id), node.id);

		let width = r("width");
		let height = r("height");
		let points = r("points");
		let drawPoints = r("drawPoints");
		let strokeColor = r("strokeColor");
		let strokeWeight = r("strokeWeight");
		let shape = r("shape");

		let style = memo(() => `
			position: absolute;
			width: ${width.value()}px;
			height: ${height.value()}px;
			background-color: white;
		`, [width, height])


		let quads = memo(() => {
			let qt = QuadTree(Rectangle(0,0,width.value(), height.value()), 1)
			points.value().forEach(e => qt.insert(e))
			let rects = qt.rects()
			return rects.map(e => 
				[shape.value(), {
					x: e.x,
					y: e.y,
					width: e.w,
					height: e.h,
					"stroke-width": strokeWeight.value(),
					stroke: strokeColor.value(),
					fill: '#fff0'
				}])
		}, [points, width, height])

		let svg = ['svg', {
			style: 'position: absolute',
			width: memo(() => width.value() , [width]),
			height: memo(() => height.value() ,[height]),
		}, quads, ]

		return [ 
			dom('.grid', {style}, 'GRID'), 
			svg 
		]
	},
	transform : (props) => {
		let qt = QuadTree(Rectangle(0,0,props.width, props.height), 1)
		props.points.forEach(e => qt.insert(e))
		let rects = qt.rects()
		let upper1 = (val) => String(val).charAt(0).toUpperCase() + String(val).slice(1)
		let draw = rects.map(e => [upper1(props.shape), {
			x: e.x,
			y: e.y,
			width: props.shape == 'rect' ? e.w : e.w / 4,
			height: e.h,
			stroke: props.strokeColor,
			strokeWeight: props.strokeWeight,
		}])

		if (props.drawPoints) {
			draw.push(...props.points.map(e => ["Circle", {x: e.x, y: e.y, fill: props.strokeColor, radius: 2}]))
		}

		return {draw: ['Group', {draw}]}
	}
}

let grid = props => {
	let columnWidth = (() => {
		let n = 1
		let w = props.spreadWidth/2 - (props.margin.inside + props.margin.outside);
		let g = (n - 1) * props.gutter
		return ((w - (props.gutter * (props.columns - 1))) / props.columns) * n + g;
	})()

	let leftPadding = 
		(props.pageWidth - props.spreadWidth)/2

	let topPadding = 
		(props.pageHeight - props.spreadHeight)/2

	let rectoColumns = (() => {
		const cols = []

		for (let i = 0; i < props.columns; i++) {
			const y = topPadding + props.margin.top
			const w = columnWidth

			// outside + gutters + size
			const x = 
				leftPadding
				+ props.spreadWidth/2
				+ props.margin.inside
				+ (i * props.gutter) + i * columnWidth;
			const h = props.spreadHeight
				- (props.margin.top + props.margin.bottom)

			cols.push({ x, y, w, h })
		}

		return cols
	})()

	let versoColumns = (() => {
		/**@type {{x:number, y:number, w:number, h: number}[]}*/
		const cols = []

		for (let i = 0; i < props.columns; i++) {
			const y = topPadding + props.margin.top 
			const w = columnWidth

			// outside + gutters + size
			const x = leftPadding
				+ props.margin.outside 
				+ i * props.gutter 
				+ i * columnWidth;
			const h = props.spreadHeight
				- (props.margin.top + props.margin.bottom)

			cols.push({ x, y, w, h })
		}

		return cols
	})()

	return {
		props,
		leftPadding,topPadding,
		hanglines: props.hanglines,
		rectoColumns, versoColumns,
		columns: [rectoColumns, versoColumns],
		columnWidth
	}
}


function QuadTree(boundary, n){
	let capacity = n
	let root = {}
	let points = []
	root.divided = false

	let subdivide = () => {
    let x = boundary.x; // now top-left x
    let y = boundary.y; // now top-left y
    let w = boundary.w; // full width
    let h = boundary.h; // full height

    let halfW = w / 2;
    let halfH = h / 2;

    let nwb = Rectangle(x, y, halfW, halfH);
    root.nw = QuadTree(nwb, capacity);

    let neb = Rectangle(x + halfW, y, halfW, halfH);
    root.ne = QuadTree(neb, capacity);

    let swb = Rectangle(x, y + halfH, halfW, halfH);
    root.sw = QuadTree(swb, capacity);

    let seb = Rectangle(x + halfW, y + halfH, halfW, halfH);
    root.se = QuadTree(seb, capacity);
	};

	let insert = (point) => {
		if (!boundary.contains(point)){ return }

		if (points.length < capacity){
			points.push(point)
		}

		else {
			if (!root.divided){
				subdivide()
				root.divided=true
			}

			root.nw.insert(point)
			root.ne.insert(point)
			root.se.insert(point)
			root.sw.insert(point)
		}
	}

	let rects = () => {
		let b = []
		b.push(boundary)
		if (root.divided){
			b.push(...root.nw.rects())
			b.push(...root.ne.rects())
			b.push(...root.sw.rects())
			b.push(...root.se.rects())
		}

		return b.flat()
	}


	root.insert = insert
	root.points = points
	root.boundary = boundary
	root.rects = rects

	return root
}

function Rectangle(x, y, w, h) {
	let contains = (point) => {
    return (
			point.x >= x &&
			point.x <= x + w &&
			point.y >= y &&
			point.y <= y + h
    );
	};
	return { x, y, w, h, contains }
}

