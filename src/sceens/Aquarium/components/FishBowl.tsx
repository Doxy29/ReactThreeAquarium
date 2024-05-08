import React from "react";
import {ArrowHelper, BackSide, BoxGeometry, DoubleSide, Mesh, MeshStandardMaterial, Vector3} from "three";
type FishBowlProps = {
    args?: [number,number,number],
    pushRef?: (ref:Mesh) => void
}


const FishBowl = ({
                      args=[6,2,4],
                      pushRef=(ref)=>{}, 
                      ...props
}:FishBowlProps) => {

    const box = new BoxGeometry(args[0],args[1],args[2])
    const material = new MeshStandardMaterial()
    material.wireframe = true
    material.side = BackSide
    material.transparent=true
    
    
    return (
        <mesh ref={(ref)=>{
            if(ref && pushRef){
                
                pushRef(ref)
            }
        }}
              geometry={box}
              material={material}
        />
            
            
        
    )
}

export default FishBowl