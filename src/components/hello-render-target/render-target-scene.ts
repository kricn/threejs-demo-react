import * as Three from 'three'

const scene = new Three.Scene()
scene.background = new Three.Color(0x00FFFF)

const camera = new Three.PerspectiveCamera(45, 1, 0.1, 10)
camera.position.z = 10

const light = new Three.DirectionalLight(0xFFFFFF, 1)
light.position.set(0, 10, 10)
scene.add(light)

const colors = ['blue', 'red', 'green']
const boxs: Three.Mesh[] = []

colors.forEach((color, index) => {
  const mat = new Three.MeshPhongMaterial({ color })
  const geo = new Three.BoxGeometry(2, 2, 2)
  const mesh = new Three.Mesh(geo, mat)
  mesh.position.x = (index - 1) * 3
  scene.add(mesh)
  boxs.push(mesh)
})

const collection = {
  scene,
  boxs,
  camera
}

export default collection