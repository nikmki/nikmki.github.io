"use strict";
class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v2) {
        return new Vector(this.x + v2.x, this.y + v2.y, this.z + v2.z);
    }
    subtract(v2) {
        return new Vector(this.x - v2.x, this.y - v2.y, this.z - v2.z);
    }
    dotProduct(v2) {
        return this.x * v2.x + this.y * v2.y + this.z * v2.z;
    }
    crossProduct(v2) {
        return new Vector(this.y * v2.z - this.z * v2.y, this.z * v2.x - this.x * v2.z, this.x * v2.y - this.y * v2.x);
    }
    multiply(n) {
        return new Vector(this.x * n, this.y * n, this.z * n);
    }
    rotateVector(u, theta) {
        // Normalize the axis vector u
        let uLength = Math.sqrt(u.x * u.x + u.y * u.y + u.z * u.z);
        let uNormalized = new Vector(u.x / uLength, u.y / uLength, u.z / uLength);
        // Compute components of Rodrigues' rotation formula
        let vDotU = this.dotProduct(uNormalized);
        let vCrossU = uNormalized.crossProduct(this);
        // Apply Rodrigues' rotation formula
        let rotatedVector = new Vector(this.x * Math.cos(theta) + vCrossU.x * Math.sin(theta) + uNormalized.x * vDotU * (1 - Math.cos(theta)), this.y * Math.cos(theta) + vCrossU.y * Math.sin(theta) + uNormalized.y * vDotU * (1 - Math.cos(theta)), this.z * Math.cos(theta) + vCrossU.z * Math.sin(theta) + uNormalized.z * vDotU * (1 - Math.cos(theta)));
        return rotatedVector;
    }
    distance(v2) {
        let diff = this.subtract(v2);
        return Math.sqrt(diff.x * diff.x + diff.y * diff.y + diff.z * diff.z);
    }
    angle(v2) {
        return Math.acos(this.dotProduct(v2) / (this.length() * v2.length()));
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}
