interface TOCObject {
    [key: string]: any;
}

interface NestedObject {
    [key: string]: NestedObject | TOCObject | any;
}

export function findTOC(obj: NestedObject): TOCObject | null {
    if (!obj || typeof obj !== 'object') {
        return null;
    }

    // Check if the current object has a "TOC" key
    if ('TOC' in obj) {
        return obj;
    }

    // Recursively check nested objects and arrays
    for (const key in obj) {
        const result = findTOC(obj[key] as NestedObject);
        if (result !== null) {
            return result;
        }
    }

    return null;
}
