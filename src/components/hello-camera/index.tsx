import { useRef, useEffect } from 'react'
import * as Three from 'three'
import createScene from '@/components/hello-light/create-scene'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import './index.scss'

const HelloCamera = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Three.Scene | null>(null)
  const leftViewRef = useRef<HTMLDivElement>(null)
  const rightViewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (canvasRef.current === null || leftViewRef.current === null || rightViewRef.current === null) {
      return
    }

    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current as HTMLCanvasElement })
    renderer.setScissorTest(true)

    const scene = createScene()
    scene.background = new Three.Color(0x000000)
    sceneRef.current = scene

    // 透视镜头
    const light = new Three.DirectionalLight(0xFFFFFF, 1)
    light.position.set(0, 10, 0)
    light.target.position.set(5, 0, 0)
    scene.add(light)
    scene.add(light.target)

    // 透视镜头
    // const leftCamera = new Three.PerspectiveCamera(45, 2, 5, 100)
    // 正交镜头
    const leftCamera = new Three.OrthographicCamera(-1, 1, 1, -1, 5, 50)
    leftCamera.zoom = 0.2

    leftCamera.position.set(0, 10, 20)

    const helper = new Three.CameraHelper(leftCamera)
    scene.add(helper)
    
    // 左边轨道
    const leftControls = new OrbitControls(leftCamera, leftViewRef.current)
    leftControls.target.set(0, 5, 0)
    leftControls.update()

    const rightCamera = new Three.PerspectiveCamera(60, 2, 0.1, 200)
    rightCamera.position.set(40, 10, 30) //为了能够看清、看全镜头，所以将右侧镜头的位置设置稍远一些
    rightCamera.lookAt(0, 5, 0)

    const rightControls = new OrbitControls(rightCamera, rightViewRef.current)
    rightControls.target.set(0, 5, 0)
    rightControls.update()

    const setScissorForElement = (div: HTMLDivElement) => {
      if (canvasRef.current === null) {
          return
      }

      //获得 canvas 和 div 的矩形框尺寸和位置
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const divRect = div.getBoundingClientRect()

      //计算出裁切框的尺寸和位置
      const right = Math.min(divRect.right, canvasRect.right) - canvasRect.left
      const left = Math.max(0, divRect.left - canvasRect.left)
      const bottom = Math.min(divRect.bottom, canvasRect.bottom) - canvasRect.top
      const top = Math.max(0, divRect.top - canvasRect.top)
      const width = Math.min(canvasRect.width, right - left)
      const height = Math.min(canvasRect.height, bottom - top)

      //将剪刀设置为仅渲染到画布的该部分
      const positiveYUpBottom = canvasRect.height - bottom
      renderer.setScissor(left, positiveYUpBottom, width, height)
      renderer.setViewport(left, positiveYUpBottom, width, height)

      //返回外观
      return width / height
    }

    const render = () => {

      if (leftCamera === null || rightCamera === null || sceneRef.current === null) {
          return
      }
      
      const sceneBackground = sceneRef.current.background as Three.Color

      //渲染 左侧 镜头
      const leftAspect = setScissorForElement(leftViewRef.current as HTMLDivElement)

      // 透视镜头时打开下面注释
      // leftCamera.aspect = leftAspect as number

      // 正交镜头
      leftCamera.left = -(leftAspect as number)
      leftCamera.right = leftAspect as number

      leftCamera.updateProjectionMatrix()

      helper.update()
      helper.visible = false

      sceneBackground.set(0x000000)
      renderer.render(sceneRef.current, leftCamera)

      //渲染 右侧 个镜头
      const rightAspect = setScissorForElement(rightViewRef.current as HTMLDivElement)

      rightCamera.aspect = rightAspect as number
      rightCamera.updateProjectionMatrix()

      helper.visible = true

      sceneBackground.set(0x000040)
      renderer.render(sceneRef.current, rightCamera)

      window.requestAnimationFrame(render)
    }
    window.requestAnimationFrame(render)

    const handleResize = () => {
      if (canvasRef.current === null) {
          return
      }

      const width = canvasRef.current.clientWidth
      const height = canvasRef.current.clientHeight

      renderer.setSize(width, height, false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }

  }, [canvasRef])

  return (
    <div className='full-screen'>
        <div className='split'>
            <div ref={leftViewRef}></div>
            <div ref={rightViewRef}></div>
        </div>
        <canvas ref={canvasRef} />
    </div>
  )
  
}

export default HelloCamera;