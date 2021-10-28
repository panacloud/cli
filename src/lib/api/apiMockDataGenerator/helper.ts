export function isArray(typeName: string) {
    return !!typeName.match(/[[a-zA-Z0-9]*]/g)
}