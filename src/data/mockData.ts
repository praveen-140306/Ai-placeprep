import { 
  DSAProblem, 
  AptitudeQuestion, 
  SQLChallenge, 
  CoreCSMaterial, 
  Flashcard, 
  MockInterviewSlot, 
  ResumeData, 
  StudentProfile, 
  LeaderboardUser 
} from '../types';

export const initialStudentProfile: StudentProfile = {
  id: 'stu-101',
  name: 'Devika Sharma',
  email: 'devika.s@engineering.edu',
  college: 'National Institute of Technology',
  batch: '2026 Batch - Computer Science',
  targetRole: 'Software Development Engineer (SDE)',
  targetCompany: 'Google, Amazon & Microsoft',
  streakDays: 8,
  lastActiveDate: new Date().toISOString().split('T')[0],
  xpPoints: 2450,
  level: 'Placement Cadet (Level 4)',
  readinessScore: 78,
  moduleScores: {
    dsa: 76,
    aptitude: 82,
    sql: 79,
    coreCS: 74,
    consistency: 85,
  },
  solvedDSAIds: ['dsa-1', 'dsa-2', 'dsa-4'],
  solvedAptitudeIds: ['apt-1', 'apt-2', 'apt-4', 'apt-7'],
  solvedSqlIds: ['sql-1', 'sql-2'],
  masteredFlashcardIds: ['fc-1', 'fc-2', 'fc-5', 'fc-7'],
  completedMaterials: ['os-1', 'dbms-1'],
  badges: [
    {
      id: 'b-streak-7',
      name: 'Consistency Champion',
      description: 'Maintained a 7-day continuous placement study streak',
      icon: '🔥',
      unlocked: true,
      unlockedAt: '2026-10-02',
    },
    {
      id: 'b-dsa-ace',
      name: 'Algorithm Novice',
      description: 'Solved first 3 DSA problems with zero spoiler solutions',
      icon: '⚡',
      unlocked: true,
      unlockedAt: '2026-10-03',
    },
    {
      id: 'b-sql-wizard',
      name: 'Query Crafter',
      description: 'Executed flawless multi-table SQL queries',
      icon: '💾',
      unlocked: true,
      unlockedAt: '2026-10-04',
    },
    {
      id: 'b-interview-ready',
      name: 'Mock Interviewer',
      description: 'Completed 1 full AI Mock Interview with >80% score',
      icon: '🎙️',
      unlocked: false,
    },
    {
      id: 'b-placement-ready',
      name: 'Campus Offer Ready',
      description: 'Achieve overall Placement Readiness Score >= 90',
      icon: '🏆',
      unlocked: false,
    },
  ],
};

export const sampleDsaProblems: DSAProblem[] = [
  {
    id: 'dsa-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS Digital'],
    acceptance: '82.4%',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    starterCodes: {
      javascript: `function solution(input) {
  // input is { nums: number[], target: number }
  const { nums, target } = input;
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (mp.find(diff) != mp.end()) {
            return {mp[diff], i};
        }
        mp[nums[i]] = i;
    }
    return {};
}`,
      java: `import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    },
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      { input: { nums: [1, 5, 8, 12, 19], target: 20 }, expected: [0, 4], isHidden: true },
    ],
    hints: [
      'Stage 1 (Core Intuition): Instead of testing every pair with nested loops (O(N^2)), think about what number you need for each element `x` to sum to `target`.',
      'Stage 2 (Data Structure): What data structure gives O(1) average lookup time for checking if the required complement has already appeared?',
      'Stage 3 (Edge Cases): Ensure you do not use the exact same element index twice, and handle cases where duplicate values sum to target (e.g. [3,3] target 6).',
      'Stage 4 (Pseudo-code): Initialize empty hash map. Iterate through array at index i. complement = target - nums[i]. If complement in map -> return [map[complement], i]. Otherwise put nums[i] -> i.',
      'Stage 5 (Code Inspection): If returning wrong indices, check whether you are inserting into the map before or after checking the complement.',
      'Stage 6 (Complexity): The hash map solution achieves O(N) time complexity and O(N) space complexity. Can it be done in O(1) space if the array were sorted?',
    ],
    optimalSolution: {
      language: 'JavaScript',
      code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      timeComplexity: 'O(N) - single pass over the array',
      spaceComplexity: 'O(N) - stores up to N elements in hash map',
      explanation: 'We iterate through the array once. For each element, we calculate the required complement (target - nums[i]). By querying a hash map in O(1) time, we can determine whether we have already encountered this complement earlier.',
    },
  },
  {
    id: 'dsa-2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Infosys'],
    acceptance: '79.1%',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    starterCodes: {
      javascript: `function solution(input) {
  // input is string s
  const s = typeof input === 'object' && input.s ? input.s : input;
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
      cpp: `#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mp = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (mp.count(c)) {
            if (st.empty() || st.top() != mp[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}`,
      java: `import java.util.*;

public class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
    },
    testCases: [
      { input: '()', expected: true },
      { input: '()[]{}', expected: true },
      { input: '(]', expected: false },
      { input: '([)]', expected: false },
      { input: '{[]}', expected: true },
      { input: '(((', expected: false, isHidden: true },
    ],
    hints: [
      'Stage 1 (Core Intuition): The most recently opened bracket must be the first one closed (LIFO - Last In, First Out).',
      'Stage 2 (Data Structure): A Stack is the optimal data structure to enforce LIFO matching.',
      'Stage 3 (Edge Cases): Watch out for odd length strings, strings starting with a closing bracket, or leftover unclosed brackets.',
      'Stage 4 (Pseudo-code): For each character: if opening, push to stack. If closing: check if stack is empty (invalid); otherwise pop and verify matching type.',
      'Stage 5 (Code Inspection): Make sure you finally check `stack.length === 0`, not just that no mismatches happened during traversal.',
      'Stage 6 (Complexity): Time: O(N) where N is string length. Space: O(N) worst case if all characters are opening brackets.',
    ],
    optimalSolution: {
      language: 'JavaScript',
      code: `function isValid(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack.pop() !== map[ch]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`,
      timeComplexity: 'O(N) - one pass through string',
      spaceComplexity: 'O(N) - stack holds at most N elements',
      explanation: 'Using a stack allows us to ensure the nested closing brackets match the most recent unmatched opening bracket.',
    },
  },
  {
    id: 'dsa-3',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Strings',
    companies: ['Amazon', 'Google', 'Adobe', 'Microsoft'],
    acceptance: '64.8%',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    starterCodes: {
      javascript: `function solution(input) {
  const s = typeof input === 'object' && input.s ? input.s : (typeof input === 'string' ? input : '');
  let maxLen = 0;
  let left = 0;
  const charMap = new Map();
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (charMap.has(ch) && charMap.get(ch) >= left) {
      left = charMap.get(ch) + 1;
    }
    charMap.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      python: `def length_of_longest_substring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> mp;
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.size(); right++) {
        if (mp.count(s[right]) && mp[s[right]] >= left) {
            left = mp[s[right]] + 1;
        }
        mp[s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      java: `import java.util.*;

public class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> map = new HashMap<>();
        int maxLen = 0, left = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (map.containsKey(c) && map.get(c) >= left) {
                left = map.get(c) + 1;
            }
            map.put(c, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
    },
    testCases: [
      { input: 'abcabcbb', expected: 3 },
      { input: 'bbbbb', expected: 1 },
      { input: 'pwwkew', expected: 3 },
      { input: '', expected: 0 },
      { input: 'au', expected: 2 },
      { input: 'abba', expected: 2, isHidden: true },
    ],
    hints: [
      'Stage 1 (Core Intuition): Look at continuous subsegments. As you expand to the right, what happens when you encounter a character you already saw in the current window?',
      'Stage 2 (Data Structure): Sliding Window with a Hash Map or Set. The map stores the last seen index of each character.',
      'Stage 3 (Edge Cases): Empty string "" should return 0. Beware of jumping the left pointer backwards (e.g. in "abba").',
      'Stage 4 (Pseudo-code): Maintain `left` pointer and `maxLen`. When `s[right]` exists in map and index >= left, update left = map[s[right]] + 1.',
      'Stage 5 (Code Inspection): Make sure `left` is only moved forward: `left = Math.max(left, charMap.get(ch) + 1)`.',
      'Stage 6 (Complexity): Time: O(N) linear scan. Space: O(min(m, n)) where m is charset size.',
    ],
    optimalSolution: {
      language: 'JavaScript',
      code: `function lengthOfLongestSubstring(s) {
  const map = new Map();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (map.has(ch) && map.get(ch) >= left) {
      left = map.get(ch) + 1;
    }
    map.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
      timeComplexity: 'O(N) - each character is visited once',
      spaceComplexity: 'O(min(N, charset)) - map holds at most unique characters',
      explanation: 'A sliding window technique with dynamic window expansion and immediate left-pointer adjustment based on previous character index.',
    },
  },
  {
    id: 'dsa-4',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Flipkart', 'Goldman Sachs'],
    acceptance: '51.2%',
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.',
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' },
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
    ],
    starterCodes: {
      javascript: `function solution(input) {
  const { coins, amount } = input;
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      python: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int c : coins) {
            if (i - c >= 0) {
                dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `import java.util.*;

public class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
    },
    testCases: [
      { input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
      { input: { coins: [2], amount: 3 }, expected: -1 },
      { input: { coins: [1], amount: 0 }, expected: 0 },
      { input: { coins: [186, 419, 83, 408], amount: 6249 }, expected: 20, isHidden: true },
    ],
    hints: [
      'Stage 1 (Core Intuition): Notice this has optimal substructure: to make `amount`, if we pick coin `c`, we need `1 + minCoins(amount - c)`.',
      'Stage 2 (Data Structure): A 1D DP table where `dp[i]` represents minimum coins needed to make amount `i`.',
      'Stage 3 (Edge Cases): Base case: `dp[0] = 0`. Amounts that cannot be reached should remain Infinity / sentinel value.',
      'Stage 4 (Pseudo-code): Initialize array of size amount + 1 filled with Infinity. dp[0] = 0. For i from 1 to amount: for coin in coins: if i - coin >= 0 -> dp[i] = min(dp[i], dp[i - coin] + 1).',
      'Stage 5 (Code Inspection): Check your initial fill values. Do not use -1 initially because min() comparisons will pick -1!',
      'Stage 6 (Complexity): Time: O(amount * len(coins)). Space: O(amount).',
    ],
    optimalSolution: {
      language: 'JavaScript',
      code: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
      timeComplexity: 'O(amount * N) where N is number of coins',
      spaceComplexity: 'O(amount) for DP table',
      explanation: 'Bottom-up DP iteratively builds up the minimum coins needed from 0 up to target amount.',
    },
  },
];

export const sampleAptitudeQuestions: AptitudeQuestion[] = [
  {
    id: 'apt-1',
    section: 'Quantitative',
    topic: 'Time & Work',
    difficulty: 'Intermediate',
    companyTags: ['TCS Digital', 'Infosys', 'Wipro'],
    question: 'A can do a piece of work in 12 days, and B can do it in 18 days. They work together for 4 days, and then A leaves. In how many more days will B finish the remaining work?',
    options: ['8 days', '6 days', '10 days', '7 days'],
    correctIndex: 0,
    formula: 'Work done per day = 1 / Total days. Total Work = Rate × Time.',
    explanation: 'Work done by A in 1 day = 1/12.\nWork done by B in 1 day = 1/18.\nIn 4 days together: 4 × (1/12 + 1/18) = 4 × (5/36) = 20/36 = 5/9.\nRemaining work = 1 - 5/9 = 4/9.\nDays taken by B to finish remaining work = (4/9) / (1/18) = (4/9) × 18 = 8 days.',
  },
  {
    id: 'apt-2',
    section: 'Quantitative',
    topic: 'Speed, Distance & Time',
    difficulty: 'Beginner',
    companyTags: ['Accenture', 'Cognizant', 'Deloitte'],
    question: 'A train 180 meters long is running at a speed of 54 km/hr. How much time will it take to cross a telegraph post?',
    options: ['10 seconds', '12 seconds', '14 seconds', '16 seconds'],
    correctIndex: 1,
    formula: 'Speed in m/s = Speed in km/hr × (5/18). Time = Distance / Speed.',
    explanation: 'Speed = 54 × (5/18) = 15 m/s.\nDistance to cross telegraph post = length of the train = 180 m.\nTime = Distance / Speed = 180 / 15 = 12 seconds.',
  },
  {
    id: 'apt-3',
    section: 'Quantitative',
    topic: 'Permutations & Combinations',
    difficulty: 'Advanced',
    companyTags: ['Amazon', 'Morgan Stanley'],
    question: 'In how many different ways can the letters of the word "LEADING" be arranged in such a way that the vowels always come together?',
    options: ['720', '360', '5040', '120'],
    correctIndex: 0,
    formula: 'Group vowels as 1 entity: Total ways = (Entities)! × (Arrangements of vowels)!',
    explanation: 'Vowels in LEADING: E, A, I (3 vowels).\nConsonants: L, D, N, G (4 consonants).\nTreat the 3 vowels as one single unit: [E, A, I] + 4 consonants = 5 units.\n5 units can be arranged in 5! = 120 ways.\nThe 3 vowels can be arranged amongst themselves in 3! = 6 ways.\nTotal arrangements = 120 × 6 = 720 ways.',
  },
  {
    id: 'apt-4',
    section: 'Logical',
    topic: 'Syllogisms',
    difficulty: 'Intermediate',
    companyTags: ['TCS NQT', 'Capgemini'],
    question: 'Statements:\n1. All cats are animals.\n2. Some animals are wild.\nConclusions:\nI. Some wild entities are cats.\nII. Some animals are cats.\nWhich conclusion logically follows?',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both follow', 'Neither follows'],
    correctIndex: 1,
    formula: 'Venn Diagram deduction: Universal affirmative implies particular converse (All A are B => Some B are A).',
    explanation: 'From "All cats are animals", we know cats are a subset of animals. Hence "Some animals are cats" (Conclusion II) is directly true.\nHowever, there is no necessary overlap specified between "cats" and "wild" entities. Hence Conclusion I is not guaranteed. Only II follows.',
  },
  {
    id: 'apt-5',
    section: 'Logical',
    topic: 'Seating Arrangement',
    difficulty: 'Intermediate',
    companyTags: ['Infosys', 'Amazon'],
    question: 'Six persons A, B, C, D, E, and F sit in a row facing north. C sits between A and E. D is not at the end and sits immediately to the left of B. F is at the extreme right. If A is at the extreme left, who sits second to the left of F?',
    options: ['B', 'D', 'E', 'C'],
    correctIndex: 1,
    formula: 'Deductive slot placement: Fixed extremes first, then relational blocks.',
    explanation: 'Row has 6 slots: [1, 2, 3, 4, 5, 6].\nA is at extreme left (slot 1) and F is at extreme right (slot 6).\nC is between A and E => Slot 2 is C, Slot 3 is E.\nRemaining slots: 4 and 5. D sits immediately to the left of B => Slot 4 is D, Slot 5 is B.\nRow order: A - C - E - D - B - F.\nF is at slot 6. Second to left of F is slot 4, which is D.',
  },
  {
    id: 'apt-6',
    section: 'Verbal',
    topic: 'Sentence Correction',
    difficulty: 'Beginner',
    companyTags: ['Cognizant', 'Deloitte', 'TCS'],
    question: 'Identify the error in the sentence: "Neither of the two candidates who applied for the senior developer position were selected by the committee."',
    options: ['Neither of the two', 'who applied for', 'were selected', 'No error'],
    correctIndex: 2,
    formula: 'Subject-Verb Agreement: Pronouns like "Neither", "Either", "Each" take singular verbs.',
    explanation: '"Neither" is a singular distributive pronoun referring to two items taken individually. Therefore, the singular verb "was selected" should be used instead of "were selected".',
  },
  {
    id: 'apt-7',
    section: 'Verbal',
    topic: 'Reading Comprehension',
    difficulty: 'Advanced',
    companyTags: ['Amazon', 'Google'],
    question: 'Author statement: "While automation eliminates routine tasks, it shifts human capital toward creative synthesis and systems architecture." What is the primary implication?',
    options: [
      'Automation permanently destroys high-wage employment.',
      'Workers must transition to higher-order cognitive and structural problem-solving.',
      'Manual programming will disappear entirely within months.',
      'System architecture does not require human creativity.'
    ],
    correctIndex: 1,
    formula: 'Contextual inference: synthesize explicit transition stated by author.',
    explanation: 'The passage highlights that capital shifts away from routine execution towards synthesis and architecture, directly implying that human labor transitions to higher-order cognitive and analytical responsibilities.',
  },
];

export const sampleSqlChallenges: SQLChallenge[] = [
  {
    id: 'sql-1',
    title: 'Top Earning Employee per Department',
    difficulty: 'Medium',
    topic: 'GROUP BY',
    description: 'Find each department name and the maximum salary paid in that department. Display columns as `dept_name` and `max_salary`. Order by `max_salary` descending.',
    relevantTables: ['employees', 'departments'],
    starterQuery: 'SELECT d.dept_name, MAX(e.salary) AS max_salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nGROUP BY d.dept_name\nORDER BY max_salary DESC;',
    expectedQuery: 'SELECT d.dept_name, MAX(e.salary) AS max_salary FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY d.dept_name ORDER BY max_salary DESC;',
    hints: [
      'Use an INNER JOIN between `employees` and `departments` on `dept_id`.',
      'Group the results by `d.dept_name`.',
      'Use the aggregate function `MAX(e.salary)` and alias it as `max_salary`.',
    ],
  },
  {
    id: 'sql-2',
    title: 'High Package Student Placements',
    difficulty: 'Easy',
    topic: 'Filtering',
    description: 'Retrieve the names and package amounts of all students who secured a package greater than 20.0 LPA. Return columns `student_name`, `company`, `package_lpa`. Order by `package_lpa` descending.',
    relevantTables: ['student_placements'],
    starterQuery: 'SELECT student_name, company, package_lpa\nFROM student_placements\nWHERE package_lpa > 20.0\nORDER BY package_lpa DESC;',
    expectedQuery: 'SELECT student_name, company, package_lpa FROM student_placements WHERE package_lpa > 20.0 ORDER BY package_lpa DESC;',
    hints: [
      'Filter with `WHERE package_lpa > 20.0`.',
      'Sort using `ORDER BY package_lpa DESC`.',
    ],
  },
  {
    id: 'sql-3',
    title: 'Department Headcount & Average Salary',
    difficulty: 'Medium',
    topic: 'Aggregate Functions',
    description: 'For each department, calculate the total number of employees (`emp_count`) and the average salary (`avg_salary` rounded to whole number). Only include departments with more than 1 employee.',
    relevantTables: ['departments', 'employees'],
    starterQuery: 'SELECT d.dept_name, COUNT(e.emp_id) AS emp_count, ROUND(AVG(e.salary)) AS avg_salary\nFROM departments d\nJOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nHAVING COUNT(e.emp_id) > 1;',
    expectedQuery: 'SELECT d.dept_name, COUNT(e.emp_id) AS emp_count, ROUND(AVG(e.salary)) AS avg_salary FROM departments d JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_name HAVING COUNT(e.emp_id) > 1;',
    hints: [
      'Remember that conditions on aggregate results (like count > 1) require `HAVING`, not `WHERE`.',
      'Join on `dept_id` and group by `d.dept_name`.',
    ],
  },
];

export const sampleCoreCSMaterials: CoreCSMaterial[] = [
  {
    id: 'os-1',
    subject: 'Operating Systems',
    topic: 'Processes, Threads, and CPU Scheduling',
    importance: 'Critical',
    summary: 'A process is an instance of a program in execution containing PCB, code, data, heap, and stack. A thread is the smallest dispatchable unit sharing address space with parent process.',
    keyConcepts: [
      {
        title: 'Process State Transitions',
        points: [
          'New -> Ready -> Running -> Waiting/Blocked -> Terminated',
          'Context switching overhead involves saving PCB registers and reloading another process state.',
        ],
      },
      {
        title: 'CPU Scheduling Algorithms',
        points: [
          'FCFS (First-Come First-Served): Non-preemptive, suffers from Convoy Effect.',
          'SJF / SRTF (Shortest Job First): Optimal average turnaround time, can cause starvation of longer jobs.',
          'Round Robin: Preemptive, uses time quantum; optimal for time-sharing systems.',
        ],
      },
      {
        title: 'Deadlock: The 4 Coffman Conditions',
        points: [
          '1. Mutual Exclusion: At least one resource held non-shareably.',
          '2. Hold and Wait: Process holds resource while waiting for another.',
          '3. No Preemption: Resources cannot be forcibly taken.',
          '4. Circular Wait: Circular chain of processes each waiting for resource held by next.',
        ],
      },
    ],
    frequentInterviewQuestions: [
      {
        question: 'What is the fundamental difference between a Process and a Thread?',
        answer: 'A process has its own independent address space, memory, and file descriptors. A thread is a lightweight execution unit inside a process that shares memory and resources with other threads in the same process, but retains its own program counter, registers, and stack.',
      },
      {
        question: 'What causes Thrashing in virtual memory?',
        answer: 'Thrashing occurs when the system spends more time swapping pages in and out of secondary storage than executing instructions, caused by insufficient physical RAM to accommodate working sets of active processes.',
      },
    ],
  },
  {
    id: 'cn-1',
    subject: 'Computer Networks',
    topic: 'OSI Model, TCP vs UDP, and Handshakes',
    importance: 'Critical',
    summary: 'The foundation of data communications: 7-layer OSI model, 4-layer TCP/IP stack, transport protocol guarantees, and connection lifecycles.',
    keyConcepts: [
      {
        title: 'TCP 3-Way Handshake Connection Establishment',
        points: [
          '1. SYN: Client sends SYN segment with initial sequence number ISN(c).',
          '2. SYN-ACK: Server responds with SYN with its own ISN(s) and ACK = ISN(c) + 1.',
          '3. ACK: Client sends ACK = ISN(s) + 1. Connection is now ESTABLISHED.',
        ],
      },
      {
        title: 'TCP vs UDP Comparison',
        points: [
          'TCP: Connection-oriented, reliable (acknowledgments, retransmissions), flow control (sliding window), congestion control. Used for HTTP, FTP, SSH.',
          'UDP: Connectionless, unreliable, low overhead, no flow/congestion control. Ideal for DNS, VoIP, real-time gaming, video streaming.',
        ],
      },
    ],
    frequentInterviewQuestions: [
      {
        question: 'What happens when you type https://google.com into a browser and press Enter?',
        answer: '1. DNS lookup (Browser cache -> OS cache -> Resolver -> Root/TLD/Authoritative DNS).\n2. TCP 3-Way Handshake on port 443.\n3. TLS Handshake (Cipher suite negotiation, Certificate validation, Session key exchange).\n4. HTTP GET request sent over encrypted TLS channel.\n5. Server processes and returns HTTP 200 with HTML/CSS/JS payload.\n6. Browser parses DOM/CSSOM and renders UI.',
      },
    ],
  },
  {
    id: 'dbms-1',
    subject: 'Database Management Systems',
    topic: 'ACID Properties, Normalization & Indexing',
    importance: 'Critical',
    summary: 'Data models, transactional consistency, relational normalization up to BCNF, and query optimization via B+ trees.',
    keyConcepts: [
      {
        title: 'ACID Properties of Transactions',
        points: [
          'Atomicity: All operations succeed or entire transaction rolls back (All or Nothing).',
          'Consistency: Database transitions from one valid state to another satisfying all integrity constraints.',
          'Isolation: Concurrent transactions execute without interfering with one another (Read Uncommitted, Read Committed, Repeatable Read, Serializable).',
          'Durability: Once committed, changes survive system crashes (WAL - Write-Ahead Logging).',
        ],
      },
      {
        title: 'Normalization Forms',
        points: [
          '1NF: Atomic column values, no repeating groups.',
          '2NF: 1NF + No partial dependencies on composite primary key.',
          '3NF: 2NF + No transitive functional dependencies (non-key attribute depending on another non-key).',
          'BCNF: Every determinant X in functional dependency X -> Y must be a candidate key.',
        ],
      },
    ],
    frequentInterviewQuestions: [
      {
        question: 'Why do relational databases use B+ Trees rather than Binary Search Trees for indexes?',
        answer: 'B+ Trees have high fan-out (hundreds of child pointers per node), which minimizes disk I/O seeks. All leaf nodes are linked sequentially, enabling ultra-fast range queries and scans in O(log N) depth.',
      },
    ],
  },
  {
    id: 'oop-1',
    subject: 'Object-Oriented Programming',
    topic: '4 Pillars & SOLID Principles',
    importance: 'Very High',
    summary: 'Core paradigms for writing modular, maintainable, and extensible software architectures in Java, C++, and modern languages.',
    keyConcepts: [
      {
        title: 'The 4 Pillars',
        points: [
          'Encapsulation: Bundling data and methods into a single unit while restricting direct access via access modifiers.',
          'Abstraction: Hiding internal complex implementation details and exposing only clean interfaces.',
          'Inheritance: Mechanism where a new class derives properties and behaviors from an existing parent class.',
          'Polymorphism: Ability of an entity to take multiple forms (Compile-time / Method Overloading vs Run-time / Method Overriding via virtual table).',
        ],
      },
      {
        title: 'SOLID Principles',
        points: [
          'S: Single Responsibility Principle (A class should have only one reason to change).',
          'O: Open/Closed Principle (Open for extension, closed for modification).',
          'L: Liskov Substitution Principle (Derived classes must be substitutable for base classes without breaking behavior).',
          'I: Interface Segregation Principle (Clients should not be forced to depend on methods they do not use).',
          'D: Dependency Inversion Principle (High-level modules should depend on abstractions, not concrete implementations).',
        ],
      },
    ],
    frequentInterviewQuestions: [
      {
        question: 'Explain Compile-time Polymorphism vs Runtime Polymorphism with real code examples.',
        answer: 'Compile-time polymorphism is resolved at compile time via Method Overloading (same method name, different parameter signature in same class). Runtime polymorphism is resolved at execution time via Method Overriding (subclass provides specific implementation of parent method annotated with @Override).',
      },
    ],
  },
];

export const sampleFlashcards: Flashcard[] = [
  {
    id: 'fc-1',
    subject: 'Operating Systems',
    topic: 'Process vs Thread',
    front: 'What is the primary difference between a Process and a Thread in terms of memory?',
    back: 'A Process has its own independent virtual address space and isolated heap/data segments. Threads within the same process share that memory space and global variables, but retain independent stacks and registers.',
  },
  {
    id: 'fc-2',
    subject: 'Operating Systems',
    topic: 'Deadlock Conditions',
    front: 'Name all 4 Coffman conditions required for a Deadlock to occur.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\nBreaking any ONE condition prevents deadlock.',
  },
  {
    id: 'fc-3',
    subject: 'Computer Networks',
    topic: 'TCP Handshake',
    front: 'What are the three packets exchanged in a TCP connection establishment?',
    back: '1. SYN (from client with sequence number X)\n2. SYN-ACK (from server with ACK=X+1 and seq=Y)\n3. ACK (from client with ACK=Y+1)',
  },
  {
    id: 'fc-4',
    subject: 'Database Management Systems',
    topic: 'ACID Properties',
    front: 'What does the "I" in ACID stand for, and name the standard 4 isolation levels?',
    back: 'Isolation: Ensures concurrent transactions do not interfere.\nLevels from weakest to strongest:\n1. Read Uncommitted\n2. Read Committed\n3. Repeatable Read\n4. Serializable',
  },
  {
    id: 'fc-5',
    subject: 'Database Management Systems',
    topic: 'Indexing',
    front: 'Why are B+ Trees preferred over B-Trees for database indexing?',
    back: 'In B+ Trees, data pointers are exclusively stored in leaf nodes, allowing internal nodes to hold more index keys (higher branching factor/less disk I/O depth). Leaf nodes are linked in a doubly-linked list, making range queries extremely fast.',
  },
  {
    id: 'fc-6',
    subject: 'Object-Oriented Programming',
    topic: 'SOLID Principles',
    front: 'What is the Liskov Substitution Principle (LSP)?',
    back: 'Objects of a superclass should be replaceable with objects of a subclass without altering the correctness or desirable properties of the program.',
  },
];

export const sampleMockInterviews: MockInterviewSlot[] = [
  {
    id: 'mock-1',
    role: 'Software Engineer (Frontend/Fullstack)',
    company: 'Google',
    date: '2026-10-08',
    timeSlot: '04:00 PM - 05:00 PM',
    type: 'Technical DSA',
    interviewerName: 'AI Senior Staff Engineer',
    status: 'Scheduled',
  },
  {
    id: 'mock-2',
    role: 'Associate Software Developer',
    company: 'Amazon',
    date: '2026-10-10',
    timeSlot: '11:00 AM - 12:00 PM',
    type: 'Full Placement Simulation',
    interviewerName: 'AI Bar Raiser',
    status: 'Scheduled',
  },
  {
    id: 'mock-3',
    role: 'Graduate Trainee Engineer',
    company: 'TCS Digital',
    date: '2026-10-04',
    timeSlot: '02:00 PM - 02:45 PM',
    type: 'Core CS & System Design',
    interviewerName: 'AI Technical Lead',
    status: 'Completed',
    feedbackReport: {
      technicalScore: 84,
      communicationScore: 88,
      problemSolvingScore: 82,
      overallRecommendation: 'Strong Hire - Candidate demonstrated solid grasp of DBMS indexing and OS thread concurrency.',
      strengths: [
        'Clear explanation of B+ tree advantages for range queries',
        'Structured approach to Deadlock prevention with Coffman breakdown',
        'Strong communicative articulation when thinking aloud',
      ],
      improvements: [
        'Clarify worst-case space complexity when recursion is unrolled',
        'Address network timeout retries in distributed client-server scenarios',
      ],
      detailedNotes: 'Devika performed exceptionally well in the technical screening round. Keep refining dynamic programming edge cases.',
    },
  },
];

export const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: 'Devika Sharma',
    email: 'devika.sharma@nit.edu',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    github: 'https://github.com/devika-codes',
    linkedin: 'https://linkedin.com/in/devika-sharma-sde',
    portfolio: 'https://devika-portfolio.dev',
    summary: 'Final year B.Tech Computer Science student specializing in scalable systems, full-stack engineering, and algorithms. Solved 350+ DSA problems with hands-on internship experience building high-throughput microservices.',
  },
  targetRole: 'Software Development Engineer (SDE)',
  template: 'sde-modern',
  education: [
    {
      degree: 'B.Tech in Computer Science & Engineering',
      institution: 'National Institute of Technology',
      period: '2022 - 2026',
      score: 'CGPA: 8.92 / 10.0',
    },
    {
      degree: 'Higher Secondary Education (Class XII - CBSE)',
      institution: 'Delhi Public School',
      period: '2020 - 2022',
      score: '96.4%',
    },
  ],
  skills: [
    { category: 'Programming Languages', items: 'C++, Java, TypeScript, Python, SQL' },
    { category: 'Frameworks & Libraries', items: 'React.js, Node.js, Express, Next.js, Tailwind CSS' },
    { category: 'Databases & Storage', items: 'PostgreSQL, MongoDB Atlas, Redis, SQLite' },
    { category: 'Developer Tools & Cloud', items: 'Git, Docker, Linux, AWS S3, Postman, Jest' },
    { category: 'Core CS Fundamentals', items: 'DSA, Operating Systems, DBMS, Computer Networks, OOP' },
  ],
  experience: [
    {
      role: 'Software Engineering Intern',
      company: 'TechCorp Solutions',
      location: 'Bengaluru, India',
      duration: 'May 2025 - Jul 2025',
      bullets: [
        'Architected RESTful microservices in Node.js & TypeScript, handling 45,000+ daily telemetry requests with 99.9% uptime.',
        'Optimized PostgreSQL database queries using composite indexes, cutting average query latency by 42% from 180ms to 104ms.',
        'Integrated Redis caching layer for top 100 frequent product catalog lookups, reducing primary DB compute load by 35%.',
      ],
    },
  ],
  projects: [
    {
      title: 'Distributed Real-Time Code Execution Engine',
      techStack: 'Node.js, Docker, WebSockets, Redis, React',
      link: 'https://github.com/devika-codes/code-sandbox',
      bullets: [
        'Engineered an isolated sandbox executing user-submitted C++, Python, and JS scripts with strict 256MB memory & 2s CPU limits.',
        'Leveraged Redis BullMQ message queue to handle concurrent code submissions under peak 300 requests/minute bursts.',
        'Constructed interactive frontend IDE featuring syntax highlighting, live testcase diffing, and WebSocket status streaming.',
      ],
    },
    {
      title: 'AI Smart Placement Readiness & Mock Platform',
      techStack: 'React, Express, Google Gemini, Tailwind CSS',
      link: 'https://github.com/devika-codes/placement-ai',
      bullets: [
        'Developed an AI-guided mentorship engine delivering 6-stage progressive hints without leaking optimal solutions prematurely.',
        'Created automated ATS resume audit scoring resumes on Google XYZ impact metrics and role-specific placement keywords.',
      ],
    },
  ],
  certifications: [
    'AWS Certified Cloud Practitioner (2025)',
    'Meta Front-End Developer Professional Certificate (Coursera)',
  ],
  achievements: [
    'Global Rank 412 in LeetCode Biweekly Contest (out of 28,000+ participants)',
    '1st Runner Up at National Inter-College Hackathon (Smart India Hackathon 2024)',
    'Solved 350+ algorithmic problems across LeetCode and Codeforces',
  ],
  atsScore: 88,
};

export const sampleLeaderboard: LeaderboardUser[] = [
  {
    id: 'u-1',
    rank: 1,
    name: 'Aarav Gupta',
    college: 'IIT Bombay',
    avatar: '👨‍💻',
    xpPoints: 4890,
    streakDays: 24,
    readinessScore: 96,
    badgeCount: 8,
  },
  {
    id: 'u-2',
    rank: 2,
    name: 'Ishita Roy',
    college: 'BITS Pilani',
    avatar: '👩‍💻',
    xpPoints: 4420,
    streakDays: 19,
    readinessScore: 93,
    badgeCount: 7,
  },
  {
    id: 'u-3',
    rank: 3,
    name: 'Kabir Kapoor',
    college: 'NIT Trichy',
    avatar: '🚀',
    xpPoints: 3980,
    streakDays: 15,
    readinessScore: 91,
    badgeCount: 6,
  },
  {
    id: 'stu-101',
    rank: 4,
    name: 'Devika Sharma (You)',
    college: 'NIT Surathkal',
    avatar: '🌟',
    xpPoints: 2450,
    streakDays: 8,
    readinessScore: 78,
    badgeCount: 3,
  },
  {
    id: 'u-5',
    rank: 5,
    name: 'Rohan Verma',
    college: 'IIIT Hyderabad',
    avatar: '🔥',
    xpPoints: 2210,
    streakDays: 6,
    readinessScore: 75,
    badgeCount: 4,
  },
  {
    id: 'u-6',
    rank: 6,
    name: 'Priya Nair',
    college: 'DTU Delhi',
    avatar: '💡',
    xpPoints: 1950,
    streakDays: 5,
    readinessScore: 71,
    badgeCount: 3,
  },
];
