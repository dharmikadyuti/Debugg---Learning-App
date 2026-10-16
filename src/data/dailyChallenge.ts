const DAILY_PROBLEMS = [
  {
    concept: 'Off-by-one Loop',
    description: 'This loop should print numbers 1 to 5, but the output is wrong. Fix the range.',
    errorType: 'Logic', difficulty: 'easy', xp: 60,
    variants: {
      Python:     { lines: ['def print_numbers():','  for i in range(0, 5):','    print(i)','print_numbers()'], bugLine:1, fixed:'  for i in range(1, 6):', expectedOutput:'1\n2\n3\n4\n5', hint:'range(start, stop) excludes stop.' },
      JavaScript: { lines: ['function printNumbers() {','  for (let i = 0; i < 5; i++) {','    console.log(i);','  }','}','printNumbers();'], bugLine:1, fixed:'  for (let i = 1; i <= 5; i++) {', expectedOutput:'1\n2\n3\n4\n5', hint:'Start from 1 and use <= 5.' },
      Java:       { lines: ['public class Main {','    public static void main(String[] args) {','        for (int i = 0; i < 5; i++) {','            System.out.println(i);','        }','    }','}'], bugLine:2, fixed:'        for (int i = 1; i <= 5; i++) {', expectedOutput:'1\n2\n3\n4\n5', hint:'Start i at 1 and use <= 5.' },
      C:          { lines: ['#include <stdio.h>','int main() {','    for (int i = 0; i < 5; i++) {','        printf("%d\\n", i);','    }','    return 0;','}'], bugLine:2, fixed:'    for (int i = 1; i <= 5; i++) {', expectedOutput:'1\n2\n3\n4\n5', hint:'Change start to 1 and condition to <= 5.' },
      'C++':      { lines: ['#include <iostream>','int main() {','    for (int i = 0; i < 5; i++) {','        std::cout << i << std::endl;','    }','    return 0;','}'], bugLine:2, fixed:'    for (int i = 1; i <= 5; i++) {', expectedOutput:'1\n2\n3\n4\n5', hint:'Start at 1 and use <= 5.' },
      HTML:       { lines: ['<ul>','  <li>Item 0</li>','  <li>Item 1</li>','  <li>Item 2</li>','  <li>Item 3</li>','  <li>Item 4</li>','</ul>'], bugLine:1, fixed:'  <li>Item 1</li>', expectedOutput:'Item 1\nItem 2\nItem 3\nItem 4\nItem 5', hint:'Lists should start at Item 1, not Item 0.' },
      CSS:        { lines: ['.list-item:nth-child(n+0) {','  color: blue;','}'], bugLine:0, fixed:'.list-item:nth-child(n+1) {', expectedOutput:'.list-item:nth-child(n+1) { color: blue; }', hint:'nth-child index starts at 1, not 0.' },
    },
  },
  {
    concept: 'Broken Factorial',
    description: 'The factorial function always returns 0. Fix the base case.',
    errorType: 'Logic', difficulty: 'medium', xp: 80,
    variants: {
      Python:     { lines: ['def factorial(n):','  if n == 0:','    return 0','  return n * factorial(n - 1)','print(factorial(5))'], bugLine:2, fixed:'    return 1', expectedOutput:'120', hint:'0! = 1, not 0. Fix the base case return value.' },
      JavaScript: { lines: ['function factorial(n) {','  if (n === 0) return 0;','  return n * factorial(n - 1);','}','console.log(factorial(5));'], bugLine:1, fixed:'  if (n === 0) return 1;', expectedOutput:'120', hint:'What is the mathematical value of 0!?' },
      Java:       { lines: ['public class Main {','    static int factorial(int n) {','        if (n == 0) return 0;','        return n * factorial(n - 1);','    }','    public static void main(String[] args) {','        System.out.println(factorial(5));','    }','}'], bugLine:2, fixed:'        if (n == 0) return 1;', expectedOutput:'120', hint:'The base case should return 1, not 0.' },
      C:          { lines: ['#include <stdio.h>','int factorial(int n) {','    if (n == 0) return 0;','    return n * factorial(n - 1);','}','int main() {','    printf("%d", factorial(5));','    return 0;','}'], bugLine:2, fixed:'    if (n == 0) return 1;', expectedOutput:'120', hint:'0! equals 1 mathematically.' },
      'C++':      { lines: ['#include <iostream>','int factorial(int n) {','    if (n == 0) return 0;','    return n * factorial(n - 1);','}','int main() {','    std::cout << factorial(5);','    return 0;','}'], bugLine:2, fixed:'    if (n == 0) return 1;', expectedOutput:'120', hint:'Base case of recursion should return 1.' },
      HTML:       { lines: ['<ol>','  <il>Step 1</il>','  <il>Step 2</il>','  <il>Step 3</il>','</ol>'], bugLine:1, fixed:'  <li>Step 1</li>', expectedOutput:'Step 1\nStep 2\nStep 3', hint:'The list item tag is <li>, not <il>.' },
      CSS:        { lines: ['.box {','  width: 100px','  height: 100px;','  background: red;','}'], bugLine:1, fixed:'  width: 100px;', expectedOutput:'width: 100px; height: 100px; background: red;', hint:'Missing semicolon after width value.' },
    },
  },
  {
    concept: 'Missing Null Check',
    description: 'The code crashes when the value is null. Add a proper null check.',
    errorType: 'Runtime', difficulty: 'easy', xp: 60,
    variants: {
      Python:     { lines: ['def get_length(s):','  return len(s)','print(get_length(None))'], bugLine:1, fixed:'  return len(s) if s is not None else 0', expectedOutput:'0', hint:'Check if s is None before calling len().' },
      JavaScript: { lines: ['function getLength(s) {','  return s.length;','}','console.log(getLength(null));'], bugLine:1, fixed:'  return s ? s.length : 0;', expectedOutput:'0', hint:'Check if s is truthy before accessing .length.' },
      Java:       { lines: ['public class Main {','    public static void main(String[] args) {','        String s = null;','        System.out.println(s.length());','    }','}'], bugLine:3, fixed:'        System.out.println(s != null ? s.length() : 0);', expectedOutput:'0', hint:'Check for null before calling methods on an object.' },
      C:          { lines: ['#include <stdio.h>','#include <string.h>','int main() {','    char *s = NULL;','    printf("%lu", strlen(s));','    return 0;','}'], bugLine:4, fixed:'    printf("%lu", s ? strlen(s) : 0);', expectedOutput:'0', hint:'Check if pointer is NULL before using it.' },
      'C++':      { lines: ['#include <iostream>','#include <string>','int main() {','    std::string* s = nullptr;','    std::cout << s->length();','    return 0;','}'], bugLine:4, fixed:'    std::cout << (s ? s->length() : 0);', expectedOutput:'0', hint:'Check for nullptr before dereferencing a pointer.' },
      HTML:       { lines: ['<img src="photo.jpg">','<p>My photo</p>'], bugLine:0, fixed:'<img src="photo.jpg" alt="My photo">', expectedOutput:'<img src="photo.jpg" alt="My photo">', hint:'Images should always have an alt attribute.' },
      CSS:        { lines: ['.hidden {','  display: none','}'], bugLine:1, fixed:'  display: none;', expectedOutput:'display: none;', hint:'All CSS declarations need a semicolon at the end.' },
    },
  },
  {
    concept: 'Wrong Comparison Operator',
    description: 'The condition uses assignment instead of comparison. Fix the operator.',
    errorType: 'Syntax', difficulty: 'easy', xp: 50,
    variants: {
      Python:     { lines: ['x = 10','if x = 10:','  print("equal")'], bugLine:1, fixed:'if x == 10:', expectedOutput:'equal', hint:'= assigns a value. == compares values.' },
      JavaScript: { lines: ['let x = 10;','if (x = 5) {','  console.log("five");','} else {','  console.log("not five");','}'], bugLine:1, fixed:'if (x === 5) {', expectedOutput:'not five', hint:'= is assignment, === is strict equality in JS.' },
      Java:       { lines: ['public class Main {','    public static void main(String[] args) {','        int x = 10;','        if (x == 10) {','            System.out.println("equal");','        }','    }','}'], bugLine:3, fixed:'        if (x == 10) {', expectedOutput:'equal', hint:'Use == for comparison, not = which is assignment.' },
      C:          { lines: ['#include <stdio.h>','int main() {','    int x = 10;','    if (x = 5) {','        printf("five");','    } else {','        printf("not five");','    }','    return 0;','}'], bugLine:3, fixed:'    if (x == 5) {', expectedOutput:'not five', hint:'= assigns inside if. Use == to compare.' },
      'C++':      { lines: ['#include <iostream>','int main() {','    int x = 10;','    if (x = 5) {','        std::cout << "five";','    } else {','        std::cout << "not five";','    }','    return 0;','}'], bugLine:3, fixed:'    if (x == 5) {', expectedOutput:'not five', hint:'Use == for comparison in C++.' },
      HTML:       { lines: ['<a href="google.com">Visit Google</a>'], bugLine:0, fixed:'<a href="https://google.com">Visit Google</a>', expectedOutput:'<a href="https://google.com">Visit Google</a>', hint:'URLs need the https:// protocol prefix.' },
      CSS:        { lines: ['.text {','  font-size = 16px;','}'], bugLine:1, fixed:'  font-size: 16px;', expectedOutput:'font-size: 16px;', hint:'CSS uses : to separate property and value, not =.' },
    },
  },
  {
    concept: 'Infinite Loop',
    description: 'This loop never terminates. Fix the condition or increment.',
    errorType: 'Logic', difficulty: 'medium', xp: 75,
    variants: {
      Python:     { lines: ['i = 1','while i < 5:','  print(i)','  i -= 1'], bugLine:3, fixed:'  i += 1', expectedOutput:'1\n2\n3\n4', hint:'The counter is going the wrong direction.' },
      JavaScript: { lines: ['let i = 1;','while (i < 5) {','  console.log(i);','  i--;','}'], bugLine:3, fixed:'  i++;', expectedOutput:'1\n2\n3\n4', hint:'i-- makes i smaller — use i++ to increment.' },
      Java:       { lines: ['public class Main {','    public static void main(String[] args) {','        int i = 1;','        while (i < 5) {','            System.out.println(i);','            i--;','        }','    }','}'], bugLine:5, fixed:'            i++;', expectedOutput:'1\n2\n3\n4', hint:'i-- decrements. Use i++ to make progress.' },
      C:          { lines: ['#include <stdio.h>','int main() {','    int i = 1;','    while (i < 5) {','        printf("%d\\n", i);','        i--;','    }','    return 0;','}'], bugLine:5, fixed:'        i++;', expectedOutput:'1\n2\n3\n4', hint:'Change i-- to i++ to increment the counter.' },
      'C++':      { lines: ['#include <iostream>','int main() {','    int i = 1;','    while (i < 5) {','        std::cout << i << std::endl;','        i--;','    }','    return 0;','}'], bugLine:5, fixed:'        i++;', expectedOutput:'1\n2\n3\n4', hint:'i-- causes infinite loop. Use i++ instead.' },
      HTML:       { lines: ['<div>','  <p>Hello<p>','</div>'], bugLine:1, fixed:'  <p>Hello</p>', expectedOutput:'Hello', hint:'The closing tag needs a forward slash: </p>.' },
      CSS:        { lines: ['.loop {','  animation: spin 1s linear infinite','}'], bugLine:1, fixed:'  animation: spin 1s linear infinite;', expectedOutput:'animation: spin 1s linear infinite;', hint:'Missing semicolon at end of animation property.' },
    },
  },
  {
    concept: 'String vs Number Bug',
    description: 'Adding two values gives wrong result due to type mismatch. Fix the types.',
    errorType: 'Logic', difficulty: 'easy', xp: 55,
    variants: {
      Python:     { lines: ['a = "5"','b = "3"','print(a + b)'], bugLine:2, fixed:'print(int(a) + int(b))', expectedOutput:'8', hint:'Convert strings to integers before adding.' },
      JavaScript: { lines: ['let a = "5";','let b = "3";','console.log(a + b);'], bugLine:2, fixed:'console.log(Number(a) + Number(b));', expectedOutput:'8', hint:'+ with strings does concatenation. Convert to Number first.' },
      Java:       { lines: ['public class Main {','    public static void main(String[] args) {','        String a = "5";','        String b = "3";','        System.out.println(a + b);','    }','}'], bugLine:4, fixed:'        System.out.println(Integer.parseInt(a) + Integer.parseInt(b));', expectedOutput:'8', hint:'Use Integer.parseInt() to convert String to int.' },
      C:          { lines: ['#include <stdio.h>','#include <stdlib.h>','int main() {','    char a[] = "5";','    char b[] = "3";','    printf("%d", atoi(a) + atoi(b));','    return 0;','}'], bugLine:5, fixed:'    printf("%d", atoi(a) + atoi(b));', expectedOutput:'8', hint:'Use atoi() to convert char array to integer.' },
      'C++':      { lines: ['#include <iostream>','#include <string>','int main() {','    std::string a = "5";','    std::string b = "3";','    std::cout << a + b;','    return 0;','}'], bugLine:5, fixed:'    std::cout << std::stoi(a) + std::stoi(b);', expectedOutput:'8', hint:'Use std::stoi() to convert string to integer.' },
      HTML:       { lines: ['<h1>Hello World</h2>'], bugLine:0, fixed:'<h1>Hello World</h1>', expectedOutput:'Hello World', hint:'Opening and closing tags must match: <h1> needs </h1>.' },
      CSS:        { lines: ['.box {','  colour: red;','}'], bugLine:1, fixed:'  color: red;', expectedOutput:'color: red;', hint:'The correct CSS property is color, not colour.' },
    },
  },
  {
    concept: 'Division by Zero',
    description: 'The program crashes when dividing. Add a check to prevent division by zero.',
    errorType: 'Runtime', difficulty: 'easy', xp: 55,
    variants: {
      Python:     { lines: ['def divide(a, b):','  return a / b','print(divide(10, 0))'], bugLine:1, fixed:'  return a / b if b != 0 else "Error"', expectedOutput:'Error', hint:'Check if b is zero before dividing.' },
      JavaScript: { lines: ['function divide(a, b) {','  return a / b;','}','console.log(divide(10, 0));'], bugLine:1, fixed:'  return b !== 0 ? a / b : "Error";', expectedOutput:'Error', hint:'Check if b is 0 before performing division.' },
      Java:       { lines: ['public class Main {','    public static void main(String[] args) {','        int a = 10, b = 0;','        System.out.println(a / b);','    }','}'], bugLine:3, fixed:'        System.out.println(b != 0 ? a / b : "Error");', expectedOutput:'Error', hint:'Always check divisor is non-zero before dividing.' },
      C:          { lines: ['#include <stdio.h>','int main() {','    int a = 10, b = 0;','    printf("%d", a / b);','    return 0;','}'], bugLine:3, fixed:'    if (b != 0) printf("%d", a/b); else printf("Error");', expectedOutput:'Error', hint:'Check b != 0 before dividing.' },
      'C++':      { lines: ['#include <iostream>','int main() {','    int a = 10, b = 0;','    std::cout << a / b;','    return 0;','}'], bugLine:3, fixed:'    std::cout << (b != 0 ? a / b : -1);', expectedOutput:'-1', hint:'Guard against division by zero with a condition.' },
      HTML:       { lines: ['<button onclick="alert(clicked)">Click me</button>'], bugLine:0, fixed:'<button onclick="alert(\'clicked\')">Click me</button>', expectedOutput:'alert fires correctly', hint:'String argument to alert() needs quotes.' },
      CSS:        { lines: ['.center {','  margin: auto','  text-align: center;','}'], bugLine:1, fixed:'  margin: auto;', expectedOutput:'margin: auto; text-align: center;', hint:'Missing semicolon after margin: auto.' },
    },
  },
];
const DAILY_CHALLENGE = (() => {
  const today = new Date();

  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  return DAILY_PROBLEMS[seed % DAILY_PROBLEMS.length];
})();

export { DAILY_PROBLEMS, DAILY_CHALLENGE };