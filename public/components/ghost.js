import { button } from "../block.js";
import { memo, reactive } from "../chowk.js";
import { dom } from "../dom.js";
import { drag } from "../drag.js";
import { V } from "../schema.js";
import { getNodeLocation } from "../state.js";
import { dataR } from "./index.js";

function ghostRenderer(node, i, updateOut) {
	let r = dataR(getNodeLocation(node.id), node.id);
	let paragraphs = r("paragraphs");
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


	let paragraphRenderer = (text, x, y, width, height,i, pos = 0) => {
		let el = dom(['.paragraph',
			{
				style: memo(() => `
						position: absolute;
						top: ${y.value()}px;
						left: ${x.value()}px;
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
			background-color: white;
			border: 2px solid black;
			width: ${width.value()}px;
			height: ${height.value()}px;
		`, [height, width ])
	}, markers ])

	return [
		paper,
		button("add", addLine),
		rotateEl
	];
}

export let Ghost = {
	id: "ghost",
	inputs: {
		paragraphs: V.array([{
			x: Math.random()*500,
			y: Math.random()*500,
			width: 200,
			height: 100,
			text: 'Hello world'
		}]),

		residue: V.array([]),

		width: V.number(80),
		height: V.number(300),
	},
	outputs: {},
	render: ghostRenderer,
	transform: (props, _props) => {
		return { }
	},
};

