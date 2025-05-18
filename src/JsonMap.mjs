export class JsonMap {
    constructor(json, primaryKey = "id") {
        this.map = new Map();
        this.primaryKey = primaryKey;
        const jsonObject = this.safeParseJson(json);
        if (jsonObject) {
            this.createMap("", jsonObject);
            this.sortMap();
        }
    }

    safeParseJson(json) {
        try {
            return JSON.parse(json);
        } catch (error) {
            console.error("Invalid JSON:", error.message);
            return null;
        }
    }

    createMap(path, jsonNode) {
        if (typeof jsonNode === "object" && !Array.isArray(jsonNode) && jsonNode !== null) {
            Object.entries(jsonNode).forEach(([key, value]) => {
                this.createMap(path ? `${path}.${key}` : key, value);
            });
        } else if (Array.isArray(jsonNode)) {
            jsonNode = this.sortArrayByOriginalFirstKey(jsonNode);
            jsonNode.forEach((value, index) => {
                this.createMap(`${path}[${index}]`, value);
            });
        } else {
            this.map.set(path, jsonNode);
        }
    }

    sortArrayByOriginalFirstKey(array) {
        return array.sort((a, b) => {
            if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
                const firstKeyA = Object.keys(a)[0];
                const firstKeyB = Object.keys(b)[0];

                return firstKeyA && firstKeyB ? 0 : firstKeyA ? -1 : 1;
            }
            return 0; // Maintain original order for non-object arrays
        });
    }

    sortMap() {
        this.map = new Map([...this.map.entries()].sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));
    }

    size() {
        return this.map.size;
    }

    keySet() {
        return new Set(this.map.keys());
    }

    get(key) {
        return this.map.get(key);
    }
}