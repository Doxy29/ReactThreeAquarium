import {Vector3, Euler} from "three";
import {Axis, threeAxis, yAxis, zAxis} from "./Constants";

const reusableVector = new Vector3()

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

export type RandomFishVelocityType = (
    length?: number,
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

export const randomFishVelocity:RandomFishVelocityType = (
    length = 0.08,
    maxCoord = [1,1,1],
    minCoord=[0,0,0],
    sing= [0,0,0]
    ) => {
    const rx = randomNumber(maxCoord[0], minCoord[0], sing[0])
    const ry =  randomNumber(maxCoord[1], minCoord[1], sing[1]) 
    const rz =  randomNumber(maxCoord[2], minCoord[2], sing[2])
    return new Vector3(rx,ry,rz).setLength(length)
}

export const addV = (v1:Vector3, v2:Vector3) => {
    return new Vector3(v1.x+v2.x, v1.y+v2.y,v1.z+v2.z)
}

export const subV = (v1:Vector3, v2:Vector3) => {
    return new Vector3(v2.x-v1.x, v2.y-v1.y,v2.z+v1.z)
}

export const angularInterpolation = (v1:Vector3, v2:Vector3, maxRadiantRotation:number) => {
    let currAngle = v1.angleTo(v2)
    const sign = Math.sign(currAngle)
    maxRadiantRotation = maxRadiantRotation * ((sign === 0 || isNaN(sign)) ? 1 : sign)
    if(maxRadiantRotation > currAngle) maxRadiantRotation = currAngle
    
    return new Vector3(v1.x,v1.y,v1.z).applyAxisAngle(new Vector3().crossVectors(v1, v2).normalize(), maxRadiantRotation)
}

export const normalized = (vector:Vector3, ) => {
    const vectorToReturn = new Vector3(vector.x,vector.y,vector.z)
    vectorToReturn.normalize()
    return vectorToReturn
}

//Returns a new normalized vector with the specified rotation
export const rotateAndNormalize = (vector:Vector3, azimuth:number, elevation:number, normalize:boolean = true  ) => {
    const vectorToReturn = new Vector3(vector.x, vector.y, vector.z)
    vectorToReturn.applyEuler(new Euler(0 ,azimuth, elevation, "YZX"))
    if(normalize) vectorToReturn.normalize();
    
    return vectorToReturn
}

export const calcSteeringForce = (velocity:Vector3, desiredDirection:Vector3, turnFactor:number, maxVelocityLength:number) => {
    
    const _velocity = new Vector3(velocity.x,velocity.y,velocity.z)
    const _desiredDirection = new Vector3(desiredDirection.x,desiredDirection.y,desiredDirection.z)

    
   
    _desiredDirection.setLength(maxVelocityLength)
    
    _desiredDirection.sub(_velocity)

    
    _desiredDirection.setLength(turnFactor)
    
    return _desiredDirection
}

export const calcSeparationTurnFactor = (velocity:Vector3, desiredPosition:Vector3, turnFactor:number) => {
    return subV(velocity,angularInterpolation(velocity,desiredPosition,turnFactor))
}

export const invertOnAxis = (vector:Vector3, axis:Axis|undefined = undefined, ) => {
    const inverted = new Vector3(vector.x,vector.y,vector.z)
    threeAxis.forEach((el)=>{
        inverted[el] =  axis === el ? inverted[el] : -inverted[el]
    })
    return inverted
}

export const applyInvertOnAxis = (vector:Vector3, axis:Axis|undefined = undefined, ) => {
    threeAxis.forEach((el)=>{
        vector[el] =  axis === el ? vector[el] : -vector[el]
    })
}

export const createPointsOnSphere = (numPoints:number,pointsToSkip:number=0,numPointShown:number = 2, rotation:Euler ) =>{
    const PI = Math.PI
    const turnFacotr = 0.618033988749894
    const points:any[] = []
    
    for(let i = 0 ; i<numPoints/numPointShown; i++){
        if(i<pointsToSkip) continue
        const dist = i/numPoints
        const inclination = Math.acos(1-2*dist)
        const azimuth = 2 * PI * turnFacotr * i

        const x = Math.sin(inclination) *  Math.cos(azimuth)
        const y = Math.sin(inclination) *  Math.sin(azimuth)
        const z = Math.cos(inclination)

        const position = new Vector3(x,y,z)

        position.applyEuler(rotation)
        position.setLength(5)
        points.push(position)
    }
    
    return points
}

