import React, {useRef, useState} from 'react';
import {Canvas} from '@react-three/fiber';
import ControllableCamera from "./sceens/Helpers/ControllableCamera";
import {HemisphereLight, HemisphereLightHelper, LinearEncoding} from "three";
import {Plane, Stats, useHelper, useTexture} from "@react-three/drei";
import Aquarium from "./sceens/Aquarium";
import {useControls} from "leva";
import Terrain from "./sceens/Aquarium/components/Terrain";
import {GizmoHelper, GizmoViewport} from "@react-three/drei"


function App() {
    
    
    const MyLight = () =>{
        const {intensity,size, y, x } = useControls(
            {
                intensity: {value:2,min: 0, max: 4, step: 0.5},
                size:{value:10,min: 4, max: 20, step: 2},
                y: {value:100,min: 50, max: 150, step: 10},
                x: {value:80,min: -100, max: 100, step: 10},
            })
        
        const lightRef = useRef<HemisphereLight>(null!);
        useHelper(lightRef,HemisphereLightHelper,size,'red')
        
        return (
            <hemisphereLight ref={lightRef} position={[x,y,0]} args={["white", "black", intensity]}/>
        )
    }
    
    
    
  return (
      <>
         
          <Canvas shadows >
              <Aquarium />
              <Stats />
              <ControllableCamera />
              <Terrain/>
              <MyLight />
              <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
                  <GizmoViewport labelColor="white" axisHeadScale={1} />
              </GizmoHelper>
          </Canvas>
      </>
  );
  
}

export default App;
