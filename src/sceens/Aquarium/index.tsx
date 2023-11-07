import FishBowl from "./components/FishBowl";
import React, {useCallback, useEffect, useMemo, useRef} from "react";
//import Fish from "./components/Fish";
import FishModel from "./components/FishModel";
import {
    addV, subV,
    applyInvertOnAxis,
    calcSteeringForce, 
    createPointsOnSphere,
    randomFishVelocity,
    randomVector3,
    rotateAndNormalize
} from "../../Utilities";
import {useFrame} from "@react-three/fiber";
import {
    Vector3,
    Euler,
    Raycaster,
    Group
} from "three";
import {threeAxis, yAxis} from "../../Utilities/Constants";
import Obstacles from "./components/Obstacles";
import {useControls} from "leva";
import ClownFish from "./components/ClownFish";
import PointViewer from "../Helpers/PointViewer";
import LineTester from "../Helpers/LineTester";
import InstancedMesh from "./components/InstancedMesh";
//import {Line} from "@react-three/drei"

type Axis = "x"|"y"|"z"
type ThreeNumArray = [number,number,number]

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

for(let j = 0; j < currPoints.length ; j++){
    const vector = new Vector3(currPoints[j][0],currPoints[j][1],currPoints[j][2])
   
    vector.setLength(2)
    vector.setX(15)
    vector.normalize()
    fontVectors.push(vector)
}

const frontLeng = fontVectors.length
const searchPathLeng = searchPathVectors.length

// const boxGeo = new BoxGeometry(0.2,0.2,0.2)
// const meshStandard = new MeshStandardMaterial({color:"red"})
// const meshInstance = new InstancedMesh(boxGeo, meshStandard,frontLeng +searchPathLeng )
// meshInstance.setColorAt(0,new Color("red"))
//
// const dummy = new Object3D()



const _raycaster = new Raycaster(undefined,undefined,0,15);


const Aquarium = () => {

    const fishRefs = useRef<Group[]>([])
    const bowlRef = useRef<any[]>([])

    //Constants for control---------------------------------------------------------------//
   
    const fishNr = 20
    const maxVelocityLength = 0.6
    const minVelocityLength = 0.0005
    const aquariumSize:ThreeNumArray = [120,80,120]
    //const aquariumSize:ThreeNumArray = [50,50,50]
       
    
    
    const turnRate =  maxVelocityLength/50
    
        //const aquariumSize: ThreeNumArray = [90,50,70]
    
    //Constants---------------------------------------------------------------//
        const maxVelocityCoord = {x:0.08,y:0.02,z:0.08}
    
        const barrier = {
            x:{min:0,max:0},
            y:{min:0,max:0},
            z:{min:0,max:0}
        }
        const barrierOffset = 10
        threeAxis.forEach((axis,index)=>{
            barrier[axis] = {
                min: barrierOffset - aquariumSize[index]/2,
                max: aquariumSize[index]/2 - barrierOffset
            }
        })
        
        const fishInitPositionRange:ThreeNumArray = [barrier.x.max,barrier.y.max,barrier.z.max]
        let show = 0


    //Reusable Declarations---------------------------------------------------------------//
        const forcesSum = new Vector3(0,0,0)
        let totForces = 0
    
        let distanceVector
        let distanceToOtherFish
    
        const separationForce = new Vector3(0,0,0)
        let forcesApplied = 0
        let separationWeightByDistance = 0

        const averagePosition = new Vector3(0,0,0)
        let appliedPositionsNo = 0
    
        const averageAlignmentDirection = new Vector3(0,0,0)
        let averageAlignmentVelocity = 0
        let appliedAlignmentNo = 0
    
    //------------------------------------------------------------------------//
    
    //*************** Fish Movement Calculator ***************
    const calcFishMovment = (fish:any,allFishes:any[])=>{
        
        const {azimuth, elevation} = rotateFishToVector(fish);

        
        //Iterate over other fishes 
        allFishes.forEach((otherFish:any)=>{
            
            if(otherFish.name !== fish.name){
                //General Info *-----
                distanceVector = subV(fish.position, otherFish.position)
                distanceToOtherFish = distanceVector.length()

                //Cohesion Calculation
                if(distanceToOtherFish < 15){
                    averagePosition.add(otherFish.position)
                    appliedPositionsNo++
                }

                //Alignment Calculation
                if(distanceToOtherFish < 15){
                    averageAlignmentVelocity += otherFish.velocity.length()
                    averageAlignmentDirection.add(otherFish.velocity)
                    appliedAlignmentNo++
                }

                //Separation Calculation
                if(distanceToOtherFish < 5 ){
                    //separationWeightByDistance = 5-distanceToOtherFish
                    distanceVector.negate()
                    
                    //distanceVector.setLength(50)
                    separationForce.add(distanceVector)
                    forcesApplied++
                }
            }
        })

        //Applying Separation force 
        if(forcesApplied>0 && true){
            separationForce.set(
                separationForce.x/forcesApplied,
                separationForce.y/forcesApplied,
                separationForce.z/forcesApplied,
            )

            forcesSum.add(
                calcSteeringForce(fish.velocity,separationForce,turnRate,maxVelocityLength).multiplyScalar(1)
            )
            totForces++
        }

        //Applying Cohesion force 
        if(appliedPositionsNo > 0 && true){
            averagePosition.divideScalar(appliedPositionsNo)

            forcesSum.add(
                calcSteeringForce(fish.velocity, averagePosition ,turnRate ,maxVelocityLength).multiplyScalar(0.6)
            )
            totForces++
        }

        //Applying Alignment force 
        if(appliedAlignmentNo>0 && true){
            averageAlignmentDirection.divideScalar(appliedAlignmentNo)

            averageAlignmentVelocity /= appliedAlignmentNo

            averageAlignmentDirection.setLength(averageAlignmentVelocity)

            forcesSum.add(
                calcSteeringForce(fish.velocity,averageAlignmentDirection,turnRate ,maxVelocityLength).multiplyScalar(1.6)
            )
            totForces++
        }
        
        //forcesSum.setLength(turnRate)
        //forcesSum.multiplyScalar(1/totForces)
        fish.velocity.add(forcesSum)
        
        
        

        //Regulate Min/Max Speed and Prioritize Horizontal Movement----Start
        // if(Math.abs(fish.velocity.y) > 0.2 ){
        //     fish.velocity.y = fish.velocity.y + (0.005 * -Math.sign(fish.velocity.y))
        // }
        
        const currVelocity = fish.velocity.length()
        if(currVelocity > maxVelocityLength){
            fish.velocity.setLength(currVelocity - (currVelocity/3))
        }else if(fish.velocity.length() < minVelocityLength){
            fish.velocity.setLength(currVelocity + (currVelocity/5))
        }
        
        //Regulate Min/Max Speed and Prioritize Horizontal Movement----End

        //Avoid wall And Obstacles-------Start
        const wallForce = obstacleAvoidanceForce(fish, azimuth, elevation)
        if(wallForce){
            fish.velocity.add(wallForce)
        }

        threeAxis.forEach(axis=>{
            
            if(barrier[axis].max < fish.position[axis] ){
                const distance = Math.abs(Math.abs(fish.position[axis]) - Math.abs(barrier[axis].max))
                fish.velocity[axis] = fish.velocity[axis] - (turnRate * distance/3)
            }
            if(barrier[axis].min > fish.position[axis] ){
                const distance = Math.abs(Math.abs(fish.position[axis]) - Math.abs(barrier[axis].min))
                fish.velocity[axis] = fish.velocity[axis] + (turnRate * distance/3)
            }
        })
        //Avoid wall And Obstacles-------End
        
        //Update Position --- /
        fish.position.add(fish.velocity)
        

        
        //1 time log for each fish
        if(show < fishNr*1){
            if(fish.name=== "fish0"){
                console.log(fish, "fish")
                console.log(bowlRef, bowlRef.current,_raycaster, 'bowlRef')
                //fishRefs.current[0].children.push(meshInstance)
                show++
            }
        }

        separationForce.multiplyScalar(0)
        forcesApplied = 0
        
        averagePosition.multiplyScalar(0)
        appliedPositionsNo = 0

        averageAlignmentDirection.multiplyScalar(0)
        averageAlignmentVelocity = 0
        appliedAlignmentNo = 0
        
        forcesSum.multiplyScalar(0)
        totForces = 0
        
    }
    
    //ROTATE FISH---------------------------------------------------------------------------------------------
    const rotateFishToVector = (fish:any) => {
        const azimuth = Math.atan2(fish.velocity.z * -1,fish.velocity.x)
        const elevation = -fish.velocity.angleTo(yAxis)
        
        fish.rotation.y =  azimuth
        fish.rotation.z =  elevation
        
        return {azimuth, elevation}
    }
    
    //Obstacle avoidance force-------------------------------------------------------------------------------
    const obstacleAvoidanceForce = (fish:any, azimuth:number, elevation:number)=>{
        
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
        
        let shortestIntersection:any[] = []
        let intersects
        
        for (let i = 0; i < frontLeng; i++) {
            const frontVec = rotateAndNormalize(fontVectors[i], azimuth, elevation + (Math.PI/2))
            _raycaster.set(fish.position, frontVec)
            intersects  = _raycaster.intersectObjects(bowlRef.current)

            if(intersects.length > 0 && intersects[0].distance < 14 ) {
                if(shortestIntersection.length === 0) shortestIntersection = intersects
                if(shortestIntersection[0].distance < intersects[0].distance) shortestIntersection = intersects
            }
        }

        if(shortestIntersection.length > 0 && shortestIntersection[0].distance < 13.5 ) {
            const weight = (15 - shortestIntersection[0].distance) / 13 
            for (let j = 0; j < searchPathLeng; j++) {
                const searchVec = rotateAndNormalize(searchPathVectors[j], azimuth,elevation)

                _raycaster.set(fish.position, searchVec)
                intersects  = _raycaster.intersectObjects(bowlRef.current)

                if(intersects.length === 0){
                    return  calcSteeringForce(fish.velocity, searchVec, turnRate * weight, maxVelocityLength)
                }
            }
        }
    }

    //ANIMATION FRAME-----------------------------------------------------------------------------------------
    // useEffect(()=>{
    //     const interval = setInterval(()=>{
    //        
    //     },1000)
    //     return ()=>clearInterval(interval)
    // })
    
    
    
    
    
    useFrame(()=>{
        const start = performance.now();
        fishRefs.current.forEach((fish)=>{
            calcFishMovment(fish, fishRefs.current)

        })
        const end = performance.now();
        console.log(end-start, "sum")
    })
    
    const _fishes = ()=>{
       return Array.from({length:fishNr},(_,i:number)=>{
           const position = randomVector3(fishInitPositionRange)
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
    }
    
    return (
        
           <>
               {/*<FishBowlT pushRef={(ref)=> bowlRef.current = ref} args={aquariumSize} />*/}
                   
               
               
               {/*<LineTester /> */}
               {/*<PointViewer/>*/}
               
               <FishBowl 
                   //pushRef={(ref)=> bowlRef.current.push(ref)} 
                   args={aquariumSize}
               />
               {_fishes()}
               {/*<InstancedMesh />*/}
               
           </>
        
    )
}

export default Aquarium