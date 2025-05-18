import { JsonMap } from './JsonMap.mjs';
import { JsonMapComparator } from './JsonMapComparator.mjs';


const json1 = JSON.stringify({
    id: 101,
    name: "Alice",
    age: 30,
    address: {
        street: "123 Main St",
        city: "New York",
        postalCode: 10001
    },
    skills: ["JavaScript", "TypeScript", "Node.js"],
    preferences: {
        theme: "dark",
        notifications: true
    },
    projects: [
        { id: 1, name: "AI Assistant", completed: false },
        { id: 2, name: "Data Scraper", completed: true }
    ]
});

const json2 = JSON.stringify({
    id: "101", // Type mismatch (number vs string)
    name: "Alice",
    age: 30,
    address: {
        street: "123 Main St",
        city: "San Francisco", // Data mismatch
        postalCode: "10001" // Type mismatch (number vs string)
    },
    skills: ["JavaScript", "Python", "Node.js"], // Data mismatch (Python vs TypeScript)
    preferences: {
        theme: "light", // Data mismatch
        notifications: "true" // Type mismatch (boolean vs string)  
    },
    projects: [
        { id: 1, name: "AI Assistant", completed: "false" }, // Type mismatch (boolean vs string)
        { id: 2, name: "Data Scraper" }
        // Size mismatch (Missing `completed` property)
    ],
    extraField: "unexpected" // Extra key in JSON 2
});

function compareMaps(firstJsonMap, secondJsonMap) {
    const jsonMapComparator = new JsonMapComparator();
    jsonMapComparator.compare(firstJsonMap, secondJsonMap);
    // return JSON.stringify(jsonMapComparator.getFormattedReport(), null, 2);
    jsonMapComparator.saveAsHtml();
    return jsonMapComparator.printSummaryTable();
}

// Sample usage
// const map1 = new JsonMap(JSON.stringify({ id: 1, name: "Alice", date: "undefined", age: 25, "kkkk": { "a": 1, "b": 2 } }));
// const map2 = new JsonMap(JSON.stringify({ id: 1, name: "Alice",date: "NaN" ,age: "25" }));
// const map2 = new JsonMap(JSON.stringify({ id: 1, name: "Alice", date: "undefined", age: 25, "kkkk": { "a": 1, "b": 2 } }));

const map1 = new JsonMap(json1);
const map2 = new JsonMap(json2);

const errors = compareMaps(map1, map2);
console.log("Comparison Report:", compareMaps(map1, map2));
