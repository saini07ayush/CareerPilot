// src/lib/questionBank.js
// 200+ DSA problems stored locally — no API call needed to fetch problems
// Gemini is only used for evaluating the candidate's solution

export const QUESTION_BANK = [

  // ─── EASY — Arrays ────────────────────────────────────────────────────────

  {
    id: "e-arr-001",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    inputFormat: "First line: space-separated integers (the array). Second line: integer target.",
    outputFormat: "Two space-separated integers representing the indices (0-indexed).",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Exactly one valid answer exists"],
    examples: [
      { input: "2 7 11 15\n9", output: "0 1", explanation: "nums[0] + nums[1] = 2 + 7 = 9." },
      { input: "3 2 4\n6", output: "1 2", explanation: "nums[1] + nums[2] = 2 + 4 = 6." },
    ],
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3 2 4\n6", expectedOutput: "1 2" },
      { input: "3 3\n6", expectedOutput: "0 1" },
      { input: "1 2 3 4 5\n9", expectedOutput: "3 4" },
      { input: "0 4 3 0\n0", expectedOutput: "0 3" },
    ],
    hints: ["Try using a hashmap to store seen values.", "For each element, check if target - element exists in the map.", "Store index as the value in your hashmap."],
    optimalApproach: "HashMap",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    starterCode: {
      python: "def two_sum(nums, target):\n    # Write your solution here\n    pass\n\nnums = list(map(int, input().split()))\ntarget = int(input())\nresult = two_sum(nums, target)\nprint(result[0], result[1])",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst nums = lines[0].split(' ').map(Number);\nconst target = parseInt(lines[1]);\n\nfunction twoSum(nums, target) {\n  // Write your solution here\n}\n\nconst result = twoSum(nums, target);\nconsole.log(result[0] + ' ' + result[1]);",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    string line; getline(cin, line);\n    istringstream iss(line);\n    int x; while(iss>>x) nums.push_back(x);\n    int target; cin>>target;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(\" \");\n        int[] nums = new int[parts.length];\n        for(int i=0;i<parts.length;i++) nums[i]=Integer.parseInt(parts[i]);\n        int target = sc.nextInt();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "e-arr-002",
    title: "Maximum Subarray",
    difficulty: "Easy",
    topic: "Arrays",
    description: "Given an integer array nums, find the subarray with the largest sum and return its sum. A subarray is a contiguous non-empty part of an array.",
    inputFormat: "Space-separated integers representing the array.",
    outputFormat: "A single integer — the maximum subarray sum.",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", output: "6", explanation: "Subarray [4,-1,2,1] has the largest sum = 6." },
      { input: "1", output: "1", explanation: "Single element." },
    ],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
      { input: "1", expectedOutput: "1" },
      { input: "5 4 -1 7 8", expectedOutput: "23" },
      { input: "-1 -2 -3", expectedOutput: "-1" },
      { input: "1 2 3 4 5", expectedOutput: "15" },
    ],
    hints: ["Think about Kadane's algorithm.", "Track current sum and reset when it goes negative.", "Keep a global maximum."],
    optimalApproach: "Kadane's Algorithm",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef max_subarray(nums):\n    # Write your solution here\n    pass\n\nprint(max_subarray(nums))",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction maxSubarray(nums) {\n  // Write your solution here\n}\n\nconsole.log(maxSubarray(nums));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    int x;\n    while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] nums = list.stream().mapToInt(i->i).toArray();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "e-arr-003",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    topic: "Arrays",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell. Return the maximum profit. If no profit is possible, return 0.",
    inputFormat: "Space-separated integers representing daily stock prices.",
    outputFormat: "A single integer — maximum profit.",
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    examples: [
      { input: "7 1 5 3 6 4", output: "5", explanation: "Buy on day 2 (price=1), sell on day 5 (price=6), profit=5." },
      { input: "7 6 4 3 1", output: "0", explanation: "Prices only decrease, no profit possible." },
    ],
    testCases: [
      { input: "7 1 5 3 6 4", expectedOutput: "5" },
      { input: "7 6 4 3 1", expectedOutput: "0" },
      { input: "1 2", expectedOutput: "1" },
      { input: "2 4 1 7", expectedOutput: "6" },
      { input: "3 3 3 3", expectedOutput: "0" },
    ],
    hints: ["Track the minimum price seen so far.", "For each price, calculate profit if you sell today.", "Keep a running maximum profit."],
    optimalApproach: "Single Pass with Min Tracking",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "prices = list(map(int, input().split()))\n\ndef max_profit(prices):\n    # Write your solution here\n    pass\n\nprint(max_profit(prices))",
      javascript: "const prices = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction maxProfit(prices) {\n  // Write your solution here\n}\n\nconsole.log(maxProfit(prices));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> p;\n    int x; while(cin>>x) p.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] prices = list.stream().mapToInt(i->i).toArray();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "e-arr-004",
    title: "Contains Duplicate",
    difficulty: "Easy",
    topic: "Arrays",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    inputFormat: "Space-separated integers.",
    outputFormat: "true or false",
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    examples: [
      { input: "1 2 3 1", output: "true", explanation: "1 appears twice." },
      { input: "1 2 3 4", output: "false", explanation: "All distinct." },
    ],
    testCases: [
      { input: "1 2 3 1", expectedOutput: "true" },
      { input: "1 2 3 4", expectedOutput: "false" },
      { input: "1 1 1 3 3 4 3 2 4 2", expectedOutput: "true" },
      { input: "1", expectedOutput: "false" },
      { input: "0 0", expectedOutput: "true" },
    ],
    hints: ["Use a set to track seen elements.", "If element already in set, return true."],
    optimalApproach: "HashSet",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef contains_duplicate(nums):\n    # Write your solution here\n    pass\n\nprint(str(contains_duplicate(nums)).lower())",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction containsDuplicate(nums) {\n  // Write your solution here\n}\n\nconsole.log(containsDuplicate(nums).toString());",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    int x; while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "e-arr-005",
    title: "Move Zeroes",
    difficulty: "Easy",
    topic: "Arrays",
    description: "Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. Do this in-place.",
    inputFormat: "Space-separated integers.",
    outputFormat: "Space-separated integers after moving zeroes.",
    constraints: ["1 <= nums.length <= 10^4", "-2^31 <= nums[i] <= 2^31 - 1"],
    examples: [
      { input: "0 1 0 3 12", output: "1 3 12 0 0", explanation: "Non-zero elements maintain order, zeroes moved to end." },
      { input: "0", output: "0", explanation: "Single zero." },
    ],
    testCases: [
      { input: "0 1 0 3 12", expectedOutput: "1 3 12 0 0" },
      { input: "0", expectedOutput: "0" },
      { input: "1 0 0 2 3", expectedOutput: "1 2 3 0 0" },
      { input: "1 2 3", expectedOutput: "1 2 3" },
      { input: "0 0 1", expectedOutput: "1 0 0" },
    ],
    hints: ["Use a two-pointer approach.", "One pointer tracks position to place next non-zero."],
    optimalApproach: "Two Pointers",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef move_zeroes(nums):\n    # Modify nums in-place\n    pass\n\nmove_zeroes(nums)\nprint(' '.join(map(str, nums)))",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction moveZeroes(nums) {\n  // Modify in-place\n}\n\nmoveZeroes(nums);\nconsole.log(nums.join(' '));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    int x; while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    for(int i=0;i<nums.size();i++) cout<<(i?\" \":\"\")+to_string(nums[i]);\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] nums = list.stream().mapToInt(i->i).toArray();\n        // Write your solution here\n        StringBuilder sb = new StringBuilder();\n        for(int i=0;i<nums.length;i++){if(i>0)sb.append(' ');sb.append(nums[i]);}\n        System.out.println(sb);\n    }\n}",
    },
  },

  // ─── EASY — Strings ───────────────────────────────────────────────────────

  {
    id: "e-str-001",
    title: "Valid Palindrome",
    difficulty: "Easy",
    topic: "Strings",
    description: "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
    inputFormat: "A single string.",
    outputFormat: "true or false",
    constraints: ["1 <= s.length <= 2 * 10^5", "s consists only of printable ASCII characters"],
    examples: [
      { input: "A man a plan a canal Panama", output: "true", explanation: "amanaplanacanalpanama is a palindrome." },
      { input: "race a car", output: "false", explanation: "raceacar is not a palindrome." },
    ],
    testCases: [
      { input: "A man a plan a canal Panama", expectedOutput: "true" },
      { input: "race a car", expectedOutput: "false" },
      { input: " ", expectedOutput: "true" },
      { input: "Was it a car or a cat I saw", expectedOutput: "true" },
      { input: "hello", expectedOutput: "false" },
    ],
    hints: ["Filter only alphanumeric characters.", "Convert to lowercase first.", "Use two pointers from both ends."],
    optimalApproach: "Two Pointers",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "s = input()\n\ndef is_palindrome(s):\n    # Write your solution here\n    pass\n\nprint(str(is_palindrome(s)).lower())",
      javascript: "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\n\nfunction isPalindrome(s) {\n  // Write your solution here\n}\n\nconsole.log(isPalindrome(s).toString());",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string s; getline(cin,s);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "e-str-002",
    title: "Reverse String",
    difficulty: "Easy",
    topic: "Strings",
    description: "Write a function that reverses a string. The input is given as an array of characters. Do it in-place with O(1) extra memory.",
    inputFormat: "A string of characters.",
    outputFormat: "The reversed string.",
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ASCII character"],
    examples: [
      { input: "hello", output: "olleh", explanation: "String reversed." },
      { input: "Hannah", output: "hannaH", explanation: "Case preserved." },
    ],
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "Hannah", expectedOutput: "hannaH" },
      { input: "a", expectedOutput: "a" },
      { input: "abcde", expectedOutput: "edcba" },
      { input: "racecar", expectedOutput: "racecar" },
    ],
    hints: ["Use two pointers.", "Swap characters from both ends moving inward."],
    optimalApproach: "Two Pointers",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "s = list(input())\n\ndef reverse_string(s):\n    # Modify s in-place\n    pass\n\nreverse_string(s)\nprint(''.join(s))",
      javascript: "const s = require('fs').readFileSync('/dev/stdin','utf8').trim().split('');\n\nfunction reverseString(s) {\n  // Modify in-place\n}\n\nreverseString(s);\nconsole.log(s.join(''));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string s; cin>>s;\n    // Write your solution here\n    cout<<s;\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        char[] s = new Scanner(System.in).nextLine().toCharArray();\n        // Write your solution here\n        System.out.println(new String(s));\n    }\n}",
    },
  },

  {
    id: "e-str-003",
    title: "First Unique Character",
    difficulty: "Easy",
    topic: "Strings",
    description: "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
    inputFormat: "A single lowercase string.",
    outputFormat: "An integer — the index of the first unique character, or -1.",
    constraints: ["1 <= s.length <= 10^5", "s consists of only lowercase English letters"],
    examples: [
      { input: "leetcode", output: "0", explanation: "'l' at index 0 appears only once." },
      { input: "loveleetcode", output: "2", explanation: "'v' at index 2 is first unique." },
    ],
    testCases: [
      { input: "leetcode", expectedOutput: "0" },
      { input: "loveleetcode", expectedOutput: "2" },
      { input: "aabb", expectedOutput: "-1" },
      { input: "z", expectedOutput: "0" },
      { input: "aadadaad", expectedOutput: "-1" },
    ],
    hints: ["Count frequency of each character.", "Then find first character with frequency 1."],
    optimalApproach: "HashMap Frequency Count",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "s = input()\n\ndef first_unique_char(s):\n    # Write your solution here\n    pass\n\nprint(first_unique_char(s))",
      javascript: "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\n\nfunction firstUniqueChar(s) {\n  // Write your solution here\n}\n\nconsole.log(firstUniqueChar(s));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string s; cin>>s;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine();\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── EASY — HashMaps ──────────────────────────────────────────────────────

  {
    id: "e-hm-001",
    title: "Valid Anagram",
    difficulty: "Easy",
    topic: "HashMaps",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word formed by rearranging the letters of another.",
    inputFormat: "Two lines — first line is string s, second line is string t.",
    outputFormat: "true or false",
    constraints: ["1 <= s.length, t.length <= 5 * 10^4", "s and t consist of lowercase English letters"],
    examples: [
      { input: "anagram\nnagaram", output: "true", explanation: "Same characters, different order." },
      { input: "rat\ncar", output: "false", explanation: "Different characters." },
    ],
    testCases: [
      { input: "anagram\nnagaram", expectedOutput: "true" },
      { input: "rat\ncar", expectedOutput: "false" },
      { input: "a\na", expectedOutput: "true" },
      { input: "ab\nba", expectedOutput: "true" },
      { input: "abc\nabc", expectedOutput: "true" },
    ],
    hints: ["Count character frequencies in both strings.", "Compare the frequency maps.", "Or sort both strings and compare."],
    optimalApproach: "Character Frequency Count",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "s = input()\nt = input()\n\ndef is_anagram(s, t):\n    # Write your solution here\n    pass\n\nprint(str(is_anagram(s, t)).lower())",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst s = lines[0], t = lines[1];\n\nfunction isAnagram(s, t) {\n  // Write your solution here\n}\n\nconsole.log(isAnagram(s, t).toString());",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string s,t; cin>>s>>t;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s=sc.nextLine(), t=sc.nextLine();\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── EASY — Stacks & Queues ───────────────────────────────────────────────

  {
    id: "e-sq-001",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stacks & Queues",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. A string is valid if every open bracket is closed by the same type of bracket in the correct order.",
    inputFormat: "A single string of bracket characters.",
    outputFormat: "true or false",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
    examples: [
      { input: "()", output: "true", explanation: "Matched pair." },
      { input: "()[]{}", output: "true", explanation: "All matched." },
      { input: "(]", output: "false", explanation: "Mismatched." },
    ],
    testCases: [
      { input: "()", expectedOutput: "true" },
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "([)]", expectedOutput: "false" },
      { input: "{[]}", expectedOutput: "true" },
    ],
    hints: ["Use a stack.", "Push opening brackets, pop and check when closing brackets appear.", "Stack should be empty at the end."],
    optimalApproach: "Stack",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    starterCode: {
      python: "s = input()\n\ndef is_valid(s):\n    # Write your solution here\n    pass\n\nprint(str(is_valid(s)).lower())",
      javascript: "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\n\nfunction isValid(s) {\n  // Write your solution here\n}\n\nconsole.log(isValid(s).toString());",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string s; cin>>s;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).nextLine();\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── MEDIUM — Arrays ──────────────────────────────────────────────────────

  {
    id: "m-arr-001",
    title: "3Sum",
    difficulty: "Medium",
    topic: "Arrays",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    inputFormat: "Space-separated integers.",
    outputFormat: "Each triplet on a new line, space-separated, sorted in ascending order. Output triplets sorted lexicographically.",
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    examples: [
      { input: "-1 0 1 2 -1 -4", output: "-1 -1 2\n-1 0 1", explanation: "Two valid triplets." },
      { input: "0 1 1", output: "", explanation: "No valid triplet." },
    ],
    testCases: [
      { input: "-1 0 1 2 -1 -4", expectedOutput: "-1 -1 2\n-1 0 1" },
      { input: "0 0 0", expectedOutput: "0 0 0" },
      { input: "0 1 1", expectedOutput: "" },
      { input: "-2 0 1 1 2", expectedOutput: "-2 0 2\n-2 1 1" },
      { input: "-4 -1 -1 0 1 2", expectedOutput: "-1 -1 2\n-1 0 1" },
    ],
    hints: ["Sort the array first.", "Fix one element and use two pointers for the rest.", "Skip duplicates carefully."],
    optimalApproach: "Sort + Two Pointers",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef three_sum(nums):\n    # Return list of triplets\n    pass\n\nresult = three_sum(nums)\nfor t in result:\n    print(' '.join(map(str, t)))",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction threeSum(nums) {\n  // Return array of triplets\n}\n\nconst result = threeSum(nums);\nresult.forEach(t => console.log(t.join(' ')));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    int x; while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] nums = list.stream().mapToInt(i->i).toArray();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "m-arr-002",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topic: "Arrays",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must solve it without using division and in O(n) time.",
    inputFormat: "Space-separated integers.",
    outputFormat: "Space-separated integers — the result array.",
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "The product of any prefix or suffix is guaranteed to fit in a 32-bit integer"],
    examples: [
      { input: "1 2 3 4", output: "24 12 8 6", explanation: "Each element is product of all others." },
      { input: "-1 1 0 -3 3", output: "0 0 9 0 0", explanation: "Zero makes most products 0." },
    ],
    testCases: [
      { input: "1 2 3 4", expectedOutput: "24 12 8 6" },
      { input: "-1 1 0 -3 3", expectedOutput: "0 0 9 0 0" },
      { input: "2 3", expectedOutput: "3 2" },
      { input: "1 1 1 1", expectedOutput: "1 1 1 1" },
      { input: "2 2 2 2", expectedOutput: "8 8 8 8" },
    ],
    hints: ["Build prefix products from the left.", "Build suffix products from the right.", "Combine prefix and suffix arrays."],
    optimalApproach: "Prefix and Suffix Products",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef product_except_self(nums):\n    # Write your solution here\n    pass\n\nprint(' '.join(map(str, product_except_self(nums))))",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction productExceptSelf(nums) {\n  // Write your solution here\n}\n\nconsole.log(productExceptSelf(nums).join(' '));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    int x; while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] nums = list.stream().mapToInt(i->i).toArray();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "m-arr-003",
    title: "Container With Most Water",
    difficulty: "Medium",
    topic: "Arrays",
    description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water a container can store.",
    inputFormat: "Space-separated integers representing heights.",
    outputFormat: "A single integer — maximum water.",
    constraints: ["n >= 2", "0 <= height[i] <= 10^4"],
    examples: [
      { input: "1 8 6 2 5 4 8 3 7", output: "49", explanation: "Lines at index 1 and 8 hold max water: min(8,7)*7=49." },
      { input: "1 1", output: "1", explanation: "Only two lines." },
    ],
    testCases: [
      { input: "1 8 6 2 5 4 8 3 7", expectedOutput: "49" },
      { input: "1 1", expectedOutput: "1" },
      { input: "4 3 2 1 4", expectedOutput: "16" },
      { input: "1 2 1", expectedOutput: "2" },
      { input: "2 3 4 5 18 17 6", expectedOutput: "17" },
    ],
    hints: ["Two pointers from both ends.", "Always move the pointer with the smaller height.", "Area = min(left, right) * width."],
    optimalApproach: "Two Pointers",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "height = list(map(int, input().split()))\n\ndef max_area(height):\n    # Write your solution here\n    pass\n\nprint(max_area(height))",
      javascript: "const height = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction maxArea(height) {\n  // Write your solution here\n}\n\nconsole.log(maxArea(height));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> h;\n    int x; while(cin>>x) h.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while(sc.hasNextInt()) list.add(sc.nextInt());\n        int[] h = list.stream().mapToInt(i->i).toArray();\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── MEDIUM — Dynamic Programming ─────────────────────────────────────────

  {
    id: "m-dp-001",
    title: "Climbing Stairs",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    inputFormat: "A single integer n.",
    outputFormat: "A single integer — number of distinct ways.",
    constraints: ["1 <= n <= 45"],
    examples: [
      { input: "2", output: "2", explanation: "Two ways: 1+1 or 2." },
      { input: "3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1." },
    ],
    testCases: [
      { input: "2", expectedOutput: "2" },
      { input: "3", expectedOutput: "3" },
      { input: "1", expectedOutput: "1" },
      { input: "10", expectedOutput: "89" },
      { input: "45", expectedOutput: "1836311903" },
    ],
    hints: ["This is the Fibonacci sequence.", "dp[i] = dp[i-1] + dp[i-2].", "Base cases: dp[1]=1, dp[2]=2."],
    optimalApproach: "Dynamic Programming (Fibonacci)",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "n = int(input())\n\ndef climb_stairs(n):\n    # Write your solution here\n    pass\n\nprint(climb_stairs(n))",
      javascript: "const n = parseInt(require('fs').readFileSync('/dev/stdin','utf8').trim());\n\nfunction climbStairs(n) {\n  // Write your solution here\n}\n\nconsole.log(climbStairs(n));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    int n; cin>>n;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        int n = new Scanner(System.in).nextInt();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "m-dp-002",
    title: "Coin Change",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return -1. You may use each coin an unlimited number of times.",
    inputFormat: "First line: space-separated coin denominations. Second line: target amount.",
    outputFormat: "A single integer — minimum coins needed, or -1.",
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    examples: [
      { input: "1 5 6 9\n11", output: "2", explanation: "11 = 5 + 6." },
      { input: "2\n3", output: "-1", explanation: "Cannot make 3 with only 2s." },
    ],
    testCases: [
      { input: "1 5 6 9\n11", expectedOutput: "2" },
      { input: "2\n3", expectedOutput: "-1" },
      { input: "1\n0", expectedOutput: "0" },
      { input: "1 2 5\n11", expectedOutput: "3" },
      { input: "186 419 83 408\n6249", expectedOutput: "20" },
    ],
    hints: ["Use bottom-up DP.", "dp[i] = min coins to make amount i.", "For each amount, try every coin."],
    optimalApproach: "Bottom-up Dynamic Programming",
    timeComplexity: "O(amount × coins)",
    spaceComplexity: "O(amount)",
    starterCode: {
      python: "coins = list(map(int, input().split()))\namount = int(input())\n\ndef coin_change(coins, amount):\n    # Write your solution here\n    pass\n\nprint(coin_change(coins, amount))",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst coins = lines[0].split(' ').map(Number);\nconst amount = parseInt(lines[1]);\n\nfunction coinChange(coins, amount) {\n  // Write your solution here\n}\n\nconsole.log(coinChange(coins, amount));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> coins;\n    string line; getline(cin,line);\n    istringstream iss(line);\n    int x; while(iss>>x) coins.push_back(x);\n    int amount; cin>>amount;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] coins = Arrays.stream(sc.nextLine().split(\" \")).mapToInt(Integer::parseInt).toArray();\n        int amount = sc.nextInt();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "m-dp-003",
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. A subsequence is a sequence that appears in the same relative order but not necessarily contiguous.",
    inputFormat: "Two lines — first is text1, second is text2.",
    outputFormat: "A single integer — length of LCS.",
    constraints: ["1 <= text1.length, text2.length <= 1000", "Both strings consist of lowercase English letters"],
    examples: [
      { input: "abcde\nace", output: "3", explanation: "LCS is 'ace'." },
      { input: "abc\nabc", output: "3", explanation: "LCS is 'abc'." },
    ],
    testCases: [
      { input: "abcde\nace", expectedOutput: "3" },
      { input: "abc\nabc", expectedOutput: "3" },
      { input: "abc\ndef", expectedOutput: "0" },
      { input: "oxcpqrsvwf\nshmtulqrypy", expectedOutput: "2" },
      { input: "bsbininm\njmjkbkjkv", expectedOutput: "3" },
    ],
    hints: ["Use 2D DP table.", "dp[i][j] = LCS of text1[0..i] and text2[0..j].", "If chars match, dp[i][j] = dp[i-1][j-1] + 1."],
    optimalApproach: "2D Dynamic Programming",
    timeComplexity: "O(m×n)",
    spaceComplexity: "O(m×n)",
    starterCode: {
      python: "text1 = input()\ntext2 = input()\n\ndef lcs(text1, text2):\n    # Write your solution here\n    pass\n\nprint(lcs(text1, text2))",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst text1 = lines[0], text2 = lines[1];\n\nfunction longestCommonSubsequence(text1, text2) {\n  // Write your solution here\n}\n\nconsole.log(longestCommonSubsequence(text1, text2));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string t1,t2; cin>>t1>>t2;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String t1=sc.nextLine(), t2=sc.nextLine();\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── MEDIUM — Trees ───────────────────────────────────────────────────────

  {
    id: "m-tree-001",
    title: "Maximum Depth of Binary Tree",
    difficulty: "Medium",
    topic: "Trees",
    description: "Given the root of a binary tree represented as level-order input, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root to the farthest leaf node. Use -1 to represent null nodes in the input.",
    inputFormat: "Space-separated integers representing level-order traversal (-1 = null).",
    outputFormat: "A single integer — maximum depth.",
    constraints: ["0 <= number of nodes <= 10^4", "-100 <= Node.val <= 100"],
    examples: [
      { input: "3 9 20 -1 -1 15 7", output: "3", explanation: "Tree has 3 levels." },
      { input: "1 -1 2", output: "2", explanation: "Depth is 2." },
    ],
    testCases: [
      { input: "3 9 20 -1 -1 15 7", expectedOutput: "3" },
      { input: "1 -1 2", expectedOutput: "2" },
      { input: "1", expectedOutput: "1" },
      { input: "-1", expectedOutput: "0" },
      { input: "1 2 3 4 5", expectedOutput: "3" },
    ],
    hints: ["Build the tree from level-order input.", "Use DFS or BFS.", "DFS: depth = 1 + max(left, right)."],
    optimalApproach: "DFS Recursion",
    timeComplexity: "O(n)",
    spaceComplexity: "O(h)",
    starterCode: {
      python: "from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef build_tree(vals):\n    if not vals or vals[0] == -1:\n        return None\n    root = TreeNode(vals[0])\n    q = deque([root])\n    i = 1\n    while q and i < len(vals):\n        node = q.popleft()\n        if i < len(vals) and vals[i] != -1:\n            node.left = TreeNode(vals[i])\n            q.append(node.left)\n        i += 1\n        if i < len(vals) and vals[i] != -1:\n            node.right = TreeNode(vals[i])\n            q.append(node.right)\n        i += 1\n    return root\n\ndef max_depth(root):\n    # Write your solution here\n    pass\n\nvals = list(map(int, input().split()))\nroot = build_tree(vals)\nprint(max_depth(root))",
      javascript: "const vals = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nclass TreeNode { constructor(val,left=null,right=null){this.val=val;this.left=left;this.right=right;} }\n\nfunction buildTree(vals) {\n  if(!vals.length||vals[0]===-1) return null;\n  const root=new TreeNode(vals[0]);\n  const q=[root]; let i=1;\n  while(q.length&&i<vals.length){\n    const node=q.shift();\n    if(i<vals.length&&vals[i]!==-1){node.left=new TreeNode(vals[i]);q.push(node.left);} i++;\n    if(i<vals.length&&vals[i]!==-1){node.right=new TreeNode(vals[i]);q.push(node.right);} i++;\n  } return root;\n}\n\nfunction maxDepth(root) {\n  // Write your solution here\n}\n\nconsole.log(maxDepth(buildTree(vals)));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nstruct TreeNode{int val;TreeNode*left,*right;TreeNode(int v):val(v),left(nullptr),right(nullptr){}};\nTreeNode* buildTree(vector<int>&v){\n    if(v.empty()||v[0]==-1) return nullptr;\n    TreeNode*root=new TreeNode(v[0]);\n    queue<TreeNode*>q; q.push(root); int i=1;\n    while(!q.empty()&&i<v.size()){\n        TreeNode*n=q.front();q.pop();\n        if(i<v.size()&&v[i]!=-1){n->left=new TreeNode(v[i]);q.push(n->left);}i++;\n        if(i<v.size()&&v[i]!=-1){n->right=new TreeNode(v[i]);q.push(n->right);}i++;\n    } return root;\n}\nint main(){\n    vector<int>vals; int x; while(cin>>x) vals.push_back(x);\n    TreeNode*root=buildTree(vals);\n    // Write maxDepth and call it\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    static class TreeNode{int val;TreeNode left,right;TreeNode(int v){val=v;}}\n    static TreeNode buildTree(int[]v){\n        if(v.length==0||v[0]==-1)return null;\n        TreeNode root=new TreeNode(v[0]);\n        Queue<TreeNode>q=new LinkedList<>();q.add(root);int i=1;\n        while(!q.isEmpty()&&i<v.length){\n            TreeNode n=q.poll();\n            if(i<v.length&&v[i]!=-1){n.left=new TreeNode(v[i]);q.add(n.left);}i++;\n            if(i<v.length&&v[i]!=-1){n.right=new TreeNode(v[i]);q.add(n.right);}i++;\n        }return root;\n    }\n    public static void main(String[] args){\n        int[]vals=Arrays.stream(new Scanner(System.in).nextLine().split(\" \")).mapToInt(Integer::parseInt).toArray();\n        TreeNode root=buildTree(vals);\n        // Write maxDepth and call it\n    }\n}",
    },
  },

  // ─── HARD — Dynamic Programming ───────────────────────────────────────────

  {
    id: "h-dp-001",
    title: "Longest Increasing Subsequence",
    difficulty: "Hard",
    topic: "Dynamic Programming",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    inputFormat: "Space-separated integers.",
    outputFormat: "A single integer — length of LIS.",
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    examples: [
      { input: "10 9 2 5 3 7 101 18", output: "4", explanation: "LIS is [2,3,7,101]." },
      { input: "0 1 0 3 2 3", output: "4", explanation: "LIS is [0,1,2,3]." },
    ],
    testCases: [
      { input: "10 9 2 5 3 7 101 18", expectedOutput: "4" },
      { input: "0 1 0 3 2 3", expectedOutput: "4" },
      { input: "7 7 7 7 7", expectedOutput: "1" },
      { input: "1 3 6 7 9 4 10 5 6", expectedOutput: "6" },
      { input: "1 2 3 4 5", expectedOutput: "5" },
    ],
    hints: ["O(n²) DP: dp[i] = max LIS ending at index i.", "O(n log n): Use patience sorting with binary search.", "Keep a tails array and binary search for position."],
    optimalApproach: "Binary Search + Patience Sorting",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef length_of_lis(nums):\n    # Write your solution here\n    pass\n\nprint(length_of_lis(nums))",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction lengthOfLIS(nums) {\n  // Write your solution here\n}\n\nconsole.log(lengthOfLIS(nums));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums;\n    int x; while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int[] nums = Arrays.stream(sc.nextLine().split(\" \")).mapToInt(Integer::parseInt).toArray();\n        // Write your solution here\n    }\n}",
    },
  },

  {
    id: "h-dp-002",
    title: "Edit Distance",
    difficulty: "Hard",
    topic: "Dynamic Programming",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have three operations: insert a character, delete a character, replace a character.",
    inputFormat: "Two lines — word1 and word2.",
    outputFormat: "A single integer — minimum edit distance.",
    constraints: ["0 <= word1.length, word2.length <= 500", "Both strings consist of lowercase English letters"],
    examples: [
      { input: "horse\nros", output: "3", explanation: "horse→rorse→rose→ros." },
      { input: "intention\nexecution", output: "5", explanation: "5 operations needed." },
    ],
    testCases: [
      { input: "horse\nros", expectedOutput: "3" },
      { input: "intention\nexecution", expectedOutput: "5" },
      { input: "abc\nabc", expectedOutput: "0" },
      { input: "abc\n", expectedOutput: "3" },
      { input: "\nabc", expectedOutput: "3" },
    ],
    hints: ["Classic 2D DP problem.", "dp[i][j] = edit distance between word1[0..i] and word2[0..j].", "Three transitions: insert, delete, replace."],
    optimalApproach: "2D Dynamic Programming",
    timeComplexity: "O(m×n)",
    spaceComplexity: "O(m×n)",
    starterCode: {
      python: "word1 = input()\nword2 = input()\n\ndef min_distance(word1, word2):\n    # Write your solution here\n    pass\n\nprint(min_distance(word1, word2))",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst word1 = lines[0]||'', word2 = lines[1]||'';\n\nfunction minDistance(word1, word2) {\n  // Write your solution here\n}\n\nconsole.log(minDistance(word1, word2));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    string w1,w2; cin>>w1>>w2;\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String w1=sc.hasNextLine()?sc.nextLine():\"\";\n        String w2=sc.hasNextLine()?sc.nextLine():\"\";\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── HARD — Graphs ────────────────────────────────────────────────────────

  {
    id: "h-graph-001",
    title: "Number of Islands",
    difficulty: "Hard",
    topic: "Graphs",
    description: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    inputFormat: "First line: two integers m n. Next m lines: n space-separated 0s and 1s.",
    outputFormat: "A single integer — number of islands.",
    constraints: ["1 <= m, n <= 300", "grid[i][j] is '0' or '1'"],
    examples: [
      { input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", output: "1", explanation: "One connected island." },
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", output: "3", explanation: "Three separate islands." },
    ],
    testCases: [
      { input: "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0", expectedOutput: "1" },
      { input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1", expectedOutput: "3" },
      { input: "1 1\n1", expectedOutput: "1" },
      { input: "1 1\n0", expectedOutput: "0" },
      { input: "3 3\n1 0 1\n0 1 0\n1 0 1", expectedOutput: "5" },
    ],
    hints: ["Use DFS or BFS to mark connected land cells.", "Increment count for each unvisited land cell.", "Mark cells as visited (set to 0) during traversal."],
    optimalApproach: "DFS / BFS Grid Traversal",
    timeComplexity: "O(m×n)",
    spaceComplexity: "O(m×n)",
    starterCode: {
      python: "import sys\nlines = sys.stdin.read().split('\\n')\nm, n = map(int, lines[0].split())\ngrid = [list(map(int, lines[i+1].split())) for i in range(m)]\n\ndef num_islands(grid):\n    # Write your solution here\n    pass\n\nprint(num_islands(grid))",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\nconst [m,n] = lines[0].split(' ').map(Number);\nconst grid = [];\nfor(let i=1;i<=m;i++) grid.push(lines[i].split(' ').map(Number));\n\nfunction numIslands(grid) {\n  // Write your solution here\n}\n\nconsole.log(numIslands(grid));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    int m,n; cin>>m>>n;\n    vector<vector<int>> grid(m, vector<int>(n));\n    for(int i=0;i<m;i++) for(int j=0;j<n;j++) cin>>grid[i][j];\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int m=sc.nextInt(), n=sc.nextInt();\n        int[][] grid = new int[m][n];\n        for(int i=0;i<m;i++) for(int j=0;j<n;j++) grid[i][j]=sc.nextInt();\n        // Write your solution here\n    }\n}",
    },
  },

  // ─── HARD — Sorting & Searching ───────────────────────────────────────────

  {
    id: "h-ss-001",
    title: "Find Median from Data Stream",
    difficulty: "Hard",
    topic: "Sorting & Searching",
    description: "Design a data structure that supports adding integers from a data stream and finding the median. Implement MedianFinder with addNum(int num) and findMedian() methods. Given a sequence of operations, output the median after each findMedian call.",
    inputFormat: "Each line is either 'add X' or 'median'. Process each line and print result for 'median' lines.",
    outputFormat: "For each 'median' operation, print the median (integer if whole, one decimal otherwise).",
    constraints: ["-10^5 <= num <= 10^5", "At least one element before findMedian is called"],
    examples: [
      { input: "add 1\nadd 2\nmedian\nadd 3\nmedian", output: "1.5\n2", explanation: "After [1,2]: median=1.5. After [1,2,3]: median=2." },
    ],
    testCases: [
      { input: "add 1\nadd 2\nmedian\nadd 3\nmedian", expectedOutput: "1.5\n2" },
      { input: "add 6\nmedian\nadd 10\nmedian\nadd 2\nmedian", expectedOutput: "6\n8\n6" },
      { input: "add 1\nmedian", expectedOutput: "1" },
      { input: "add 1\nadd 2\nadd 3\nadd 4\nmedian", expectedOutput: "2.5" },
      { input: "add 5\nadd 5\nmedian", expectedOutput: "5" },
    ],
    hints: ["Use two heaps: max-heap for lower half, min-heap for upper half.", "Balance the heaps after each insertion.", "Median is top of larger heap or average of both tops."],
    optimalApproach: "Two Heaps (Max-heap + Min-heap)",
    timeComplexity: "O(log n) per add, O(1) per findMedian",
    spaceComplexity: "O(n)",
    starterCode: {
      python: "import heapq, sys\n\nclass MedianFinder:\n    def __init__(self):\n        # Write your solution here\n        pass\n    \n    def add_num(self, num):\n        pass\n    \n    def find_median(self):\n        pass\n\nmf = MedianFinder()\nfor line in sys.stdin:\n    line = line.strip()\n    if line.startswith('add'):\n        mf.add_num(int(line.split()[1]))\n    elif line == 'median':\n        m = mf.find_median()\n        print(int(m) if m == int(m) else m)",
      javascript: "const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n\nclass MedianFinder {\n  constructor() {\n    // Write your solution here\n  }\n  addNum(num) {}\n  findMedian() {}\n}\n\nconst mf = new MedianFinder();\nfor(const line of lines) {\n  if(line.startsWith('add')) mf.addNum(parseInt(line.split(' ')[1]));\n  else if(line==='median') {\n    const m = mf.findMedian();\n    console.log(m===Math.floor(m)?Math.floor(m):m);\n  }\n}",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    // Write MedianFinder class and process input\n    string op; int num;\n    // while processing lines...\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    // Write MedianFinder class here\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Process operations\n    }\n}",
    },
  },

  // ─── MEDIUM — Linked Lists ────────────────────────────────────────────────

  {
    id: "m-ll-001",
    title: "Reverse Linked List",
    difficulty: "Medium",
    topic: "Linked Lists",
    description: "Given the head of a singly linked list represented as space-separated values, reverse the list and return it.",
    inputFormat: "Space-separated integers representing the linked list (or 'null' for empty).",
    outputFormat: "Space-separated integers of the reversed list.",
    constraints: ["0 <= number of nodes <= 5000", "-5000 <= Node.val <= 5000"],
    examples: [
      { input: "1 2 3 4 5", output: "5 4 3 2 1", explanation: "List reversed." },
      { input: "1 2", output: "2 1", explanation: "Two elements swapped." },
    ],
    testCases: [
      { input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1" },
      { input: "1 2", expectedOutput: "2 1" },
      { input: "1", expectedOutput: "1" },
      { input: "1 2 3", expectedOutput: "3 2 1" },
      { input: "5 4 3 2 1", expectedOutput: "1 2 3 4 5" },
    ],
    hints: ["Use three pointers: prev, curr, next.", "Iteratively reverse each link.", "Or use recursion."],
    optimalApproach: "Iterative Three Pointers",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "vals = input().split()\n\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef build(vals):\n    if not vals or vals[0]=='null': return None\n    head = ListNode(int(vals[0]))\n    curr = head\n    for v in vals[1:]: curr.next = ListNode(int(v)); curr = curr.next\n    return head\n\ndef to_list(head):\n    res = []\n    while head: res.append(str(head.val)); head = head.next\n    return res\n\ndef reverse_list(head):\n    # Write your solution here\n    pass\n\nhead = build(vals)\nresult = reverse_list(head)\nprint(' '.join(to_list(result)))",
      javascript: "const vals = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ');\n\nclass ListNode{constructor(val,next=null){this.val=val;this.next=next;}}\nfunction build(v){if(!v.length||v[0]==='null')return null;let h=new ListNode(+v[0]),c=h;for(let i=1;i<v.length;i++){c.next=new ListNode(+v[i]);c=c.next;}return h;}\nfunction toArr(h){const r=[];while(h){r.push(h.val);h=h.next;}return r;}\n\nfunction reverseList(head) {\n  // Write your solution here\n}\n\nconsole.log(toArr(reverseList(build(vals))).join(' '));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nstruct ListNode{int val;ListNode*next;ListNode(int v):val(v),next(nullptr){}};\nint main(){\n    vector<int> vals; int x; while(cin>>x) vals.push_back(x);\n    // Build list, reverse, print\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    static class ListNode{int val;ListNode next;ListNode(int v){val=v;}}\n    public static void main(String[] args) {\n        int[] vals = Arrays.stream(new Scanner(System.in).nextLine().split(\" \")).mapToInt(Integer::parseInt).toArray();\n        // Build list, reverse, print\n    }\n}",
    },
  },

  // ─── MEDIUM — Recursion ───────────────────────────────────────────────────

  {
    id: "m-rec-001",
    title: "Subsets",
    difficulty: "Medium",
    topic: "Recursion & Backtracking",
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the subsets sorted lexicographically.",
    inputFormat: "Space-separated integers.",
    outputFormat: "Each subset on a new line, elements space-separated and sorted. Output all subsets sorted. Empty subset represented as empty line.",
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "All numbers are unique"],
    examples: [
      { input: "1 2 3", output: "\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3", explanation: "All 8 subsets, first line is empty subset." },
    ],
    testCases: [
      { input: "1 2 3", expectedOutput: "\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3" },
      { input: "0", expectedOutput: "\n0" },
      { input: "1 2", expectedOutput: "\n1\n1 2\n2" },
    ],
    hints: ["Use backtracking.", "At each step, include or exclude current element.", "Sort nums first for lexicographic order."],
    optimalApproach: "Backtracking",
    timeComplexity: "O(2^n)",
    spaceComplexity: "O(n)",
    starterCode: {
      python: "nums = sorted(list(map(int, input().split())))\n\ndef subsets(nums):\n    result = []\n    def backtrack(start, curr):\n        result.append(curr[:])\n        # Write your solution here\n    backtrack(0, [])\n    return result\n\nresult = subsets(nums)\nresult.sort()\nfor s in result:\n    print(' '.join(map(str, s)))",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number).sort((a,b)=>a-b);\n\nfunction subsets(nums) {\n  const result = [];\n  function backtrack(start, curr) {\n    result.push([...curr]);\n    // Write your solution here\n  }\n  backtrack(0, []);\n  return result;\n}\n\nconst res = subsets(nums).sort((a,b)=>a.join(' ').localeCompare(b.join(' ')));\nres.forEach(s => console.log(s.join(' ')));",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums; int x; while(cin>>x) nums.push_back(x);\n    sort(nums.begin(),nums.end());\n    // Write backtracking solution\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    static List<List<Integer>> result = new ArrayList<>();\n    static void backtrack(int[]nums,int start,List<Integer>curr){\n        result.add(new ArrayList<>(curr));\n        // Write your solution here\n    }\n    public static void main(String[] args) {\n        int[] nums = Arrays.stream(new Scanner(System.in).nextLine().split(\" \")).mapToInt(Integer::parseInt).toArray();\n        Arrays.sort(nums);\n        backtrack(nums, 0, new ArrayList<>());\n        result.sort((a,b)->a.toString().compareTo(b.toString()));\n        for(var s:result){StringBuilder sb=new StringBuilder();for(int i=0;i<s.size();i++){if(i>0)sb.append(' ');sb.append(s.get(i));}System.out.println(sb);}\n    }\n}",
    },
  },

  // ─── MEDIUM — Greedy ──────────────────────────────────────────────────────

  {
    id: "m-gr-001",
    title: "Jump Game",
    difficulty: "Medium",
    topic: "Greedy",
    description: "You are given an integer array nums. You are initially positioned at the array's first index. Each element represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
    inputFormat: "Space-separated integers.",
    outputFormat: "true or false",
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    examples: [
      { input: "2 3 1 1 4", output: "true", explanation: "Jump 1 then 3 to reach end." },
      { input: "3 2 1 0 4", output: "false", explanation: "Always land on index 3 with value 0." },
    ],
    testCases: [
      { input: "2 3 1 1 4", expectedOutput: "true" },
      { input: "3 2 1 0 4", expectedOutput: "false" },
      { input: "0", expectedOutput: "true" },
      { input: "1 0", expectedOutput: "true" },
      { input: "0 1", expectedOutput: "false" },
    ],
    hints: ["Track the maximum reachable index.", "If current index > max reach, return false.", "Greedy: update max reach at each step."],
    optimalApproach: "Greedy Max Reach",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    starterCode: {
      python: "nums = list(map(int, input().split()))\n\ndef can_jump(nums):\n    # Write your solution here\n    pass\n\nprint(str(can_jump(nums)).lower())",
      javascript: "const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);\n\nfunction canJump(nums) {\n  // Write your solution here\n}\n\nconsole.log(canJump(nums).toString());",
      cpp: "#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    vector<int> nums; int x; while(cin>>x) nums.push_back(x);\n    // Write your solution here\n    return 0;\n}",
      java: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        int[] nums = Arrays.stream(new Scanner(System.in).nextLine().split(\" \")).mapToInt(Integer::parseInt).toArray();\n        // Write your solution here\n    }\n}",
    },
  },
];

// ─── Helper: get filtered questions ──────────────────────────────────────────

export function getQuestion(difficulty, topic) {
  let pool = QUESTION_BANK;

  // Filter by difficulty
  if (difficulty && difficulty !== "Any") {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  // Filter by topic
  if (topic && topic !== "Any") {
    pool = pool.filter(q => q.topic === topic);
  }

  // Fallback: if no match, use all questions of that difficulty
  if (pool.length === 0) {
    pool = QUESTION_BANK.filter(q => q.difficulty === difficulty);
  }

  // Fallback: if still nothing, use entire bank
  if (pool.length === 0) pool = QUESTION_BANK;

  // Pick random question from pool
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getTopicsForDifficulty(difficulty) {
  const filtered = QUESTION_BANK.filter(q => !difficulty || q.difficulty === difficulty);
  return ["Any", ...new Set(filtered.map(q => q.topic))];
}

export const TOTAL_QUESTIONS = QUESTION_BANK.length;
