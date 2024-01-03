import { useEffect, useRef } from 'react'
import * as Three from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import './index.scss';

import dice0 from '@/assets/imgs/dice0.png'
import roundshadow from '@/assets/imgs/roundshadow.png'

interface SphereShadowBase {
  base: Three.Object3D,
  sphereMesh: Three.Mesh,
  shadowMesh: Three.Mesh,
  y: number
}

const HelloFakeShadow = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current === null) {
      return
    }
    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current })
    // renderer.physicallyCorrectLights = true

    const camera = new Three.PerspectiveCamera(45, 2, 0.1, 1000)
    camera.position.set(0, 10, 20)

    const scene = new Three.Scene()
    scene.background = new Three.Color(0xFFFFFF)

    const hemisphereLight = new Three.HemisphereLight(0xB1E1FF, 0xB97A20, 2)
    scene.add(hemisphereLight)

    const directionalLight = new Three.DirectionalLight(0xFFFFFF, 1)
    directionalLight.position.set(0, 10, 5)
    directionalLight.target.position.set(-5, 0, 0)
    scene.add(directionalLight)
    scene.add(directionalLight.target)

    const planeSize = 40
    const loader = new Three.TextureLoader()
    const texture = loader.load(dice0)
    texture.wrapS = Three.RepeatWrapping
    texture.wrapT = Three.RepeatWrapping
    texture.magFilter = Three.NearestFilter
    texture.repeat.set(planeSize / 2, planeSize / 2)
    const planeMaterial = new Three.MeshBasicMaterial({
        map: texture,
        side: Three.DoubleSide
    })
    planeMaterial.color.setRGB(1.5, 1.5, 1.5) //在纹理图片颜色的RGB基础上，分别乘以 1.5，这样可以不修改纹理图片的前提下让纹理图片更加偏白一些
    const planeGeo = new Three.PlaneGeometry(planeSize, planeSize)
    const mesh = new Three.Mesh(planeGeo, planeMaterial)
    mesh.rotation.x = Math.PI * -0.5
    scene.add(mesh)

    const shadowTexture = loader.load(roundshadow)
    const basesArray: SphereShadowBase[] = [] //所有球体假阴影对应的数组

    const sphereRadius = 1
    const sphereGeo = new Three.SphereGeometry(sphereRadius, 32, 16)
    const shadowSize = 1 //假阴影的尺寸
    const shadowGeo = new Three.PlaneGeometry(shadowSize, shadowSize) //假阴影对应的平面几何体
    
    const numSphere = 15 //将随机创建 15 个球体
    for (let i = 0; i < numSphere; i++) {
      const base = new Three.Object3D(); //创建 球和阴影 的整体对象
      scene.add(base);

      const shadowMat = new Three.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      });

      const shadowSize = sphereRadius * 4;
      const shadowMesh = new Three.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = 0.001;
      shadowMesh.rotation.x = Math.PI * -0.5;
      shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
      base.add(shadowMesh);

      const sphereMat = new Three.MeshPhongMaterial();
      sphereMat.color.setHSL(i / numSphere, 1, 0.75); //给 球 设置不同颜色
      const sphereMesh = new Three.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(0, sphereRadius + 2, 0);
      base.add(sphereMesh);

      basesArray.push({
        base,
        sphereMesh,
        shadowMesh,
        y: sphereMesh.position.y,
      });
    }
    const controls = new OrbitControls(camera, canvasRef.current)
    controls.target.set(0, 5, 0)
    controls.update()

    const render = (time: number) => {
      time *= 0.001;

      basesArray.forEach((item, index) => {
        const { base, sphereMesh, shadowMesh, y } = item;

        const u = index / basesArray.length;
        const speed = time * 0.2;
        const angle = speed + u * Math.PI * 2 * (index % 1 ? 1 : -1);
        const radius = Math.sin(speed - index) * 10;

        // 给 球 设置随机位置
        base.position.set(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        );
        const yOff = Math.abs(Math.sin(time * 2 + index));
        sphereMesh.position.y = y + Three.MathUtils.lerp(-2, 2, yOff);
        (shadowMesh.material as Three.Material).opacity = Three.MathUtils.lerp(
          1,
          0.25,
          yOff
        );
      });

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
      
      const handleResize = () => {
        if (canvasRef.current === null) {
          return;
        }
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height, false);
      };
      handleResize();

      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    };
    window.requestAnimationFrame(render);
      
  }, [canvasRef])

  return (
    <canvas ref={canvasRef} className='full-screen' />
  )

}

export default HelloFakeShadow