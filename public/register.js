import { createRegistery } from "./registery.js";
import {
	add,
	ApplyFunction,
	CollectObjects,
	colorSliders,
	CompileObject,
	CreateFunction,
	CreateVariable,
	Grid,
	LineEditor,
	LogObject,
	MathComps,
	NamedObject,
	Number,
	ObjectExtracter,
	ObjectLabeller,
	ReadVariable,
	ReturnObject,
	round,
	Slider,
	Slider2D,
	String,
} from "./components/utils.js";
import { physariumCanvas, renderCanvas, renderPDFCanvas } from "./canvas.js";
import { V } from "./schema.js";

import { Circle, ImageElement, Line, Text } from "./components/shapes.js";
import { Fold, FoldTyper } from "./components/fold.js";
import { GroupElement } from "./components/group.js";
import { registery } from "./state.js";

registery.register(
	"canvas",
	{
		draw: V.array().collect(),
		width: V.number(612),
		height: V.number(792),
	},
	{},
	renderCanvas,
	(props) => {
		return { draw: ["Group", props] };
	},
);

registery.register(
	"group",
	{ fold: V.number(0) },
	{},
	GroupElement,
	(props) => ({}));

registery.register(
	"physariumCanvas",
	{
		x: V.number(0),
		y: V.number(0),
		draw: V.array().collect(),
	},
	{},
	physariumCanvas,
	(props) => {
		let drawables = props.draw;
		return { draw: ["Group", { draw: drawables }] };
	},
);

registery.register(
	"pdfCanvas",
	{
		draw: V.array().collect(),
	},
	{},
	renderPDFCanvas,
	(props) => {
		return { draw: ["Group", props] };
	},
);

registery.register(Circle);
registery.register(String);
registery.register(ImageElement);
registery.register(LogObject);
registery.register(Text);
registery.register(Grid);
registery.register(ObjectLabeller);
registery.register(ObjectExtracter);
registery.register(MathComps.add);
registery.register(MathComps.sub);
registery.register(MathComps.mul);
registery.register(Slider);
registery.register(Slider2D);
registery.register(CreateFunction);
registery.register(CreateVariable);
registery.register(ReadVariable);
registery.register(CompileObject);
registery.register(ReturnObject);
registery.register(ApplyFunction);
registery.register(Number);
registery.register(CollectObjects);
registery.register(Line);
registery.register(Fold);
registery.register(FoldTyper);
registery.register(LineEditor);
registery.register(NamedObject);

registery.register(
	"colorSliders",
	{
		c: V.number(0),
		m: V.number(0),
		y: V.number(0),
		k: V.number(0),
	},
	{},
	colorSliders,
	(props) => {
		const o = {
			fill: [props.c, props.m, props.y, props.k],
		};
		return o;
	},
);
