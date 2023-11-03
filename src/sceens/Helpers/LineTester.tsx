import React from "react";
import {Vector3} from "three";
import {Line} from "@react-three/drei"
import {angularInterpolation, invertOnAxis} from "../../Utilities";


const LineTester = () =>{
    const line1 = new Vector3(5,0,0)
    const line2 = new Vector3(-5,0,-5)
    const origin = new Vector3(0,0,0)
    
    const interpolation = angularInterpolation(line1, invertOnAxis(line2) , Math.PI/15)
    
    return (
        <>
            <Line points={[origin,line1]} lineWidth={5} color="black"    />
            <Line points={[origin,line2]} lineWidth={5} color="red"    />
            <Line points={[origin,interpolation]} lineWidth={5} color="blue"    />
        </>
    )
}

export default LineTester