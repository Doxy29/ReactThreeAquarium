import FishBowl from "./components/FishBowl";
import FishBowlT from "./components/FishBowlT";
import {PivotControls} from "@react-three/drei"
import React, {useCallback, useRef} from "react";
//import Fish from "./components/Fish";
import FishModel from "./components/FishModel";
import {
    addV, calcSeparationTurnFactor,
    calcWallTurnFactor, createPointsOnSphere,
    invertOnAxis,
    randomFishVelocity,
    randomVector3,
    rotateAndNormalize, subV
} from "../../Utilities";
import {useFrame} from "@react-three/fiber";
import {Vector3, Euler, BoxGeometry, MeshStandardMaterial, InstancedMesh, Object3D, Raycaster, Color} from "three";
import {yAxis, zAxis} from "../../Utilities/Constants";
import LineTester from "../Helpers/LineTester";
import PointViewer from "../Helpers/PointViewer";
import {frontFacing} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
//import {Line} from "@react-three/drei"

type Axis = "x"|"y"|"z"
type ThreeNumArray = [number,number,number]

// const currPoints = [
//     [2,0,1],
//     [2,0,-1],
//     [2,0.6,1],
//     [2,-0.6,1],
//     [2,0.6,-1],
//     [2,-0.6,-1],
//     [2,0.6,0],
//     [2,-0.6,0],
//     [0,0,0.4],
//     [0,0,-0.4],
//     [0,0.2,0.4],
//     [0,-0.2,0.4],
//     [0,0.2,-0.4],
//     [0,-0.2,-0.4],
//     [0,0.4,0],
//     [0,-0.4,0],
// ]

const range = 1
const xOffset = 0
const currPoints = [
    [xOffset,0,range],
    [xOffset,range,range],
    [xOffset,range,0],
    [xOffset,range,-range],
    [xOffset,0,-range],
    [xOffset,-range,-range],
    [xOffset,-range,0],
    [xOffset,-range,range]
    
]

const fontVectors:any[] = []
const searchPathVectors = createPointsOnSphere(500,5,2, new Euler(-Math.PI/2,0,0, "YXZ"))
//const Apoints:any[] = []

// for(let j = 0; j < currPoints.length ; j++){
//     const vector = new Vector3(currPoints[j][0],currPoints[j][1],currPoints[j][2])
//     vector.normalize()
//     vector.setLength(4)
//     points.push(vector)
// }

for(let j = 0; j < currPoints.length ; j++){
    const vector = new Vector3(currPoints[j][0],currPoints[j][1],currPoints[j][2])
   
    vector.setLength(2)
    vector.setX(15)
    vector.normalize()
    fontVectors.push(vector)
}

const frontLeng = fontVectors.length
const searchPathLeng = searchPathVectors.length
console.log(fontVectors,searchPathVectors, 'fontVectors')

const boxGeo = new BoxGeometry(0.2,0.2,0.2)
const meshStandard = new MeshStandardMaterial({color:"red"})
const meshInstance = new InstancedMesh(boxGeo, meshStandard,frontLeng +searchPathLeng )
meshInstance.setColorAt(0,new Color("red"))

const dummy = new Object3D()



const _raycaster = new Raycaster(undefined,undefined,0,15);


const Aquarium = () => {
    //Constants---------------------------------------------------------------//
    const threeAxis:Axis[] = ["x","y","z"]

    

    const fishNr = 30
    const maxVelocityCoord = {x:0.08,y:0.02,z:0.08}
    const maxVelocityLength = 0.09
    const minVelocityLength = 0.02
    
    const aqSize: ThreeNumArray = [90,50,70]
    const barrier = {x:{min:0,max:0},y:{min:0,max:0},z:{min:0,max:0}}
    const barrierOffset = 10
    threeAxis.forEach((axis,index)=>{
        barrier[axis] = {
            min: barrierOffset - aqSize[index]/2,
            max: aqSize[index]/2 - barrierOffset
        }
    })
    const turnRate = 0.0008
    const fishInitPositionRange:ThreeNumArray = [barrier.x.max,barrier.y.max,barrier.z.max]
    //------------------------------------------------------------------------//
    
    const fishRefs = useRef<any[]>([])
    const bowlRef = useRef<any[]>([])
    let show = 0


    
    
    //*************** Fish Movement Calculator ***************
    const calcFishMovment = useCallback((fish:any,delta:any)=>{
        
        const {azimuth, elevation} = rotateFishToVector(fish);

        // for (let i = 0; i < searchPathLeng; i++) {
        //     const posi = addV(rotateAndNormalize(searchPathVectors[i],azimuth, elevation , false).setLength(10), fish.position)
        //     dummy.position.set(posi.x,posi.y,posi.z)
        //     dummy.updateMatrixWorld();
        //     meshInstance.setMatrixAt(i,dummy.matrix)
        // }
        //
        // for (let i = searchPathLeng; i < frontLeng+searchPathLeng; i++) {
        //     const posi = addV(rotateAndNormalize(fontVectors[i-searchPathLeng], azimuth, elevation + (Math.PI/2)).setLength(10), fish.position)
        //     dummy.position.set(posi.x,posi.y,posi.z)
        //     dummy.updateMatrixWorld();
        //     meshInstance.setMatrixAt(i,dummy.matrix)
        // }


        const wallAvoidencForce = new Vector3(0,0,0)
        let shortestIntersection:any[] = []
        for (let i = 0; i < frontLeng; i++) {
            const frontVec = rotateAndNormalize(fontVectors[i], azimuth, elevation + (Math.PI/2))
            _raycaster.set(fish.position, frontVec)
            let intersects  = _raycaster.intersectObjects(bowlRef.current)

            if(intersects.length > 0 && intersects[0].distance < 14 ) {
                if(shortestIntersection.length === 0) shortestIntersection = intersects
                if(shortestIntersection[0].distance < intersects[0].distance) shortestIntersection = intersects
            }
        }

        if(shortestIntersection.length > 0 && shortestIntersection[0].distance < 13.5 ) {
            const weight = 14/shortestIntersection[0].distance
            for (let j = 0; j < searchPathLeng; j++) {
                const searchVec = rotateAndNormalize(searchPathVectors[j], azimuth,elevation)

                _raycaster.set(fish.position, searchVec)
                let intersects  = _raycaster.intersectObjects(bowlRef.current)

                if(intersects.length === 0){
                    wallAvoidencForce.add(calcWallTurnFactor(fish.velocity, searchVec, turnRate * weight, maxVelocityLength))
                    break
                }

            }
        }
        
       
        
        fish.velocity.add(wallAvoidencForce)
       
        
        if(fish.velocity.length() > maxVelocityLength){
            fish.velocity.setLength(maxVelocityLength)
        }else if(fish.velocity.length() < minVelocityLength){
            fish.velocity.setLength(minVelocityLength)
        }
        
        
        // threeAxis.forEach(axis=>{
        //     const distance = Math.abs(Math.abs(fish.position[axis]) - Math.abs(barrier[axis].max))
        //    
        //     if(barrier[axis].max < fish.position[axis] ){
        //         fish.velocity[axis] = fish.velocity[axis] - (turnRate * distance/10)
        //     }
        //    
        //     if(barrier[axis].min > fish.position[axis] ){
        //         fish.velocity[axis] = fish.velocity[axis] + (turnRate * distance/10)
        //     }
        // })
        
        
        fish.position.add(fish.velocity)

        
        //1 time log for each fish
        if(show < fishNr*1){
            if(fish.name=== "fish0"){
                console.log(fish, "fish")
                console.log(bowlRef, bowlRef.current,_raycaster, 'bowlRef')
                fishRefs.current[0].children.push(meshInstance)
                show++
            }
        }
        
    },[threeAxis, yAxis])
    
    
    //ROTATE FISH---------------------------------------------------------------------------------------------
    const rotateFishToVector = useCallback((fish:any) => {
        //const xz = new Vector3(fish.velocity.x,0,fish.velocity.z)

        const azimuth = Math.atan2(fish.velocity.z * -1,fish.velocity.x)
        const elevation = -fish.velocity.angleTo(yAxis)
        
        fish.rotation.y =  azimuth
        fish.rotation.z =  elevation
        
        
        return {azimuth, elevation}
    },[])

    //MOVE FISH -not implemented------------------------------------------------------------------------------
    const moveFish = useCallback((fish:any) => {

        fish.position = addV(fish.position, fish.velocity)
    },[])

    //ANIMATION FRAME-----------------------------------------------------------------------------------------
    useFrame((state, delta, xrFrame)=>{
        //console.log(root, 'clock');
        fishRefs.current.forEach((fish)=>{
            calcFishMovment(fish,state.clock)
            meshInstance.instanceMatrix.needsUpdate = true;
            if( meshInstance.instanceColor){
                meshInstance.instanceColor.needsUpdate = true
            }
        })
        
    })
    
    const _fishes = Array.from({length:fishNr},(_,i:number)=>{
        const position = randomVector3([20,20,20])
        const velocity = randomFishVelocity(maxVelocityLength,[maxVelocityCoord.x,maxVelocityCoord.y,maxVelocityCoord.z],)
        //const velocity = new Vector3()
        
        // For debuging ********************* 
        // const position = new Vector3((i * 20)-30,0,0)
        // const velocity:any = {
        //     "0": new Vector3(3,3,3),
        //     "1": new Vector3(3,-3,3),
        //     "2": new Vector3(-3,-3,3),
        //     "3": new Vector3(-3,3,3),
        // }
        // const xz = new Vector3(velocity[i].x,0,velocity[i].z)
        //************************************
        return (
                
            <>
                <FishModel
                    velocity={velocity}
                    //velocity={velocity[i.toString()]}
                    acc={new Vector3(0,0,0)}
                    key={`fish${i}`}
                    name={`fish${i}`}
                    pushRef={(ref)=> fishRefs.current.push(ref)}
                    position={position}
                />
                {/*<Line points={[[0,0,0],new Vector3(5,5,5]} lineWidth={5} color="black"    />*/}
            </>
                
        )

    })
    
    return (
        
           <>
               {/*<FishBowlT pushRef={(ref)=> bowlRef.current = ref} args={aqSize} />*/}
                   <mesh ref={(ref)=>{
                       if(ref){
                           bowlRef.current.push(ref)
                       }
                   }} scale={1} position={[0, 0, 0]}>
                       <torusGeometry args={[10, 3, 16, 10]} />
                       <meshStandardMaterial />
                   </mesh>

                   <mesh ref={(ref)=>{
                       if(ref){
                           bowlRef.current.push(ref)
                       }
                   }} scale={1} position={[35, -13, 0]}>
                       <torusGeometry args={[10, 3, 16, 10]} />
                       <meshStandardMaterial />
                   </mesh>

                   <mesh ref={(ref)=>{
                       if(ref){
                           bowlRef.current.push(ref)
                       }
                   }} scale={1} position={[-35,15, 0]}>
                       <torusGeometry args={[10, 3, 16, 10]} />
                       <meshStandardMaterial />
                   </mesh>
               
               
               {/*<LineTester />*/}
               {/*<PointViewer/>*/}
               
               <FishBowl pushRef={(ref)=> bowlRef.current.push(ref)}  args={aqSize}/>
               {_fishes}
           </>
        
    )
}

export default Aquarium