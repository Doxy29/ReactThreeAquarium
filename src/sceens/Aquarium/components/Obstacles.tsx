import React from "react";
import {Group, Mesh} from "three";


type obstaclesType = {
    pushRef?: (ref: Mesh) => void,
}

const Obstacles = ({
                       pushRef = (ref)=>{},
                       ...props
}:obstaclesType) =>{

    return (
        <>
            <mesh
                ref={(ref)=>{
                    if(ref){
                        pushRef(ref)
                    }
                }}
                scale={1} position={[0, 0, 0]}
                key={"ring1"}
            >
                <torusGeometry args={[15,5, 10, 12]} />
                <meshStandardMaterial />
            </mesh>

            <mesh
                ref={(ref)=>{
                    if(ref){
                        pushRef(ref)
                    }
                }}
                scale={1} position={[45, -13, 0]}
                key={"ring2"}
            >
                <torusGeometry args={[15,5, 10, 12]} />
                <meshStandardMaterial />
            </mesh>

            <mesh
                ref={(ref)=>{
                    if(ref){
                        pushRef(ref)
                    }
                }}
                scale={1} position={[-45,15, 0]}
                key={"ring3"}
            >
                <torusGeometry args={[15, 5, 10, 12]} />
                <meshStandardMaterial />
            </mesh>
        </>
    )
}

export default Obstacles