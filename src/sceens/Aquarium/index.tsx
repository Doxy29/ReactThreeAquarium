import FishBowl from "./components/FishBowl";
import React, {useCallback, useRef} from "react";
import Fish from "./components/Fish";
import FishModel from "./components/FishModel";
import {randomVector3} from "../../Utilities";
import {useFrame} from "@react-three/fiber";
import {Vector3} from "three";


type Axis = "x"|"y"|"z"
type ThreeNumArray = [number,number,number]

//Constants---------------------------------------------------------------//
const threeAxis:Axis[] = ["x","y","z"]

const xAxis = new Vector3(1,0,0)
const yAxis = new Vector3(0,1,0)
const zAxis = new Vector3(0,0,1)
const zxAxis = new Vector3(1,1,0)

const fishNr = 100
const maxVelocity = {x:0.08,y:0.02,z:0.08}
const aqSize: ThreeNumArray = [100,60,80]
const barrier = {x:{min:0,max:0},y:{min:0,max:0},z:{min:0,max:0}}
const barrierOffset = 10
threeAxis.forEach((axis,index)=>{
    barrier[axis] = {
        min: barrierOffset*1.5 - aqSize[index]/2,
        max: aqSize[index]/2 - barrierOffset
    }
})
const turnRate = 0.000008
const fishInitPositionRange:ThreeNumArray = [barrier.x.max,barrier.y.max,barrier.z.max]
//------------------------------------------------------------------------//




const Aquarium = () => {
    const fishRefs = useRef<any[]>([])
    let show = 0
    
    
    
    
    
    
    
    
    
    
    
    
    const moveFish = useCallback((fish:any, allFish:any[])=>{
        
        const xz = new Vector3(fish.velocity.x,0,fish.velocity.z)
        
        const roll = Math.atan2(fish.velocity.z * -1,fish.velocity.x)
        const pitch = fish.velocity.angleTo(yAxis)
        
        fish.rotation.y =   roll 
        fish.rotation.z = - pitch

        
        threeAxis.forEach((curAxis,index)=>{
            
            let position = fish.position[curAxis]
            let velocity = fish.velocity[curAxis]
            let acc = fish.acc[curAxis]

            acc = avoidWall(position, curAxis, acc)
            
            
            if( velocity + acc > maxVelocity[curAxis] && acc !==0){
                velocity = maxVelocity[curAxis]
            }else{
                velocity = velocity + acc
            }
            position = position + velocity
            
            
            
            fish.position[curAxis] = position
            fish.velocity[curAxis] = velocity
            fish.acc[curAxis] = acc
        })

        //1 time log for each fish
        if(show < fishNr){
            console.log(xz, pitch, "fish")
            show++
        }
        
    },[threeAxis, yAxis])

    const avoidWall = (coord: number, curAxis:Axis, acc:number) => {
        if(coord < barrier[curAxis].min){
            const distance =  coord - barrier[curAxis].min
            return acc + turnRate  
        }else if(coord> barrier[curAxis].max){
            
            return acc - turnRate
        }else{
            return 0
        }
        
        
        
    }
  

    useFrame(({clock})=>{
        fishRefs.current.forEach((fish)=>{
            moveFish(fish, fishRefs.current)
        })
    })
    
    const _fishes = Array.from({length:fishNr},(_,i:number)=>{
        const position = randomVector3(fishInitPositionRange)
        const velocity = randomVector3([maxVelocity.x,maxVelocity.y,maxVelocity.z],[maxVelocity.x/1.2,maxVelocity.y/1.2,maxVelocity.z/1.2])
        
        // For debuging ********************* 
        //const position = new Vector3(i * -8,0,0)
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
                    pushRef={(ref)=> fishRefs.current.push(ref)}
                    position={position}
                />
            </>
                
        )

    })
    
    return (
        
           <group>
               <FishBowl args={aqSize}/>
               {_fishes}
           </group>
        
    )
}

export default Aquarium