import { JsonMap } from "./JsonMap.mjs";
import fs from "fs";

export class JsonMapComparator {
    constructor() {
        this.listOfErrors = [];
        this.successfulMatches = [];
        this.errorCounts = {
            sizeMismatch: 0,
            typeMismatch: 0,
            dataMismatch: 0,
            missingKeys: 0
        };
        this.totalFailures = 0;
        this.status = "GREEN"; // Default status
        this.statusIcon = "🟢"; // Default icon
        this.themeColor = "#4CAF50"; // Default color (Green)
    }

    compare(firstMap, secondMap) {
        if (!(firstMap instanceof JsonMap) || !(secondMap instanceof JsonMap)) {
            throw new TypeError("Arguments must be instances of JsonMap");
        }

        let compare = 0;
        if (firstMap.size() !== secondMap.size()) {
            this.logAndAddToList("sizeMismatch", `Size mismatch: FirstMap (${firstMap.size()}), SecondMap (${secondMap.size()})`);
            compare = firstMap.size() > secondMap.size() ? 1 : -1;
        }

        const unionSet = new Set([...firstMap.keySet(), ...secondMap.keySet()]);
        this.compareKeySets(unionSet, firstMap.keySet(), "First");
        this.compareKeySets(unionSet, secondMap.keySet(), "Second");

        const intersect = new Set([...firstMap.keySet()].filter(key => secondMap.keySet().has(key)));
        intersect.forEach(key => this.compareValues(firstMap, secondMap, key));

        // Update status and theme color based on failure count
        if (this.totalFailures > 0) {
            this.status = "RED";
            this.statusIcon = "🔴";
            this.themeColor = "#e74c3c"; // Switch theme to Red
        }

        return this.totalFailures > 1 ? 1 : compare;
    }

    compareValues(firstMap, secondMap, key) {
        const firstValue = firstMap.get(key);
        const secondValue = secondMap.get(key);

        const firstType = this.getType(firstValue);
        const secondType = this.getType(secondValue);

        if (firstType !== secondType) {
            this.logAndAddToList("typeMismatch", `Type mismatch for key '${key}': FirstMap (${firstType}), SecondMap (${secondType})`);
        } else if (firstType === "array" && secondType === "array") {
            this.compareArrays(firstValue, secondValue, key);
        } else if (firstValue !== secondValue) {
            this.logAndAddToList("dataMismatch", `Data mismatch for key '${key}': FirstMap (${firstValue}), SecondMap (${secondValue})`);
        } else {
            this.successfulMatches.push({ key, value: firstValue });
        }
    }

    compareArrays(firstArray, secondArray, key) {
        if (firstArray.length !== secondArray.length) {
            this.logAndAddToList("sizeMismatch", `Array size mismatch at '${key}': FirstMap (${firstArray.length}), SecondMap (${secondArray.length})`);
        }

        firstArray.forEach((item, index) => {
            const secondItem = secondArray[index];

            if (this.getType(item) !== this.getType(secondItem)) {
                this.logAndAddToList("typeMismatch", `Array type mismatch at '${key}[${index}]': FirstMap (${this.getType(item)}), SecondMap (${this.getType(secondItem)})`);
            } else if (item !== secondItem) {
                this.logAndAddToList("dataMismatch", `Array data mismatch at '${key}[${index}]': FirstMap (${item}), SecondMap (${secondItem})`);
            } else {
                this.successfulMatches.push({ key: `${key}[${index}]`, value: item });
            }
        });
    }

    compareKeySets(unionSet, keySet, name) {
        const missingKeys = [...unionSet].filter(key => !keySet.has(key));
        if (missingKeys.length > 0) {
            this.logAndAddToList("missingKeys", `Missing keys in ${name} map: ${missingKeys.join(", ")}`);
        }
    }

    getType(value) {
        return Array.isArray(value) ? "array" : typeof value;
    }

    logAndAddToList(type, message) {
        this.listOfErrors.push({ type, message });
        this.errorCounts[type]++;
        this.totalFailures++;
    }

    printSummaryTable() {
        const totalFields = this.successfulMatches.length + this.totalFailures;
        const successfulMatchesCount = this.successfulMatches.length;

        let output = "\n=========================\n";
        output += "     Summary Report      \n";
        output += "=========================\n\n";
        output += `✅ Total Fields Compared: ${totalFields}\n`;
        output += `🎯 Successful Matches: ${successfulMatchesCount}\n`;
        output += `❌ Failed Matches: ${this.totalFailures}\n`;
        output += `${this.statusIcon} Status: ${this.status}\n\n`;

        output += "Mismatch Breakdown:\n";
        output += "=====================================================\n";

        Object.entries(this.errorCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .forEach(([type, count]) => {
                output += `${type.padEnd(20)} | ${count}\n`;
            });

        output += "=====================================================\n\n";

        output += "Detailed Errors:\n";
        output += "=========================\n";
        output += "Type              | Message\n";
        output += "-----------------|------------------------------------------------------------\n";
        this.listOfErrors.forEach(error => {
            output += `${error.type.padEnd(18)} | ${error.message}\n`;
        });
        output += "=========================\n";

        return output;
    }

    saveAsHtml(filename = "comparison_report.html") {
        const htmlTemplate = fs.readFileSync("./html_template.txt", "utf8");

        const formattedReport = htmlTemplate
            .replaceAll("${totalFields}", this.successfulMatches.length + this.totalFailures)
            .replaceAll("${successfulMatches}", this.successfulMatches.length)
            .replaceAll("${failedMatches}", this.totalFailures)
            .replaceAll("${status}", this.status)
            .replaceAll("${statusIcon}", this.statusIcon) // Precomputed icon replacement
            .replaceAll("${themeColor}", this.themeColor) // Dynamic theme color
            .replaceAll("${mismatchBreakdown}", Object.entries(this.errorCounts)
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([type, count]) => `<tr><td>${type}</td><td>${count}</td></tr>`)
                .join(""))
            .replaceAll("${successfulMatchesTable}", this.successfulMatches.length > 0
                ? this.successfulMatches.map(({ key, value }) => `<tr><td>${key}</td><td>${value}</td></tr>`).join("")
                : "<tr><td colspan='2' class='none'>NONE</td></tr>")
            .replaceAll("${detailedErrors}", this.listOfErrors.length > 0
                ? this.listOfErrors.map(error => `<tr><td>${error.type}</td><td>${error.message}</td></tr>`).join("")
                : "<tr><td colspan='2' class='none'>NONE</td></tr>");

        fs.writeFileSync(filename, formattedReport);
        console.log(`✅ Report saved as ${filename}`);
    }
}