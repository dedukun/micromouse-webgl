//////////////////////////////////////////////////////////////////
//                                                              //
//  Tiago Madeira 76321 & Diogo Duarte 77645 - November 2017    //
//                                                              //
//////////////////////////////////////////////////////////////////

// Returns dictionary with all models and variables used in the app
function getSimulationVars(){
    return {
        floor: {
            vertices:
            [
                // FRONT FACE
                -1.0, -0.01,  1.0,
                 1.0, -0.01,  1.0,
                 1.0,  0.00,  1.0,
                -1.0,  0.00,  1.0,

                // RIGHT FACE
                 1.0, -0.01,  1.0,
                 1.0, -0.01, -1.0,
                 1.0,  0.00, -1.0,
                 1.0,  0.00,  1.0,

                // BACK FACE
                -1.0, -0.01, -1.0,
                -1.0,  0.00, -1.0,
                 1.0,  0.00, -1.0,
                 1.0, -0.01, -1.0,

                // LEFT FACE
                -1.0, -0.01, -1.0,
                -1.0, -0.01,  1.0,
                -1.0,  0.00,  1.0,
                -1.0,  0.00, -1.0,

                // TOP FACE
                -1.0,  0.00, -1.0,
                -1.0,  0.00,  1.0,
                 1.0,  0.00,  1.0,
                 1.0,  0.00, -1.0,

                // DOWN FACE
                -1.0, -0.01,  1.0,
                -1.0, -0.01, -1.0,
                 1.0, -0.01, -1.0,
                 1.0, -0.01,  1.0
            ],
            normals:
            [
                // Front face
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,

                // Back face
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,

                // Top face
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,

                // Bottom face
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,

                // Right face
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,

                // Left face
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7,
                 8,  9, 10,   8, 10, 11,
                12, 13, 14,  12, 14, 15,
                16, 17, 18,  16, 18, 19,
                20, 21, 22,  20, 22, 23
            ],
            textureCoords:
            [
                // Front face
                0.00, 0.00,
                16.0, 0.00,
                16.0, 16.0,
                0.00, 16.0,

                // Back face
                16.0, 0.00,
                16.0, 16.0,
                0.00, 16.0,
                0.00, 0.00,

                // Top face
                0.00, 16.0,
                0.00, 0.00,
                16.0, 0.00,
                16.0, 16.0,

                // Bottom face
                16.0, 16.0,
                0.00, 16.0,
                0.00, 0.00,
                16.0, 0.00,

                // Right face
                16.0, 0.00,
                16.0, 16.0,
                0.00, 16.0,
                0.00, 0.00,

                // Left face
                0.00, 0.00,
                16.0, 0.00,
                16.0, 16.0,
                0.00, 16.0,
            ],
            texture: "Textures/floorTexture.jpg"
        },
        wall: {
            vertices:
            [
                -0.058,  0.000,  0.004,
                 0.058,  0.000,  0.004,
                 0.058,  0.035,  0.004,
                -0.058,  0.035,  0.004,

                 0.058,  0.000,  0.004,
                 0.058,  0.000, -0.004,
                 0.058,  0.035, -0.004,
                 0.058,  0.035,  0.004,

                -0.058,  0.000, -0.004,
                -0.058,  0.035, -0.004,
                 0.058,  0.035, -0.004,
                 0.058,  0.000, -0.004,

                -0.058,  0.000, -0.004,
                -0.058,  0.000,  0.004,
                -0.058,  0.035,  0.004,
                -0.058,  0.035, -0.004,

                -0.058,  0.035, -0.004,
                -0.058,  0.035,  0.004,
                 0.058,  0.035,  0.004,
                 0.058,  0.035, -0.004,

                -0.058,  0.000,  0.004,
                -0.058,  0.000, -0.004,
                 0.058,  0.000, -0.004,
                 0.058,  0.000,  0.004
            ],
            normals:
            [
                // Front face
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,

                // Back face
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,

                // Top face
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,

                // Bottom face
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,

                // Right face
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,

                // Left face
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7,
                 8,  9, 10,   8, 10, 11,
                12, 13, 14,  12, 14, 15,
                16, 17, 18,  16, 18, 19,
                20, 21, 22,  20, 22, 23
            ],
            hor: [],
            ver: [],
            textureCoords:
            [
                // Front face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,

                // Back face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,

                // Top face
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,

                // Bottom face
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,

                // Right face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,

                // Left face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ],
            textureTop: "Textures/red.png",
            textureSide: "Textures/white.png"
        },
        post: {
            vertices:
            [
                -0.004,  0.000,  0.004,
                 0.004,  0.000,  0.004,
                 0.004,  0.035,  0.004,
                -0.004,  0.035,  0.004,

                 0.004,  0.000,  0.004,
                 0.004,  0.000, -0.004,
                 0.004,  0.035, -0.004,
                 0.004,  0.035,  0.004,

                -0.004,  0.000, -0.004,
                -0.004,  0.035, -0.004,
                 0.004,  0.035, -0.004,
                 0.004,  0.000, -0.004,

                -0.004,  0.000, -0.004,
                -0.004,  0.000,  0.004,
                -0.004,  0.035,  0.004,
                -0.004,  0.035, -0.004,

                -0.004,  0.035, -0.004,
                -0.004,  0.035,  0.004,
                 0.004,  0.035,  0.004,
                 0.004,  0.035, -0.004,

                -0.004,  0.000,  0.004,
                -0.004,  0.000, -0.004,
                 0.004,  0.000, -0.004,
                 0.004,  0.000,  0.004
            ],
            normals:
            [
                // Front face
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,

                // Back face
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,

                // Top face
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,

                // Bottom face
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,

                // Right face
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,

                // Left face
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7,
                 8,  9, 10,   8, 10, 11,
                12, 13, 14,  12, 14, 15,
                16, 17, 18,  16, 18, 19,
                20, 21, 22,  20, 22, 23
            ],
            textureCoords:
            [
                // Front face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,

                // Back face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,

                // Top face
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,

                // Bottom face
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,

                // Right face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,

                // Left face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ],
            textureTop: "Textures/red.png",
            textureSide: "Textures/white.png"
        },
        mouse: {
            vertices:
            [
                -0.042,  0.000,  0.028,
                 0.042,  0.000,  0.028,
                 0.042,  0.003,  0.028,
                -0.042,  0.003,  0.028,

                 0.042,  0.000,  0.028,
                 0.042,  0.000, -0.028,
                 0.042,  0.003, -0.028,
                 0.042,  0.003,  0.028,

                -0.042,  0.000, -0.028,
                -0.042,  0.003, -0.028,
                 0.042,  0.003, -0.028,
                 0.042,  0.000, -0.028,

                -0.042,  0.000, -0.028,
                -0.042,  0.000,  0.028,
                -0.042,  0.003,  0.028,
                -0.042,  0.003, -0.028,

                -0.042,  0.003, -0.028,
                -0.042,  0.003,  0.028,
                 0.042,  0.003,  0.028,
                 0.042,  0.003, -0.028,

                -0.042,  0.000,  0.028,
                -0.042,  0.000, -0.028,
                 0.042,  0.000, -0.028,
                 0.042,  0.000,  0.028
            ],
            normals:
            [
                // Front face
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,
                 0.0,  0.0,  1.0,

                // Back face
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,
                 0.0,  0.0, -1.0,

                // Top face
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,

                // Bottom face
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,
                 0.0, -1.0,  0.0,

                // Right face
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,
                 1.0,  0.0,  0.0,

                // Left face
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
                -1.0,  0.0,  0.0,
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7,
                 8,  9, 10,   8, 10, 11,
                12, 13, 14,  12, 14, 15,
                16, 17, 18,  16, 18, 19,
                20, 21, 22,  20, 22, 23
            ],
            tx: -0.94,
            tz:  0.94,
            angleYY: 90.0,
            textureCoords:
            [
                // Front face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,

                // Back face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,

                // Top face
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,

                // Bottom face
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,

                // Right face
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,

                // Left face
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ],
            textureTop: "Textures/mouse.png",
            textureSide: "Textures/green.png"
        },
        marker: {
            vertices:
            [
                 0.007,  0.001,  0.007,
                 0.007,  0.001, -0.007,
                -0.007,  0.001, -0.007,
                -0.007,  0.001,  0.007
            ],
            normals:
            [
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
            ],
            textureCoords:
            [
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0
            ],
            texture: "Textures/bread.png",
        },
        marker1: {
            vertices:
            [
                 0.007,  0.001,  0.058,
                 0.007,  0.001, -0.058,
                -0.007,  0.001, -0.058,
                -0.007,  0.001,  0.058
            ],
            normals:
            [
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
            ],
            textureCoords:
            [
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0
            ]
        },
        marker2: {
            vertices:
            [
                 0.007,  0.0002,  0.007,
                 0.007,  0.0002, -0.058,
                -0.007,  0.0002, -0.058,
                -0.007,  0.0002,  0.007,

                 0.058,  0.0001,  0.007,
                 0.058,  0.0001, -0.007,
                 0.000,  0.0001, -0.007,
                 0.000,  0.0001,  0.007
            ],
            normals:
            [
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7
            ],
            textureCoords:
            [
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,

                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ]
        },
        marker3: {
            vertices:
            [
                 0.007,  0.0002,  0.058,
                 0.007,  0.0002, -0.058,
                -0.007,  0.0002, -0.058,
                -0.007,  0.0002,  0.058,

                 0.058,  0.0001,  0.007,
                 0.058,  0.0001, -0.007,
                 0.000,  0.0001, -0.007,
                 0.000,  0.0001,  0.007
            ],
            normals:
            [
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7
            ],
            textureCoords:
            [
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,

                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ]
        },
        marker4: {
            vertices:
            [
                 0.007,  0.001,  0.058,
                 0.007,  0.001, -0.058,
                -0.007,  0.001, -0.058,
                -0.007,  0.001,  0.058,

                 0.058,  0.001,  0.007,
                 0.058,  0.001, -0.007,
                -0.058,  0.001, -0.007,
                -0.058,  0.001,  0.007
            ],
            normals:
            [
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0,
                 0.0,  1.0,  0.0
            ],
            faces:
            [
                 0,  1,  2,   0,  2,  3,
                 4,  5,  6,   4,  6,  7
            ],
            textureCoords:
            [
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,

                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ]
        }
    };
}
