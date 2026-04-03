import { button } from "../block.js";
import { canvasfns, pinned } from "../canvas.js";
import { memo, reactive } from "../chowk.js";
import { p5 } from "../p5.js";
import { dom } from "../dom.js";
import { drag } from "../drag.js";
import { V } from "../schema.js";
import { getNodeLocation, state } from "../state.js";
import { dataR } from "./index.js";


export let Booklet = {
	id: "booklet",
	inputs: {
		sheets: V.array([]),
		// spreads
		draw: V.array([]),
		index: V.number(0),
	},
	outputs: {},
	render: (node, inputs, updateOut) => {
		let r = dataR(getNodeLocation(node.id), node.id);
		let _r = dataR(getNodeLocation(node.id), node.id, '_data');
		let sheets = r("sheets");
		let spreads = r("draw");
		let index = r("index")
		let pageWidth = r('width')
		let pageHeight = r('height')

		let isPinned = memo(() => state.pinnedNode.value() == node.id, [
			state.pinnedNode,
		]);

		let setPinned = () => {
			state.pinnedNode.next(node.id);
			next = true;
		};

		pageWidth.next(
			pageWidth.value() || 612
		)

		pageHeight.next(
			pageHeight.value() || 792
		)

		let canvas = dom([".canvas"]);

		let p;
		memo(() => {
			if (p) p.resizeCanvas(pageHeight.value(), pageWidth.value());
		}, [pageWidth, pageHeight])
		let init = (pp) => {
			p = pp;
			p.disableFriendlyErrors = true;
			p.setup = () => {
				p.createCanvas(pageHeight.value(), pageWidth.value());
			};
		};

		setTimeout(() => {
			new p5(init, canvas);
		}, 150);

		let draw = (drawables, canvas) => {
			if (drawables.length == 0) return;

			let fns = canvasfns;

			p.background(255);

			// if (isPinned.value()) {
			// 	console.log("IS PINNED!");
			//
			// 	pinned.fill(255)
			// 	pinned.stroke(0)
			// 	pinned.rect(0, 0, pageHeight.value(), pageWidth.value());
			// 	fns.Group({ draw: drawables })(pinned);
			// 	// return;
			// }

			// fns.Group({ draw: drawables })(p);
			let sheets = [
				{
					color: '#dff9',
					height: 8.5*72,
					width:11*72,

					offset: {
						vertical: 0,
						horizontal: 85,
					}
				},

				{
					color: 'yellow',
					height: 8.5*72,
					width:11*72,

					offset: {
						vertical: 0,
						horizontal: 45,
					}
				}
			]

			let img = pageImage(p, drawables, sheets, 4)

			let img2 = pageImage(p, drawables, sheets, 3)

			p.image(img, (11*72)/2-img.width,0, img.width, img.height)
			p.image(img2, (11*72)/2,0, img2.width, img2.height)
		};

		// wrap this in a RAF
	  let paused = false
		let next = false;
		function RAFDraw() {
			if (next && !paused) {
				// sort these into drawables and properties vibes (props can be width/height...)
				let i = inputs.value();
				if (i && i.draw && Array.isArray(i.draw)){
					let d = i.draw
					if (Array.isArray(i.draw[0]) && i.draw.length == 1) {
						d = i.draw[0]
					}
					draw(d)
				}
				next = false;
			}
			requestAnimationFrame(RAFDraw);
		}

		inputs.subscribe(() => next = true);
		
		setTimeout(() => {
			requestAnimationFrame(RAFDraw);
		}, 550);

		let keymaps = e => {
			if (e.key == 'ArrowUp') { }
			if (e.key == 'ArrowDown') { }
		}

		return [
			{ keydown: keymaps },
			canvas ,
			button("PIN", setPinned),
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

let pageImage = (p, spreads, sheets, spreadNum,) => {
	let spread = Math.floor(spreadNum / 2)
	return spreadNum % 2 == 1
		? recto_image(p, spreads, sheets, spread,)
		: verso_image(p, spreads, sheets, spread,)
}

let base = 'white'
let printing =false

let verso_image = (p, spreads, sheets, pageNum,) => {

	let dimensions = getSpreadDimensions(pageNum, spreads.length, sheets)

	let w = 
		dimensions.verso.width +
		dimensions.recto.width

	let h = dimensions.verso.height
	if (dimensions.recto.height > h) h = dimensions.recto.height

	let buffer = p.createGraphics(w, h)
	if (!printing) buffer.background(dimensions.verso.color)
	else buffer.background(base)

	console.log(spreads[pageNum])
	canvasfns.Group({ draw: [spreads[pageNum]] })(buffer);


	if (pageNum == 0) { buffer.background('#eee') }
	let page_width = dimensions.verso.width
	let img = buffer.get(0, 0, page_width, dimensions.verso.height)
	// let img = buffer
	// return buffer

	return img
}
let recto_image = (p, spreads, sheets, pageNum,) => {
	let dimensions = getSpreadDimensions(pageNum, spreads.length, sheets)
	let w = dimensions.verso.width+ dimensions.recto.width
	let h = dimensions.verso.height
	if (h == undefined || dimensions.recto.height > h) h = dimensions.recto.height

	let buffer = p.createGraphics(w, h)
	if (!printing) buffer.background(dimensions.recto.color)
	else buffer.background(base)

	canvasfns.Group({ draw: [spreads[pageNum]] })(buffer);

	if (pageNum == spreads.length - 1) { buffer.background('#eee') }

	let img = buffer.get(dimensions.verso.width, 0,
		dimensions.recto.width, dimensions.recto.height)

	return img
}

// Match sheets with spread to get the dimensions
// sheets have page size, and supply it to spreads to draw
let getSpreadDimensions = (spreadNum, spreadCount, sheets) => {
	let spreads = pages(spreadCount)
	let verso_sheet = { ...getPageDimensions(spreads[spreadNum][0], spreadCount, sheets) }
	let recto_sheet = { ...getPageDimensions(spreads[spreadNum][1], spreadCount, sheets) }
	return { verso: verso_sheet, recto: recto_sheet }
}

let pages = (spreadcount) => {
	if (spreadcount % 2 == 1) {
		return Array(spreadcount).fill(undefined)
			.reduce((acc, _, i) =>
				(acc.push([i * 2, i == spreadcount - 1 ? 0 : i * 2 + 1]), acc), [])
	}

	else console.log("FUCK NOT MULTIPLE OF 4", (spreadcount * 2) - 2)
}

let getPageDimensions = (pageNum, spreadCount, sheets) => {
	let saddle_pages = imposedPages(pages(spreadCount))
	let sheet

	if (pageNum == 0) sheet = 0
	else
		saddle_pages.forEach((set, i) => {
			if (pageNum == set[0] || pageNum == set[1]) {
				sheet = Math.floor(i / 2)
			}
		})

	sheet = { ...sheets[sheet] }
	sheet.width = sheet.width /2

	if (sheet.offset?.horizontal) {
		if (beforeSpine(pageNum, spreadCount)) sheet.width = sheet.width- sheet.offset.horizontal
		else sheet.width = sheet.width+ sheet.offset.horizontal
	}


	return sheet
}

let imposedPages = (pagesArray) => {
	let spreadCount = pagesArray.length
	if (spreadCount % 2 != 1) {
		console.error("FUCK NOT MULTIPLE OF 4", (spreadCount * 2) - 2, spreadCount)
	}
	// get pages
	let last = pagesArray.length - 1
	let pair = (i) => pagesArray[last - i]
	let pairskiplast = (i) => pagesArray[last - i - 1]

	let middle = Math.ceil(last / 2)

	// switch each recto with pair spread recto till middle
	for (let i = 0; i < middle; i++) {
		let f_verso = pagesArray[i][0]
		let p_verso = pair(i)[0]

		pagesArray[i][0] = p_verso
		pair(i)[0] = f_verso
	}

	let pairedup = []

	// pair spreads up with each other
	for (let i = 0; i < middle; i++) {
		pairedup.push(pagesArray[i])
		pairedup.push(pairskiplast(i))
	}

	return pairedup
}

let beforeSpine = (page_num, spread_count) => {
	let spreads = pages(spread_count)
	let middle = Math.floor(spreads.length / 2)

	let is = undefined
	spreads.forEach((e, i) => {
		e.forEach((pg, side) => {
			if (pg == page_num) {
				if (i == middle) {
					if (side == 0) is = true
					else is = false
				}
				else {
					if (i < middle) is = true
					else is = false
				}
			}
		})
	})
	return is
}
