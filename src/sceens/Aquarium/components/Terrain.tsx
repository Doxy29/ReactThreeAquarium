import {Plane, useTexture} from "@react-three/drei";
import {useControls} from "leva";
import React from "react";
import {ShadowMaterial} from "three";

const Terrain =()=>{
    const shadowMaterial = new ShadowMaterial()
    shadowMaterial.opacity = 0.2
    shadowMaterial.transparent = false
    return(
        <Plane
            receiveShadow={true}
            args={[200,200]}
            rotation-x={-Math.PI/2}
            position-y={-59}
            material={shadowMaterial}
        />
         
    )
}

export default Terrain