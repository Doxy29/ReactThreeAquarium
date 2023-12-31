/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 public/Models/FishBowl.gltf -t -r- public 
*/

import * as THREE from 'three'
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import {Euler, Mesh, MeshStandardMaterial} from "three";

type GLTFResult = GLTF & {
  nodes: {
    Cube: THREE.Mesh
  }
  materials: {
    Material: THREE.MeshStandardMaterial
  }
}

type FishBowlProps = {
  args?: [number,number,number],
  pushRef: (ref:Mesh) => void
}

type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

export default function FishBowlT({
                                    args=[6,2,4],
                                    pushRef=()=>{},
                                    ...props
}:FishBowlProps) {
  const { nodes, materials } = useGLTF('/Models/FishBowl.gltf') as GLTFResult
  const initRotation = new Euler( Math.PI/2, 0, 0, 'XYZ' )
  materials.Material.wireframe =true
  return (
      <mesh
          ref={(ref)=>{
            if(ref && pushRef){
              pushRef(ref)
            }
          }}
          rotation={initRotation} 
          geometry={nodes.Cube.geometry} 
          material={materials.Material}
          
      />
  )
}

useGLTF.preload('/Models/FishBowl.gltf')
