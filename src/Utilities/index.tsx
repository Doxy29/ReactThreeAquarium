import {Vector3} from "three";
export type ThreeNumArray = [number,number,number]

export type  RandomNumberType = (
    range: number,
    offset: number,
    sing: SignType
) => number

export const randomNumber:RandomNumberType = (
    range=1, 
    offset=0, 
    sing= 0
) => {
    return ((Math.random() * (range-offset)) + offset) * (sing === 0 ? (Math.random() >= 0.5? 1:-1) : sing)
}

export type SignType = 1|0|-1

export type RandomVector3Type = (
    maxCoord? : ThreeNumArray,
    minCoord?: ThreeNumArray,
    sing?: [SignType,SignType,SignType]
) => Vector3

export const randomVector3:RandomVector3Type = (
    maxCoord = [1,1,1],
    minCoord=[0,0,0],
    sing= [0,0,0],
    ) => {
    
    const rx = randomNumber(maxCoord[0], minCoord[0], sing[0])
    const ry =  randomNumber(maxCoord[1], minCoord[1], sing[1]) 
    const rz =  randomNumber(maxCoord[2], minCoord[2], sing[2])
    
    return new Vector3(rx,ry,rz)
}

export const addV = (v1:Vector3, v2:Vector3) => {
    return new Vector3(v1.x+v2.x, v1.y+v2.y,v1.z+v2.z)
}
