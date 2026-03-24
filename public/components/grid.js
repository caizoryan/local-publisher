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
				strokeWeight: 2,
				fill: '#fff0'
			}]
		})

		let vcols = g.versoColumns.map(e => {
			return ["Rect", {
				x: e.x,
				y: e.y,
				width: e.w,
				height: e.h,
				stroke: 'black',
				strokeWeight: 2,
				fill: '#fff0'
			}]
		})

		let f = ['Group', {
			draw: [
				...crops,
				...rcols,
				...vcols,
			]		
		}]

		return { draw: f }
	},
};

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

