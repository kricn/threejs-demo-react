import { CylinderGeometry } from "three"

const radiusTop = 8
const radiusBottom = 8
const height = 8
const radialSegments = 20

const myCylinder = new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)

export default myCylinder