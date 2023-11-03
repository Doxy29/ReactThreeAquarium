import {Vector3} from "three";
export type Axis = "x"|"y"|"z"

export const threeAxis:Axis[] = ["x","y","z"]
export const xAxis = new Vector3(1,0,0)
export const yAxis = new Vector3(0,1,0)
export const zAxis = new Vector3(0,0,1)
export const zxAxis = new Vector3(1,1,0)