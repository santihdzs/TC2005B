/*
 * Example functions to practice JavaScript
 *
 * Santiago Hernández - A01787550
 * 2026-02-25
 */

"use strict";

function firstNonrepeating(str){
    for (let i = 0; i < str.length; i++){
        let count = 0
        for (let j = 0; j < str.length; j++){
            if (str[i] === str[j]){ // === compara vals sin convertir type (unlike ==), best practice
                count++
            }
        }
        if (count === 1){
            return str[i]
        }
    }
    return null
}

function bubbleSort(arr){
    for (let i = 0; i < arr.length; i++){
        for (let j = 0; j < arr.length - 1 - i; j++){
            if (arr[j] > arr[j + 1]){
                let temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }
    return arr
}

function invertArray(arr){
    let result = []
    for (let i = arr.length - 1; i >= 0; i--){
        result.push(arr[i])
    }
    return result
}

function invertArrayInplace(arr){
    let left = 0
    let right = arr.length - 1
    while (left < right){
        let temp = arr[left] // para swap
        arr[left] = arr[right]
        arr[right] = temp
        left++
        right--
    }
    return arr
}

function capitalize(str){
    let words = str.split(" ") // .split() same as python
    for (let i = 0; i < words.length; i++){
        if (words[i].length > 0){
            words[i] = words[i][0].toUpperCase() + words[i].slice(1) // toUpperCase() same as upper()
        }
    }
    return words.join(" ") //str concat w seperator
}

function mcd(a, b){ // euclidean algo
    while (b !== 0){
        let temp = b
        b = a % b
        a = temp
    }
    return a
}

function hackerSpeak(str){
    let result = ""
    for (let i = 0; i < str.length; i++){
        let c = str[i]
        if (c === "a" || c === "A") result += "4"
        else if (c === "e" || c === "E") result += "3"
        else if (c === "i" || c === "I") result += "1"
        else if (c === "o" || c === "O") result += "0"
        else if (c === "s" || c === "S") result += "5"
        else result += c
    }
    return result
}

function factorize(n){
    let result = []
    for (let i = 1; i <= n; i++){
        if (n % i === 0){
            result.push(i)
        }
    }
    return result
}

function deduplicate(arr){
    // remove duplicates
    let result = []
    for (let i = 0; i < arr.length; i++){
        if (!result.includes(arr[i])){
            result.push(arr[i])
        }
    }
    return result
}

function findShortestString(arr){
    if (arr.length === 0) return 0
    let min = arr[0].length
    for (let i = 1; i < arr.length; i++){
        if (arr[i].length < min){
            min = arr[i].length
        }
    }
    return min
}

function isPalindrome(str){
    let left = 0
    let right = str.length - 1
    while (left < right){
        if (str[left] !== str[right]){
            return false
        }
        left++
        right--
    }
    return true
}

function sortStrings(arr){
    return arr.slice().sort() // sort() sorts strings alphabetically in js
}

function stats(arr){
    let sum = 0
    for (let i = 0; i < arr.length; i++){
        sum += arr[i]
    }
    let average = sum / arr.length

    let counts = {}
    let maxCount = 0
    let mode = arr[0]

    for (let i = 0; i < arr.length; i++){
        let num = arr[i]
        if (!counts[num]){
            counts[num] = 1
        } else {
            counts[num]++
        }

        if (counts[num] > maxCount){
            maxCount = counts[num]
            mode = num
        }
    }

    return [average, mode]
}

function popularString(arr){
    let counts = {}
    let maxCount = 0
    let popular = arr[0]

    for (let i = 0; i < arr.length; i++){
        let str = arr[i]
        if (!counts[str]){
            counts[str] = 1
        } else {
            counts[str]++
        }

        if (counts[str] > maxCount){
            maxCount = counts[str]
            popular = str
        }
    }

    return popular
}

function isPowerOf2(n){
    if (n <= 0) return false
    while (n > 1){
        if (n % 2 !== 0){
            return false
        }
        n = n / 2
    }
    return true
}

function sortDescending(arr){
    // descending order
    return arr.slice().sort(function(a, b){ // slice sin args -> copy del arr
        return b - a
    })
}



export {
    firstNonrepeating,
    bubbleSort,
    invertArray,
    invertArrayInplace,
    capitalize,
    mcd,
    hackerSpeak,
    factorize,
    deduplicate,
    findShortestString,
    isPalindrome,
    sortStrings,
    stats,
    popularString,
    isPowerOf2,
    sortDescending,
};