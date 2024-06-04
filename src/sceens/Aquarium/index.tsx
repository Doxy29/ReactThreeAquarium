import FishBowl from "./components/FishBowl";
import React, { useCallback, useMemo, useRef} from "react";
//import Fish from "./components/Fish";
import {
    randomVector3,
    ThreeNumArray
} from "../../Utilities";
import {useFrame} from "@react-three/fiber";
import {
    Vector3,
    Object3D,
    InstancedMesh, Mesh
} from "three";
import {threeAxis, yAxis} from "../../Utilities/Constants";
import {useControls} from "leva";
import InstancedMeshComponent from "./components/InstancedMeshComponent";
import {PerspectiveCamera} from "@react-three/drei";



const dummy = new Object3D()


const Aquarium = () => {

    const nrOfBoids = 400

    //Constants for control---------------------------------------------------------------//
    
    //const fps = 165
    //const fpMs = (1000/fps)
    
    //const maxVelocityLength = 0.3 //  units/second
    const avrgVelocityLength = 0.2 //  units/second
    //const minVelocityLength = 0.0005
    const aquariumSize:ThreeNumArray = [200,120,200]
    
    const turnRate =  avrgVelocityLength/80
    
    const turnWeightOptions = useCallback((initW:number, initR:number)=>{
        return {
            weight: {value: initW , min: 0, max: 2, step: 0.01},
            range: {value: initR , min: 5, max: 30, step: 0.5},
        }
    },[])
    
    
    const cohesionWeight = useRef<any>()
    const separationWeight = useRef<any>()
    const alignmentWeight = useRef<any>()
    const followBoid = useRef<any>({follow:false})
    
    
     cohesionWeight.current = useControls("Cohesion", turnWeightOptions(1.2,15), )
     separationWeight.current = useControls("Separation", turnWeightOptions(1.40,9))
     alignmentWeight.current = useControls("Alignment", turnWeightOptions(0.9,8))
    followBoid.current = useControls("followBoid", {
         follow: {value: false },
         boidIndex: {value: 1 , min: 1, max: nrOfBoids , step: 1},
     })
    
    //Constants---------------------------------------------------------------//
    
        const barrier = {
            x:{min:0,max:0},
            y:{min:0,max:0},
            z:{min:0,max:0}
        }
        const barrierOffset = 20
        threeAxis.forEach((axis,index)=>{
            barrier[axis] = {
                min: barrierOffset - aquariumSize[index]/2,
                max: aquariumSize[index]/2 - barrierOffset
            }
        })
        
        //const boidInitPositionRange:ThreeNumArray = [barrier.x.max,barrier.y.max,barrier.z.max]
        const boidInitPositionRange:ThreeNumArray = [
            barrier.x.max,
            barrier.y.max,
            barrier.z.max
           
        ]
    
    type boid = {
        position: Vector3,
        velocity: Vector3,
    }

    
    

    const boids:boid[] = useMemo(()=>{
        let boi = []
        for (let i = 0; i < nrOfBoids; i++) {
            boi.push({
                position: randomVector3(boidInitPositionRange),
                velocity: new Vector3(
                    (Math.random() * 2) -1,
                    (Math.random() * 2) -1,
                    (Math.random() * 2) -1

                ).setLength(avrgVelocityLength)
            })
        }
        return boi
    },[])
    
    
    const boidsRef = useRef<InstancedMesh>(new InstancedMesh(undefined, undefined, nrOfBoids))
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
    const bowlRef = useRef<Mesh[]>([])
    
    //Reusable Declarations---------------------------------------------------------------//
    let velocityLength = 0
    let currentVelocityLength = 0
    let distanceFromOtherBoid = 0
    const vectorToOtherBoid = new Vector3()
    
    const separationForce = new Vector3()
    let separationForce_Nr = 0

    const cohesionForce = new Vector3()
    let cohesionForce_Nr = 0
    
    const alignmentForce = new Vector3()
    let alignmentForce_Nr = 0
    
    const totalForces = new Vector3()
    let totalForces_Nr = 0
    
    
    
    let show = 0
    let prevPosition = new Vector3()
    
    //------------------------------------------------------------------------//
    const myLog = (str:string,index:number,num:number,arr:any)=>{
        if( show < num && index === 0 ){
            console.log(arr, str)
            show += 1
        }
    }
    //*************** Boid Movement Calculator ***************
    const calcBoidsMovement = (boid:boid, index:number)=>{
        currentVelocityLength = boid.velocity.length()
        
        //Add all forces
        boids.forEach((otherBoid, otherIndex)=>{
            
            if (index === followBoid.current.boidIndex - 1 && followBoid.current.follow) prevPosition.copy(boid.position)
            
            if(index !== otherIndex){
                
                vectorToOtherBoid.subVectors(otherBoid.position,boid.position)
                distanceFromOtherBoid = vectorToOtherBoid.length()

                //Cohesion force tot
                if(distanceFromOtherBoid < cohesionWeight.current.range){
                    cohesionForce.add(otherBoid.position)
                    cohesionForce_Nr++
                }

                //Alignment force tot
                if(distanceFromOtherBoid < alignmentWeight.current.range){
                    alignmentForce.add(otherBoid.velocity)
                    alignmentForce_Nr++
                }

                //Separation force tot
                if(distanceFromOtherBoid < separationWeight.current.range){
                    vectorToOtherBoid.negate().setLength(10-distanceFromOtherBoid)
                    
                    separationForce.add(vectorToOtherBoid)
                    separationForce_Nr++
                }
                
            } 
        })
        
        
        //Separation calculate and apply
        if(separationForce_Nr>0){
            
            separationForce.divideScalar(separationForce_Nr)
            
            if(separationForce.length() > avrgVelocityLength ){
                separationForce.setLength(avrgVelocityLength)
            }
            
            separationForce.sub(boid.velocity)
            
            const turn = turnRate * separationWeight.current.weight
            if(turn < separationForce.length()){
                separationForce.setLength(turn) // set interpolation amount if turn rate is smaller that diff
            }
            
            
            totalForces.add(separationForce)
            totalForces_Nr++

            separationForce.setScalar(0)
            separationForce_Nr = 0
        }

        //Cohesion calculate and apply
        if(cohesionForce_Nr>0 ){
            cohesionForce.divideScalar(cohesionForce_Nr).sub(boid.position).sub(boid.velocity).setLength(turnRate * cohesionWeight.current.weight)
            
            totalForces.add(cohesionForce)
            totalForces_Nr++

            cohesionForce.setScalar(0)
            cohesionForce_Nr = 0
        }
        
        //Alignment calculate and apply
        if(alignmentForce_Nr > 0 ){
            alignmentForce.divideScalar(alignmentForce_Nr).setLength(avrgVelocityLength).sub(boid.velocity).setLength(turnRate * alignmentWeight.current.weight)
            
            
            totalForces.add(alignmentForce)
            totalForces_Nr++

            alignmentForce.setScalar(0)
            alignmentForce_Nr = 0
        }
        
        //Apply all forces to velocity
        if(totalForces_Nr > 0 ){
            totalForces.divideScalar(totalForces_Nr)
            boid.velocity.add(totalForces)
            totalForces.setScalar(0)
            totalForces_Nr = 0
        }
        
        velocityLength = boid.velocity.length()
        // if(velocityLength > maxVelocityLength){
        //     boid.velocity.setLength(maxVelocityLength)
        // }
        
        if(Math.abs(boid.velocity.y) - Math.abs(boid.velocity.x) > 0 ||  Math.abs(boid.velocity.y) - Math.abs(boid.velocity.z) > 0){
            boid.velocity.y += (turnRate * 0.05 * -Math.sign(boid.velocity.y))
            boid.velocity.setLength(velocityLength)
        }
        
        boid.position.add(boid.velocity)

        avoidWall(boid)
        
        const azimuth = Math.atan2(boid.velocity.z * -1,boid.velocity.x)
        const elevation = -boid.velocity.angleTo(yAxis)
        
        
        
        dummy.position.set(boid.position.x,boid.position.y,boid.position.z)
        dummy.rotation.set(0,azimuth,elevation, 'YZX')
        dummy.updateMatrix()
        if(followBoid.current.follow && cameraRef.current && index === followBoid.current.boidIndex - 1){
            prevPosition = new Vector3().copy(prevPosition).sub(dummy.position).setLength(20).add(prevPosition).add(new Vector3(0,5,0))
            cameraRef.current?.position.set(prevPosition.x, prevPosition.y, prevPosition.z) 
            cameraRef.current?.lookAt(new Vector3().addVectors(dummy.position, new Vector3(0,5,0))) 
        }
       
        boidsRef.current.setMatrixAt(index, dummy.matrix)
    }
    
    //ROTATE BOID---------------------------------------------------------------------------------------------
    const rotateFishToVector = (boid:any) => {
        const azimuth = Math.atan2(boid.velocity.z * -1,boid.velocity.x)
        const elevation = boid.velocity.angleTo(yAxis)
        
        return {azimuth, elevation}
    }
    
    const avoidWall = (boid:boid) =>{
        threeAxis.forEach((axis)=>{
            if(boid.position[axis] > barrier[axis].max) {
                boid.velocity[axis] -= (turnRate *0.6)
            }
            if(boid.position[axis] < barrier[axis].min) {
                boid.velocity[axis] += (turnRate *0.6)
            }
        })
    }
    
    const teleportWall = (boid:boid) =>{
        threeAxis.forEach((axis)=>{
            if(boid.position[axis] > barrier[axis].max) boid.position[axis] = barrier[axis].min
            if(boid.position[axis] < barrier[axis].min) boid.position[axis] = barrier[axis].max
        })
    }
    
    useFrame(()=>{
        // const start = performance.now();
        for (let i = 0; i < nrOfBoids; i++) {
            calcBoidsMovement(boids[i], i)
        }
        boidsRef.current.instanceMatrix.needsUpdate = true
        // const end = performance.now();
        // console.log(end-start, "sum")
    })
    
    // setInterval(()=>{
    //    
    // },fpMs)
    
    //console.log(boids, "boids")
    
    return (
        
           <>
               {/*<LineTester /> */}
               {/*<PointViewer/>*/}
               
               <FishBowl 
                   pushRef={(ref)=> bowlRef.current.push(ref)} 
                   args={aquariumSize}
               />
               <InstancedMeshComponent
                   count={boids.length}
                   pushRef={(ref)=> {
                       boidsRef.current = ref
                   }} 
               />
               <PerspectiveCamera ref={cameraRef} position={[0,30,60]} makeDefault fov={80} />
           </>
        
    )
}

export default Aquarium