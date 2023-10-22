import React, {forwardRef, useRef, useState} from "react";
import {MeshProps} from "@react-three/fiber";
import {Vector3, Euler, BufferGeometry, ConeGeometry} from "three";
import {Line, Point, PointMaterial, PointsBuffer} from "@react-three/drei"

type FishProps = MeshProps & {
    pushRef?: (ref: any) => void,
    velocity: Vector3,
    position?: Vector3,
    acc?: Vector3,
}

const Fish = (props: FishProps) => {

    let geometry = new ConeGeometry(1,4,5)
    
    return (

        <mesh {...props}  ref={(ref)=>{
            if(ref && props.pushRef){
                props.pushRef(ref)
            }
        }} geometry={geometry}>
            <meshStandardMaterial  />
        </mesh>
    )
}

export default Fish