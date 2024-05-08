﻿import {OrbitControls, PerspectiveCamera} from "@react-three/drei";
import React from "react";

const ControllableCamera = () =>{
    return (
        <>
            <OrbitControls target={[0, 0, 0]} maxPolarAngle={1.45} />
            {/*<PerspectiveCamera makeDefault fov={50} position={[0,30,60]}/>*/}
            
        </>
    )
}

export default ControllableCamera