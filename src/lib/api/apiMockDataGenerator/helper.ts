export function isArray(typeName: string) {
    return !!typeName.match(/[[a-zA-Z0-9]*]/g)
}

export function getRandomItem<T>(array: Array<T>) {
    return array[Math.floor(Math.random() * array.length)]
}