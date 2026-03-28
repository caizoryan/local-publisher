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
	let residue = r("residue");
	let decay = r("decay");
	let width = r("width");
	let fontFamily = r("textFontFamily");
	let fontSize = r("fontSize");
	let rotate = r("rotate");
	let height = r("height");

	let currentSelected = reactive(0)

	let addLine = () => {
		let l = paragraphs.value()
		paragraphs.next([
			...l,
			{
				x: Math.random()*500,
				y: Math.random()*500,

				width: 200,
				height: 100,
				text: "GRABLE GUCKING FORHBLASKJ",
			}
		])
	}

	let removeLine = () => {
		let l = paragraphs.value()
		l.splice(currentSelected.value(), 1)
		paragraphs.next([ ...l ])
	}

	let update = reactive(0)

	let currentText = memo(() => paragraphs.value()[currentSelected.value()].text, [currentSelected])

	let currentTextEl = memo(() => ['textarea.string', {
		value: rotate,
		oninput: e => {
			paragraphs.value()[currentSelected.value()].text = e.target.value
			update.next(e => e+1)
			updateOut()
		}
	}, currentText], [currentText])


	let paragraphRenderer = (text, x, y, width, height,i, pos = 0) => {
		let count = 0
		let residueIndex = 0
		let el = dom(['.paragraph',
			{
				style: memo(() => `
						position: absolute;
						font-size: 11px;
						font-family: ${fontFamily.value()};
						font-size: ${fontSize.value()}px;
						top: ${y.value()}px;
						left: ${x.value()}px;
						width: ${width.value()}px;
						height: ${height.value()}px;
						border: ${currentSelected.value() == i ? '1' : '0'}px solid red;
					`, [x, y, height, width, currentSelected, fontFamily, fontSize])
				},
				text
		])

		let updateResidue = () => {
			let r = residue.value()
			count++
			if (count > 45) {
				count=0
				let tSplit=text.value().split(' ')
				let t = tSplit[residueIndex % tSplit.length]
				residue.next([...r, {text: t, x: x.value(), y: y.value(), decayed: 0}])
				residueIndex++
			}
			else {
				residue.next(r.map(e => {
					e.decayed += decay.value() 
					if (e.decayed >= 1) return undefined
					else return e
				}).filter(e => e!=undefined))
			}
		}

		let setTop = v => {
			y.next(v)
			paragraphs.value()[i]['y'] = v
			updateOut()
			updateResidue()
		}

		let setLeft = v => {
			x.next(v)
			paragraphs.value()[i]['x'] = v
			updateOut()
			updateResidue()
		}

		setTimeout(() => {
			drag(el, {
				onstart: () => currentSelected.next(i),
				set_left: setLeft,
				set_top: setTop
			})
		}, 150)

		return el
	}

	let residues = memo(() => {
		let resides = residue.value().map((p, i) => {
			let x = reactive(p.x)
			let y = reactive(p.y)
			let text = reactive(p.text)
			let opacity = reactive(1 - p.decayed)

			return ['.span', {
				style: `
					position: absolute;
					font-size: 11px;
					font-family: ${fontFamily.value()};
					top: ${y.value()}px;
					left: ${x.value()}px;
					opacity: ${opacity.value()};`
			}, text]
		})

		return resides

	}, [residue])
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
	}, [paragraphs, update])

	let inputNumber = (key) => 
	['input.number', 
			{ type: 'number',
				oninput: e => {
				let num = parseFloat(e.target.value)
				if (typeof num =='number' && !isNaN(num)){
					paragraphs.value()[currentSelected.value()][key] = num
					updateOut()
					update.next(e=> e+1)
				}
			}, 
			value: paragraphs.value()[currentSelected.value()][key]
		},
	]

	let paper = dom(['div', {
		style: memo(() => `
			background-color: white;
			border: 2px solid black;
			width: ${width.value()}px;
			height: ${height.value()}px;
		`, [height, width ])
	}, residues,markers ])

	return [[
	'.layout', {
			style: `display: flex;
			`
		}, 
		paper,
		['.controls', {style: 'padding: 1em;width: 300px'}, 
			['.main-panel', 
				button("add", addLine),
				button("remove", removeLine)
			],
				['.panel', {style: 'display: grid; grid-template-columns: 150px auto;'},
					['span', 'WIDTH : '], inputNumber("width")
				],

				['.panel', {style: 'display: grid; grid-template-columns: 150px auto;'},
					['span', 'HEIGHT : '], inputNumber("height")
				],
			currentTextEl,
		]]];
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

		decay: V.number(.0001),
		residue: V.array([]),

		width: V.number(80),
		height: V.number(300),

		textFontFamily: V.string('Times New Roman'),
		annotationFontFamily: V.string('Hermit'),
		fontSize: V.number(11),
		leading: V.number(13),
	},
	outputs: {},
	render: ghostRenderer,
	transform: (props, _props) => {
		let residues = props.residue.map((p, i) => {
			let x = (p.x)
			let y = (p.y)
			let text = (p.text)
			let opacity = (1 - p.decayed)

			return ['Text', {
					text, y, x,
					fontSize:props.fontSize,
					fontFamily: props.textFontFamily,
					fill: 'black',
					opacity: opacity,
			}]
		})

		let f = ['Group', {
			draw: [...props.paragraphs.map(p => 
				['Text', {
					text: p.text,
					x: p.x,
					y: p.y,
					width: p.width,
					height: p.height,
					fill: 'black',
					fontSize: props.fontSize,
					fontFamily: props.textFontFamily,
					leading: props.leading,
				}]), ...residues]		
		}]
		return { draw: f, residue: props.residue }
	},
};

