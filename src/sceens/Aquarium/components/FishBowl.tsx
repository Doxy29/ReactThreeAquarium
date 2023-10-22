import React from "react";
import {Mesh, Vector3} from "three";
import {BoxGeometryProps} from "@react-three/fiber";

type MeshProps = Mesh 

type FishBowlProps = {
    args?: [number,number,number]
}


const FishBowl = ({args=[6,2,4], ...props}:FishBowlProps) => {

    return (
        <mesh >
            <boxGeometry args={args} />
            <meshStandardMaterial wireframe />
        </mesh>
    )
}

export default FishBowl