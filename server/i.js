/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum1 = function (nums) {
  nums.sort();
  let sum = 0;
  let results = [];
  let map = {};
  for (let i = 0; i < nums.length; i++) {
    let value = nums[i];
    if (!map.hasOwnProperty(value)) {
      map[value] = new Set();
      map[value].add(i);
    } else {
      map[value].add(i);
    }
  }
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      let diff = sum - (nums[i] + nums[j]);

      if (!map.hasOwnProperty(diff)) {
        break;
      }
      const indexes = Array.from(map[diff]);
      let filetered = indexes.filter((v) => v !== i && v !== j);

      let three = filetered.pop();

      if (!three) {
        continue;
      }
      results.push([nums[i], nums[j], nums[three]].sort().toString());
    }
  }
  const unique = new Set(results.map(JSON.stringify)); // Convert arrays to strings

  results = Array.from(unique, JSON.parse).map((v) => v.split(",").map(Number)); // Convert back to arrays

  return results;
};

// results = threeSum1([3, 0, -2, -1, 1, 2]);
// console.log(results);

var twoSum = function (numbers, target) {
  let n = numbers.length;
  let i = 0,
    j = n - 1;

  while (i < n && j > 0) {
    let result = numbers[i] + numbers[j];
    if (result === target) {
      return [i + 1, j + 1];
    }
    if (result > target) {
      j--;
    }
    if (result < target) {
      i++;
    }
  }
};

var threeSum = function (nums) {
  nums.sort((a, b) => a - b);
  console.log(nums);
  n = nums.length;
  i = 0;
  j = Math.floor(n / 2);
  k = n - 1;
  result = [];
  while (i < j) {
    while (j < k) {
      num1 = nums[i];
      num2 = nums[j];
      num3 = nums[k];
      diff = 0 - (num1 + num2);
      console.log(`0-(${num1}+${num2})=${diff}`);
      if (diff < num1 || diff > num3) {
        break;
      }
      console.log(diff === num3);
      if (diff === num3) {
        result.push([num1, num2, num3]);
      } else if (diff < num2) {
        break;
      } else if (diff > num2) {
        break;
      } else if (diff < num3) {
        k--;
      }
      j++;
      console.log("end of j", result);
    }
    i++;
  }
  return result;
};

numbers1 = [0, 0, 0];
numbers2 = [0, 1, 1];
numbers3 = [1, 2, -2, -1];
numbers4 = [3, -2, 1, 0];
numbers5 = [-1, 0, 1, 0];
numbers6 = [-1, 0, 1, 2, -1, -4];
numbers7 = [-1,0,1,0];
numbers7 =[34,55,79,28,46,33,2,48,31,-3,84,71,52,-3,93,15,21,-43,57,-6,86,56,94,74,83,-14,28,-66,46,-49,62,-11,43,65,77,12,47,61,26,1,13,29,55,-82,76,26,15,-29,36,-29,10,-70,69,17,49];

console.log(threeSum1(numbers1));
console.log(threeSum1(numbers2));
console.log(threeSum1(numbers3));
console.log(threeSum1(numbers4));
console.log(threeSum1(numbers5));
console.log(threeSum1(numbers6));
console.log(threeSum1(numbers7));
// console.log(twoSum([2,7,11,15],9))
