import { Mesh, Object3D } from "three";
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { createMaterial } from './index'

const loadFont: (url: string) => Promise<Font> = (url) => {
  const loader = new FontLoader()
  return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
  })
}

const createText = async () => {

    const url = 'https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json'
    
    const font = await loadFont(url) //异步加载 字体数据
    
    //第一个参数 'puxiao' 可以替换成任何其他的英文字母
    //特别注意：由于目前我们加载的 字体数据 只是针对英文字母的字体轮廓描述，并没有包含中文字体轮廓
    //所以如果设置成 汉字，则场景无法正常渲染出文字
    //对于无法渲染的字符，会被渲染成 问号(?) 作为替代
    //第二个参数对应的是文字外观配置
    const geometry = new TextGeometry('puxiao', {
        font: font,
        size: 3.0,
        height: .2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: .3,
        bevelSegments: 5,
    })

    const mesh = new Mesh(geometry, createMaterial())

    //Three.js默认是以文字左侧为中心旋转点，下面的代码是将文字旋转点位置改为文字中心
    //实现的思路是：用文字的网格去套进另外一个网格，通过 2 个网格之间的落差来实现将旋转中心点转移到文字中心位置
    //具体代码细节，会在以后 场景 中详细学习，此刻你只需要照着以下代码敲就可以
    geometry.computeBoundingBox()
    geometry.boundingBox?.getCenter(mesh.position).multiplyScalar(-1)

    const text = new Object3D()
    text.add(mesh)

    return text
}

export default createText