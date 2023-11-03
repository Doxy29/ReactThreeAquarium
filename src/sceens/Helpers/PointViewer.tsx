import React , {useRef} from "react";
import {BoxGeometry, Euler, InstancedMesh, MeshStandardMaterial, Object3D, Vector3} from "three";
import {Line} from "@react-three/drei"
import {angularInterpolation, createPointsOnSphere, invertOnAxis} from "../../Utilities";
import {forEach} from "lodash";
import {useFrame } from "@react-three/fiber";


const PI = Math.PI
const points:any[] = createPointsOnSphere(500,5,2,new Euler(-PI/2,0,0, "YXZ"))

const boxGeo = new BoxGeometry(0.2,0.2,0.2)
const meshStandard = new MeshStandardMaterial({color:"black"})
const dummy = new Object3D()


const PointViewer = () =>{

    const ref = useRef<any>();
    useFrame(() => {
        points.forEach((point,index)=>{
            dummy.position.set(point.x,point.y,point.z)
            dummy.updateMatrixWorld();
            ref.current.setMatrixAt(index,dummy.matrix)
        })

        ref.current.instanceMatrix.needsUpdate = true;
    })
    
    
    return (
        <instancedMesh 
           
            ref={ref} 
            args={[boxGeo,meshStandard,points.length]}
        />
            
    )
}

export default PointViewer