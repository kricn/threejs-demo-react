import { useEffect, useRef } from 'react'
import * as Three from 'three'

import './index.scss'
import imgSrc from '@/assets/imgs/cicha.jpg' //引入图片资源
import dice0 from '@/assets/imgs/dice0.png'
import dice1 from '@/assets/imgs/dice1.png'
import dice2 from '@/assets/imgs/dice2.png'
import dice3 from '@/assets/imgs/dice3.png'
import dice4 from '@/assets/imgs/dice4.png'
import dice5 from '@/assets/imgs/dice5.png'


//创建一个 纹理加载器
const loader = new Three.TextureLoader()

/** 创建骰子 */
function createDiceBox() {

  // 加载骰子纹理
  // 骰子的对立面加起来等于7
  const dices = [dice0, dice5, dice2, dice3, dice4, dice1]
  //创建 6 个面对应的材质
  const materialArr: Three.MeshBasicMaterial[] = []
  for (let i = 0; i < 6; i++) {
    materialArr.push(new Three.MeshBasicMaterial({
      map: loader.load(dices[i])
    }))
  }

  const box = new Three.BoxGeometry(8, 8, 8)
  const mesh = new Three.Mesh(box, materialArr) //注意，此处使用的不再是单个材质，而是一个材质数组

  return mesh;

}

const HelloTexture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current === null) {
      return
    }

    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current as HTMLCanvasElement })

    const camera = new Three.PerspectiveCamera(40, 2, 0.1, 1000)
    camera.position.set(0, 0, 40)

    const scene = new Three.Scene()
    scene.background = new Three.Color(0xcccccc)

    //创建一个材质，材质的 map 属性值为 纹理加载器加载的图片资源
    const material = new Three.MeshBasicMaterial({
      map: loader.load(imgSrc) //loader.load('xxx.jpg')返回值为Three.Text类型实例
    })

    const box = new Three.BoxGeometry(8, 8, 8)
    const mesh = new Three.Mesh(box, material)
    mesh.position.set(-20, 0, 0)

    scene.add(mesh)
    // 添加骰子
    const diceMesh = createDiceBox()
    diceMesh.position.set(20, 0, 0)
    scene.add(diceMesh)

    const render = (time: number) => {
      time = time * 0.001
      ;[
        mesh,
        diceMesh
      ].forEach(item => {
        item.rotation.x = time
        item.rotation.y = time
      })
      
      renderer.render(scene, camera)

      window.requestAnimationFrame(render)
    }
    window.requestAnimationFrame(render)

    const resizeHandle = () => {
      const canvas = renderer.domElement
      camera.aspect = (canvas.clientWidth / canvas.clientHeight)
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    }
    resizeHandle()
    window.addEventListener('resize', resizeHandle)

    return () => {
      window.removeEventListener('resize', resizeHandle)
    }

  }, [canvasRef])

  return (
    <canvas ref={canvasRef} className='full-screen' />
  )
}

export default HelloTexture;