function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function pickFromArray(arr: Array<any>): any {
    return arr[random(0, arr.length - 1)];
}

export const Utils = {
    random,
    pickFromArray
};
