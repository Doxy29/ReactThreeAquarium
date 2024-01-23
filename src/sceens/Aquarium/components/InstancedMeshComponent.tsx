import React, {useRef, useEffect} from "react"
import {BoxGeometry, ConeGeometry, InstancedMesh, MeshPhongMaterial} from "three";


const InstancedMeshComponent = ({count = 100, pushRef=(ref:any)=>{}})=>{
    
    const boxGeometry = new ConeGeometry( 0.5, 3, 4 );
    const meshPhongMaterial = new MeshPhongMaterial()
    
    return (
        <instancedMesh 
            castShadow={true}
            ref={(ref:InstancedMesh)=>{
                if(ref){
                    pushRef(ref)
                }
            }} 
            args={[boxGeometry, meshPhongMaterial, count]}
        />
    )
}

export default InstancedMeshComponent