import { StrokeInput, TextStyle } from "pixi.js";

export const textStyle = (size: number, stroke?: StrokeInput | undefined) => new TextStyle({
  fontFamily: "Arial",
  fill: "white",
  fontStyle: "italic",
  fontSize: size,
  stroke,
});
