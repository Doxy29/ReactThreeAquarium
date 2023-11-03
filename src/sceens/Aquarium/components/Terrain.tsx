import {Plane, useTexture} from "@react-three/drei";
import {useControls} from "leva";
import React from "react";

const Terrain =()=>{
    
    return(
        <Plane
            args={[150,150]}
            rotation-x={-Math.PI/2}
            position-y={-50}
        />
         
    )
}

export default Terrain