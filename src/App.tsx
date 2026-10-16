// @ts-nocheck
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Counter from "./components/Counter";
import CHALLENGES from "./data/challenges";
import Dashboard from "./pages/Dashboard";
import DailyChallenge from "../components/DailyChallenge";
import Leaderboard from "./pages/Leaderboard";
import Challenge from "./pages/Challenge";
import Discuss from "./pages/Discuss";
import Profile from "./pages/Profile";
import DevDashboard from "./pages/DevDashboard";

import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { useNavigation } from "./hooks/useNavigation";

import type { Challenge as ChallengeType} from "./types/challenge";
import type { CommunityUpload } from "./types/communityUpload";
import type { AppUser } from "./types/user";

import { useNavigate } from "react-router-dom";

import "./styles.css";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider, // ← add this
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a12;--bg2:#111120;--card:#161628;--card2:#1c1c35;
  --border:rgba(255,255,255,0.08);
  --lime:#c8f135;--cyan:#00e5ff;--pink:#ff4fcb;--orange:#ff7b2c;
  --yellow:#ffe03b;--purple:#a855f7;--green:#22c55e;--red:#ef4444;
  --text:#f0f0ff;--muted:#6b7280;
  --font:'Nunito',sans-serif;--mono:'JetBrains Mono',monospace;--display:'Fredoka One',sans-serif;
}
body.light{
  --bg:#f0f4f8;--bg2:#e2e8f0;--card:#ffffff;--card2:#f8fafc;
  --border:rgba(0,0,0,0.10);
  --text:#0f172a;--muted:#64748b;
}
body.light ::-webkit-scrollbar-thumb{background:var(--lime)}
body.light .nav{background:rgba(240,244,248,0.92)!important;border-bottom:1px solid rgba(0,0,0,0.08)!important}
body.light .card{background:#ffffff;border-color:rgba(0,0,0,0.08)}
body.light .input-field{background:#f1f5f9;border-color:rgba(0,0,0,0.12);color:#0f172a}
body.light .btn-ghost{border-color:rgba(0,0,0,0.15);color:#0f172a}
body.light .post{background:#ffffff;border-color:rgba(0,0,0,0.08)}
body.light .modal{background:#ffffff}
body.light .code-line:hover{background:rgba(0,0,0,0.04)}
body.light .code-line.selected{background:rgba(239,68,68,0.10)}
body.light .code-line.correct{background:rgba(34,197,94,0.10)}
body.light .tab{color:#64748b}
body.light .tab.active{background:var(--lime);color:#0a0a12}
body.light .badge-box{background:#f1f5f9;border-color:rgba(0,0,0,0.08)}
body.light .lb-row:hover{background:rgba(0,0,0,0.03)}
body.light input,body.light textarea,body.light select{color:#0f172a}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:var(--font);overflow-x:hidden;min-height:100vh;transition:background .3s,color .3s}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--lime);border-radius:3px}
button{cursor:pointer;border:none;outline:none;font-family:var(--font)}
input,textarea,select{font-family:var(--font);outline:none;border:none;background:none;color:var(--text)}
.page{min-height:100vh;animation:fadeUp .4s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pulse-anim{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes fall{from{transform:translateY(-60px) rotate(0deg);opacity:1}to{transform:translateY(110vh) rotate(720deg);opacity:0}}
.btn-lime{background:var(--lime);color:#0a0a12;font-weight:900;padding:14px 32px;border-radius:50px;font-size:15px;transition:transform .15s,box-shadow .15s;box-shadow:0 0 24px rgba(200,241,53,.3)}
.btn-lime:hover{transform:translateY(-2px) scale(1.04);box-shadow:0 0 44px rgba(200,241,53,.55)}
.btn-ghost{background:transparent;color:var(--text);font-weight:700;padding:13px 28px;border-radius:50px;font-size:14px;border:2px solid var(--border);transition:all .2s}
.btn-ghost:hover{border-color:var(--lime);color:var(--lime);transform:translateY(-2px)}
.btn-sm{padding:8px 18px;font-size:13px;font-weight:700;border-radius:50px;transition:all .15s}
.card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:24px;transition:transform .2s,border-color .2s}
.card:hover{border-color:rgba(200,241,53,.25);transform:translateY(-2px)}
.tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:800}
.tag-easy{background:rgba(34,197,94,.15);color:var(--green)}
.tag-medium{background:rgba(255,123,44,.15);color:var(--orange)}
.tag-hard{background:rgba(239,68,68,.15);color:var(--red)}
.tag-lang{background:rgba(0,229,255,.1);color:var(--cyan)}
.nav{position:fixed;top:0;left:0;right:0;z-index:999;display:flex;align-items:center;justify-content:space-between;padding:14px 32px;background:rgba(10,10,18,.9);backdrop-filter:blur(18px);border-bottom:1px solid var(--border)}
.nav-logo{font-family:var(--display);font-size:24px;background:linear-gradient(90deg,var(--lime),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;cursor:pointer}
.nav-links{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.nav-link{background:none;color:var(--muted);font-weight:700;font-size:13px;padding:7px 14px;border-radius:50px;transition:all .2s}
.nav-link:hover,.nav-link.active{color:var(--lime);background:rgba(200,241,53,.08)}
.grid-bg{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(200,241,53,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,241,53,.04) 1px,transparent 1px);background-size:48px 48px}
.glow{position:absolute;border-radius:50%;filter:blur(80px);opacity:.18;pointer-events:none}
.input-field{width:100%;background:var(--card2);border:1.5px solid var(--border);border-radius:14px;padding:14px 18px;color:var(--text);font-size:15px;font-weight:600;transition:border-color .2s}
.input-field:focus{border-color:var(--lime)}
.input-field::placeholder{color:var(--muted)}
.xp-bar{height:8px;background:rgba(255,255,255,.08);border-radius:50px;overflow:hidden}
.xp-fill{height:100%;background:linear-gradient(90deg,var(--lime),var(--cyan));border-radius:50px;transition:width .7s ease}
.code-line{font-family:var(--mono);font-size:13px;line-height:1.9;padding:2px 12px;border-radius:6px;cursor:pointer;transition:background .15s;white-space:pre;display:block;position:relative}
.code-line:hover{background:rgba(255,255,255,.05)}
.code-line.selected{background:rgba(239,68,68,.18);border-left:3px solid var(--red)}
.code-line.correct{background:rgba(34,197,94,.12);border-left:3px solid var(--green)}
.emoji-particle{position:fixed;font-size:30px;animation:fall linear forwards;pointer-events:none;z-index:9999}
.tab{padding:10px 20px;border-radius:50px;font-weight:800;font-size:13px;background:none;color:var(--muted);transition:all .2s}
.tab.active{background:var(--lime);color:#0a0a12}
.badge-box{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px;border-radius:16px;background:var(--card2);border:1px solid var(--border)}
.lb-row{display:flex;align-items:center;gap:14px;padding:12px 18px;border-radius:14px;border:1px solid transparent;transition:all .2s}
.lb-row:hover{border-color:var(--border);background:rgba(255,255,255,.02)}
.post{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:20px;margin-bottom:14px;transition:border-color .2s}
.post:hover{border-color:rgba(200,241,53,.2)}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeUp .2s ease}
.modal{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;max-width:480px;width:90%}
.chip{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:50px;font-size:11px;font-weight:700;background:var(--card2);border:1px solid var(--border);color:var(--muted)}
.level-node{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;transition:all .25s;border:3px solid transparent;position:relative;margin:0 auto}
.level-node.done{border-color:var(--lime);background:rgba(200,241,53,.1)}
.level-node.active{border-color:var(--cyan);background:rgba(0,229,255,.08);box-shadow:0 0 24px rgba(0,229,255,.3);animation:float 3s ease infinite}
.level-node.locked{border-color:var(--border);background:var(--card2);opacity:.5;cursor:not-allowed}
.level-conn{width:3px;height:36px;background:var(--border);margin:0 auto}
.level-conn.done{background:linear-gradient(to bottom,var(--lime),var(--cyan))}
`;

/* ── DATA ── */
// REPLACE your existing CHALLENGES constant with this entire block

//CHALLENGES 


// Daily challenge rotates every 24 hours based on the date
// Each daily problem has the same concept in all 7 languages
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

// Pick today's daily problem (rotates daily)
const DAILY_CHALLENGE = (() => {
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  return DAILY_PROBLEMS[seed % DAILY_PROBLEMS.length];
})();

const USERS_LB = [
  {
    id: 1,
    name: "Aarav Shah",
    avatar: "🦊",
    xp: 4820,
    streak: 14,
    solved: 62,
    lang: "Python",
  },
  {
    id: 2,
    name: "Priya Nair",
    avatar: "🐼",
    xp: 4210,
    streak: 9,
    solved: 55,
    lang: "JavaScript",
  },
  {
    id: 3,
    name: "You",
    avatar: "🚀",
    xp: 1340,
    streak: 5,
    solved: 18,
    lang: "Python",
  },
  {
    id: 4,
    name: "Rahul K",
    avatar: "🐉",
    xp: 3900,
    streak: 21,
    solved: 48,
    lang: "Java",
  },
  {
    id: 5,
    name: "Sneha M",
    avatar: "🦋",
    xp: 2750,
    streak: 7,
    solved: 34,
    lang: "Python",
  },
  {
    id: 6,
    name: "Dev R",
    avatar: "🐺",
    xp: 2100,
    streak: 3,
    solved: 27,
    lang: "JavaScript",
  },
];

// Daily challenge rotates every 24 hours based on the date

const INIT_POSTS = [
  {
    id: 1,
    author: "Aarav Shah",
    avatar: "🦊",
    time: "2h ago",
    text: "Anyone else struggling with Python list comprehension bugs? They're sneaky! 🐍",
    likes: 24,
    comments: [
      {
        author: "Priya",
        text: "Yes! The conditional part always trips me up 😅",
      },
    ],
  },
  {
    id: 2,
    author: "Priya Nair",
    avatar: "🐼",
    time: "5h ago",
    text: "Just hit 50 solves! The JavaScript async/await challenges are 🔥 worth it",
    likes: 41,
    comments: [],
  },
  {
    id: 3,
    author: "Sneha M",
    avatar: "🦋",
    time: "1d ago",
    text: "Pro tip: Always check array bounds first when you see a runtime error 💡",
    likes: 67,
    comments: [],
  },
];

const LANG_PATHS = [
  {
    lang: "Python",
    icon: "🐍",
    levels: [
      { e: "🐣", s: "done" },
      { e: "🐛", s: "done" },
      { e: "🔍", s: "active" },
      { e: "⚡", s: "locked" },
      { e: "🔥", s: "locked" },
    ],
  },
  {
    lang: "JavaScript",
    icon: "💛",
    levels: [
      { e: "🌱", s: "done" },
      { e: "🔀", s: "active" },
      { e: "🕵️", s: "locked" },
      { e: "🚀", s: "locked" },
      { e: "🏆", s: "locked" },
    ],
  },
  {
    lang: "Java",
    icon: "☕",
    levels: [
      { e: "👋", s: "active" },
      { e: "🔗", s: "locked" },
      { e: "🧩", s: "locked" },
      { e: "⚙️", s: "locked" },
      { e: "💎", s: "locked" },
    ],
  },
];

const BADGES = [
  {
    id: "streak_3",
    icon: "🔥",
    label: "On Fire",
    desc: "Maintain a 3-day streak",
    check: (u) => (u.streak || 0) >= 3,
  },
  {
    id: "streak_7",
    icon: "🌋",
    label: "7-Day Streak",
    desc: "Maintain a 7-day streak",
    check: (u) => (u.streak || 0) >= 7,
  },
  {
    id: "streak_30",
    icon: "💎",
    label: "Unstoppable",
    desc: "Maintain a 30-day streak",
    check: (u) => (u.streak || 0) >= 30,
  },
  {
    id: "first_solve",
    icon: "🐣",
    label: "First Bug Fixed",
    desc: "Solve your first challenge",
    check: (u) => (u.solved || 0) >= 1,
  },
  {
    id: "solve_10",
    icon: "🌟",
    label: "Bug Hunter",
    desc: "Solve 10 challenges",
    check: (u) => (u.solved || 0) >= 10,
  },
  {
    id: "solve_25",
    icon: "🏅",
    label: "Debugger",
    desc: "Solve 25 challenges",
    check: (u) => (u.solved || 0) >= 25,
  },
  {
    id: "solve_50",
    icon: "🏆",
    label: "Elite Debugger",
    desc: "Solve 50 challenges",
    check: (u) => (u.solved || 0) >= 50,
  },
  {
    id: "python_3",
    icon: "🐍",
    label: "Python Rookie",
    desc: "Solve 3 Python challenges",
    check: (u, langCounts) => (langCounts["Python"] || 0) >= 3,
  },
  {
    id: "python_pro",
    icon: "🐍",
    label: "Python Pro",
    desc: "Solve all 10 Python challenges",
    check: (u, langCounts) => (langCounts["Python"] || 0) >= 10,
  },
  {
    id: "js_3",
    icon: "💛",
    label: "JS Rookie",
    desc: "Solve 3 JavaScript challenges",
    check: (u, langCounts) => (langCounts["JavaScript"] || 0) >= 3,
  },
  {
    id: "js_pro",
    icon: "💛",
    label: "JS Pro",
    desc: "Solve all 10 JavaScript challenges",
    check: (u, langCounts) => (langCounts["JavaScript"] || 0) >= 10,
  },
  {
    id: "java_3",
    icon: "☕",
    label: "Java Rookie",
    desc: "Solve 3 Java challenges",
    check: (u, langCounts) => (langCounts["Java"] || 0) >= 3,
  },
  {
    id: "java_pro",
    icon: "☕",
    label: "Java Pro",
    desc: "Solve all 10 Java challenges",
    check: (u, langCounts) => (langCounts["Java"] || 0) >= 10,
  },
  {
    id: "c_pro",
    icon: "⚙️",
    label: "C Master",
    desc: "Solve all 10 C challenges",
    check: (u, langCounts) => (langCounts["C"] || 0) >= 10,
  },
  {
    id: "cpp_pro",
    icon: "🔷",
    label: "C++ Master",
    desc: "Solve all 10 C++ challenges",
    check: (u, langCounts) => (langCounts["C++"] || 0) >= 10,
  },
  {
    id: "html_pro",
    icon: "🌐",
    label: "HTML Master",
    desc: "Solve all 10 HTML challenges",
    check: (u, langCounts) => (langCounts["HTML"] || 0) >= 10,
  },
  {
    id: "css_pro",
    icon: "🎨",
    label: "CSS Master",
    desc: "Solve all 10 CSS challenges",
    check: (u, langCounts) => (langCounts["CSS"] || 0) >= 10,
  },
  {
    id: "polyglot",
    icon: "🌍",
    label: "Polyglot",
    desc: "Solve at least 1 challenge in every language",
    check: (u, langCounts) =>
      ["Python","JavaScript","Java","C","C++","HTML","CSS"].every(
        (l) => (langCounts[l] || 0) >= 1
      ),
  },
  {
    id: "xp_500",
    icon: "⚡",
    label: "XP Grinder",
    desc: "Earn 500 XP",
    check: (u) => (u.xp || 0) >= 500,
  },
  {
    id: "xp_2000",
    icon: "🚀",
    label: "XP Legend",
    desc: "Earn 2000 XP",
    check: (u) => (u.xp || 0) >= 2000,
  },
  {
    id: "daily_1",
    icon: "📅",
    label: "Daily Debugger",
    desc: "Complete your first daily challenge",
    check: (u) => !!u.lastDailyDate,
  },
  {
    id: "hintless",
    icon: "💡",
    label: "Hint-less",
    desc: "Solve 5 challenges without using a hint",
    check: (u) => (u.hintlessSolves || 0) >= 5,
  },
];

const DEV_QUEUE = [
  {
    id: 1,
    author: "Rahul K",
    avatar: "🐉",
    lang: "Python",
    title: "Wrong sort order",
    code: "arr.sort()\nprint(arr[::-1])",
    status: "pending",
  },
  {
    id: 2,
    author: "Sneha M",
    avatar: "🦋",
    lang: "JavaScript",
    title: "Promise chain bug",
    code: "fetch(url)\n  .then(r => r.text)\n  .then(console.log)",
    status: "pending",
  },
];

/* ── HELPERS ── */

function EmojiRain({ onDone }) {
  const emojis = ["🎉", "✨", "🔥", "💥", "🐛", "⚡", "🏆", "🎊", "💡", "🚀"];
  const p = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    e: emojis[i % emojis.length],
    l: Math.random() * 100,
    d: Math.random() * 1.4,
    dur: 1.8 + Math.random() * 1.2,
  }));
useEffect  (() => {
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <>
      {p.map((x) => (
        <span
          key={x.id}
          className="emoji-particle"
          style={{
            left: `${x.l}%`,
            top: 0,
            animationDelay: `${x.d}s`,
            animationDuration: `${x.dur}s`,
          }}
        >
          {x.e}
        </span>
      ))}
    </>
  );
}

function Av({ emoji, size = 42 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--card2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        flexShrink: 0,
      }}
    >
      {emoji}
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.classList.toggle("light", next === "light");
    localStorage.setItem("debugg-theme", next);
  }
  return (
    <button
      onClick={toggle}
      style={{
        background:
          theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        border: "1.5px solid var(--border)",
        borderRadius: 50,
        padding: "7px 14px",
        color: "var(--text)",
        fontWeight: 800,
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all .2s",
      }}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
/* ── NAV ── */
function Nav({ page, go, user, logout, theme, setTheme }) {
  const userLinks = [
    { id: "dashboard", l: "Home" },
    { id: "levels", l: "Levels" },
    { id: "discuss", l: "Discuss" },
    { id: "leaderboard", l: "Leaderboard" },
    { id: "profile", l: "Profile" },
  ];
  const devLinks = [
    { id: "devdash", l: "Dev Panel" },
    { id: "discuss", l: "Discuss" },
    { id: "leaderboard", l: "Leaderboard" },
  ];
  const links = !user ? [] : user.role === "dev" ? devLinks : userLinks;

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.body.classList.toggle("light", next === "light");
    localStorage.setItem("debugg-theme", next);
  }

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => go("landing")}>
        Debugg<span style={{ color: "var(--lime)" }}>.</span>
      </div>
      <div className="nav-links">
        {links.map((l) => (
          <button
            key={l.id}
            className={`nav-link${page === l.id ? " active" : ""}`}
            onClick={() => go(l.id)}
          >
            {l.l}
          </button>
        ))}
        {user ? (
          <button
            className="btn-sm btn-ghost"
            style={{ marginLeft: 8 }}
            onClick={logout}
          >
            Logout
          </button>
        ) : (
          <>
            <button className="nav-link" onClick={() => go("login")}>
              Login
            </button>
            <button
              className="btn-lime btn-sm"
              style={{ marginLeft: 4 }}
              onClick={() => go("signup")}
            >
              Sign Up
            </button>
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          style={{
            background:
              theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            border: "1.5px solid var(--border)",
            borderRadius: 50,
            padding: "7px 12px",
            color: "var(--text)",
            fontWeight: 800,
            fontSize: 16,
            marginLeft: 8,
            transition: "all .2s",
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
/* ══ LANDING ══ */

/* ══ AUTH ══ */

/* ══ DASHBOARD ══ */

/* ══ CHALLENGE / EDITOR ══ */
function ChallengePage({ challenge, go, setUser, user }) {
  const [selLine, setSelLine] = useState(null);
  const [lines, setLines] = useState([...challenge.lines]);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const [output, setOutput] = useState(null);
  const [hintOn, setHintOn] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true); // ← MOVED UP

  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  function selectLine(i) {
    if (submitted) return;
    setSelLine(i);
    setEditVal(lines[i]);
    setEditing(true);
    setOutput(null);
  }

  function applyFix() {
    if (selLine === null) return;
    const u = [...lines];
    // Support multi-line fixes: split on newline and splice in
    const fixLines = editVal.split("\n");
    u.splice(selLine, 1, ...fixLines);
    setLines(u);
    setEditing(false);
    setOutput(null);
  }

  async function runCode() {
    setStatus("running");
    setOutput(null);

    const langIds = {
      Python: 71,
      JavaScript: 63,
      Java: 62,
      C: 50,
      "C++": 54,
      HTML: null,
      CSS: null,
    };

    const langId = langIds[challenge.lang];

    if (!langId) {
      const isFixed = lines[challenge.bugLine] === challenge.fixed;
      setTimeout(() => {
        if (isFixed) {
          setOutput("✅ " + challenge.expectedOutput);
          setStatus("success");
        } else {
          setOutput("❌ Not fixed yet. Check line " + (challenge.bugLine + 1));
          setStatus("fail");
        }
      }, 600);
      return;
    }

    const sourceCode = lines.join("\n");

    try {
      const submitRes = await fetch(
        "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: sourceCode,
            language_id: langId,
            stdin: "",
          }),
        }
      );

      const result = await submitRes.json();
      const stdout = result.stdout?.trim();
      const stderr = result.stderr?.trim();
      const compileErr = result.compile_output?.trim();
      const statusDesc = result.status?.description;

      if (stdout) {
        const isCorrect = stdout === challenge.expectedOutput.trim();
        if (isCorrect) {
          setOutput(stdout);
          setStatus("success");
        } else {
          setOutput(stdout + "\n\n⚠️ Expected:\n" + challenge.expectedOutput);
          setStatus("fail");
        }
      } else if (stderr) {
        setOutput("❌ Runtime Error:\n" + stderr);
        setStatus("fail");
      } else if (compileErr) {
        setOutput("❌ Compile Error:\n" + compileErr);
        setStatus("fail");
      } else {
        setOutput("⚠️ Status: " + statusDesc);
        setStatus("fail");
      }
    } catch (err) {
      const isFixed = lines[challenge.bugLine] === challenge.fixed;
      if (isFixed) {
        setOutput(challenge.expectedOutput);
        setStatus("success");
      } else {
        setOutput(
          "❌ Bug not fixed yet. Check line " + (challenge.bugLine + 1)
        );
        setStatus("fail");
      }
    }
  }

  async function submit() {
    setTimerActive(false);
    if (status !== "success") return;
    setSubmitted(true);
    setCelebration(true);

    // Calculate streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    let newStreak = 1;
    if (user.lastSolvedDate === today) {
      newStreak = user.streak; // already solved today, keep streak
    } else if (user.lastSolvedDate === yesterday) {
      newStreak = user.streak + 1; // consecutive day
    } else {
      newStreak = 1; // streak broken
    }

    const alreadySolved = (user.solvedChallenges || []).includes(challenge.id);
    const xpGained = alreadySolved ? 0 : challenge.xp;
    const solvedInc = alreadySolved ? 0 : 1;

    // If this is a daily challenge, mark lastDailyDate so they can't redo it today
    const isDailyDone = challenge.isDailyChallenge ? { lastDailyDate: today } : {};

    const updates = {
      xp: user.xp + xpGained,
      solved: user.solved + solvedInc,
      streak: newStreak,
      lastSolvedDate: today,
      solvedChallenges: alreadySolved
        ? user.solvedChallenges
        : [...(user.solvedChallenges || []), challenge.id],
      ...isDailyDone,
    };

    // Persist to Firestore
    try {
      await updateDoc(doc(db, "users", user.uid), updates);
    } catch (e) {
      console.error("Failed to save progress:", e);
    }

    setUser((u) => ({ ...u, ...updates }));
  }

  // Timer color: green → orange → red
  const timerColor =
    seconds > 120
      ? "var(--red)"
      : seconds > 60
      ? "var(--orange)"
      : "var(--green)";
  const timerDisplay = `${Math.floor(seconds / 60)}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

  return (
    <div
      className="page"
      style={{
        paddingTop: 90,
        padding: "90px 24px 60px",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      {celebration && <EmojiRain onDone={() => setCelebration(false)} />}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <button
          style={{
            background: "var(--card2)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            padding: "8px 16px",
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 13,
          }}
          onClick={() => go("dashboard")}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span className={`tag tag-${challenge.difficulty}`}>
              {challenge.difficulty.toUpperCase()}
            </span>
            <span className="tag tag-lang">{challenge.lang}</span>
            <span className="chip">🐛 {challenge.errorType}</span>
          </div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 28 }}>
            {challenge.title}
          </h1>
        </div>

        {/* XP + Timer side by side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 22,
              color: "var(--lime)",
            }}
          >
            +{challenge.xp} XP
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 14,
              fontWeight: 700,
              color: timerColor,
              background: "var(--card2)",
              border: `1.5px solid ${timerColor}`,
              padding: "4px 14px",
              borderRadius: 50,
              transition: "color .5s, border-color .5s",
            }}
          >
            ⏱️ {timerDisplay}
          </div>
        </div>
      </div>

      <p
        style={{
          color: "var(--muted)",
          fontSize: 14,
          marginBottom: 22,
          fontWeight: 600,
          lineHeight: 1.7,
        }}
      >
        👆{" "}
        <strong style={{ color: "var(--text)" }}>Click the buggy line</strong>{" "}
        to select and edit it inline. Run to verify, then Submit.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Code panel */}
        <div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                background: "var(--card2)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "var(--red)",
                }}
              />
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "var(--yellow)",
                }}
              />
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: "var(--green)",
                }}
              />
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--muted)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                bug_challenge.
                {challenge.lang === "JavaScript"
                  ? "js"
                  : challenge.lang === "Java"
                  ? "java"
                  : challenge.lang === "C"
                  ? "c"
                  : challenge.lang === "C++"
                  ? "cpp"
                  : challenge.lang === "HTML"
                  ? "html"
                  : challenge.lang === "CSS"
                  ? "css"
                  : "py"}
              </span>
            </div>
            <div style={{ padding: "16px 8px" }}>
              {lines.map((ln, i) => (
                <span
                  key={i}
                  className={`code-line${selLine === i ? " selected" : ""}${
                    submitted && i === challenge.bugLine ? " correct" : ""
                  }`}
                  onClick={() => selectLine(i)}
                >
                  <span
                    style={{
                      color: "var(--muted)",
                      marginRight: 16,
                      fontSize: 11,
                      userSelect: "none",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    style={{
                      color:
                        i === challenge.bugLine && !submitted
                          ? "var(--red)"
                          : "var(--text)",
                    }}
                  >
                    {ln || " "}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {editing && !submitted && (
            <div className="card" style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>
                ✏️ Edit Line {selLine + 1}
              </div>
              <textarea
                value={editVal}
                onChange={(e) => setEditVal(e.target.value)}
                rows={Math.max(2, editVal.split("\n").length + 1)}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1.5px solid var(--lime)",
                  borderRadius: 10,
                  padding: 12,
                  color: "var(--text)",
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  resize: "vertical",
                  whiteSpace: "pre",
                  overflowWrap: "normal",
                  overflowX: "auto",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-lime btn-sm" onClick={applyFix}>
                  Apply Fix ✓
                </button>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <button
              style={{
                width: "100%",
                background: "rgba(255,235,0,.07)",
                border: "1.5px solid rgba(255,235,0,.2)",
                borderRadius: 12,
                padding: "12px 18px",
                color: "var(--yellow)",
                fontWeight: 800,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={() => setHintOn((v) => !v)}
            >
              💡 {hintOn ? "Hide Hint" : "Show Hint"}
            </button>
            {hintOn && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  background: "rgba(255,235,0,.05)",
                  border: "1px dashed rgba(255,235,0,.2)",
                  borderRadius: 10,
                  color: "var(--yellow)",
                  fontSize: 14,
                  lineHeight: 1.75,
                  fontWeight: 600,
                }}
              >
                {challenge.hint}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
              ⚡ Run & Test
            </div>
            <button
              className="btn-lime"
              style={{
                width: "100%",
                padding: 12,
                fontSize: 14,
                opacity: status === "running" ? 0.6 : 1,
              }}
              onClick={runCode}
              disabled={status === "running"}
            >
              {status === "running" ? "Running..." : "▶ Run Code"}
            </button>
            {output && (
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  background: "var(--bg)",
                  borderRadius: 10,
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  lineHeight: 1.8,
                  border: `1px solid ${
                    status === "success" ? "var(--green)" : "var(--red)"
                  }`,
                  color: status === "success" ? "var(--green)" : "var(--red)",
                }}
              >
                <div
                  style={{
                    marginBottom: 4,
                    fontSize: 11,
                    color: "var(--muted)",
                    fontWeight: 700,
                  }}
                >
                  OUTPUT:
                </div>
                {output}
              </div>
            )}
          </div>

          {!submitted && (
            <button
              className="btn-lime"
              style={{
                padding: 14,
                fontSize: 15,
                opacity: status === "success" ? 1 : 0.35,
              }}
              disabled={status !== "success"}
              onClick={submit}
            >
              🚀 Submit Solution
            </button>
          )}

          {submitted && (
            <div
              className="card"
              style={{
                textAlign: "center",
                border: "2px solid var(--lime)",
                background: "rgba(200,241,53,.05)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontSize: 26,
                  color: "var(--lime)",
                  marginBottom: 4,
                }}
              >
                Bug Squashed!
              </div>
              <div
                style={{
                  color: "var(--muted)",
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                +{challenge.xp} XP earned 🏆
              </div>
              {/* Show final time */}
              <div
                style={{
                  color: timerColor,
                  fontFamily: "var(--mono)",
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              >
                ⏱️ Solved in {timerDisplay}
              </div>
              <button
                  className="btn-lime"
                  onClick={() => go(challenge.returnPage || "dashboard")}
              >
                 Next Challenge →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══ LEVELS ══ */
function Levels({ go, pickChallenge, devChallenges }) {
  const [sel, setSel] = useState(null); // selected language
  const [selTopic, setSelTopic] = useState(null); // selected topic
  const [selDiff, setSelDiff] = useState(null); // selected difficulty
  const [completedLevels, setCompletedLevels] = useState({});

  const TOPICS = [
    { id: "Syntax", label: "Syntax Errors", icon: "📝", color: "var(--cyan)" },
    { id: "Logic", label: "Logic Errors", icon: "🧠", color: "var(--purple)" },
    { id: "Runtime", label: "Runtime Errors", icon: "💥", color: "var(--red)" },
    {
      id: "Compile",
      label: "Compile Errors",
      icon: "⚙️",
      color: "var(--orange)",
    },
    { id: "Exception", label: "Exceptions", icon: "🚨", color: "var(--pink)" },
  ];

  const DIFFICULTIES = [
    { id: "easy", label: "Easy", icon: "🟢", color: "var(--green)" },
    { id: "medium", label: "Medium", icon: "🟡", color: "var(--yellow)" },
    { id: "hard", label: "Hard", icon: "🔴", color: "var(--red)" },
  ];

  const levelEmojis = [
    "🐣",
    "🐛",
    "🔍",
    "⚡",
    "🔥",
    "🎯",
    "💡",
    "🚀",
    "⭐",
    "🏆",
  ];

  // Build language list from devChallenges
  const langGroups = {};
  devChallenges.forEach((c) => {
    if (!langGroups[c.lang]) langGroups[c.lang] = [];
    langGroups[c.lang].push(c);
  });
  const langList = [
    { lang: "Python", icon: "🐍" },
    { lang: "JavaScript", icon: "💛" },
    { lang: "Java", icon: "☕" },
    { lang: "C", icon: "🔵" },
    { lang: "C++", icon: "🟣" },
    { lang: "HTML", icon: "🌐" },
    { lang: "CSS", icon: "🎨" },
  ].filter((l) => langGroups[l.lang]?.length > 0);

  // ── SCREEN 1: Language selection ──
  if (!sel)
    return (
      <div
        className="page"
        style={{
          paddingTop: 90,
          padding: "90px 24px 60px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--display)",
            fontSize: 38,
            marginBottom: 8,
          }}
        >
          Choose Your Language 🗺️
        </h1>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Select a language to start your debugging path.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 20,
          }}
        >
          {langList.map((lp) => {
            const total = langGroups[lp.lang]?.length || 0;
            return (
              <div
                key={lp.lang}
                className="card"
                style={{ cursor: "pointer", textAlign: "center", padding: 32 }}
                onClick={() => {
                  setSel(lp);
                  setSelTopic(null);
                  setSelDiff(null);
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>{lp.icon}</div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 24,
                    marginBottom: 6,
                  }}
                >
                  {lp.lang}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {total} challenges
                </div>
                <button className="btn-lime btn-sm">Start Path →</button>
              </div>
            );
          })}
        </div>
      </div>
    );

  // ── SCREEN 2: Topic selection ──
  if (!selTopic) {
    const langChallenges = langGroups[sel.lang] || [];
    return (
      <div
        className="page"
        style={{
          paddingTop: 90,
          padding: "90px 24px 60px",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <button
          style={{
            background: "var(--card2)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            padding: "8px 16px",
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 28,
          }}
          onClick={() => setSel(null)}
        >
          ← Languages
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 40 }}>{sel.icon}</span>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 34 }}>
            {sel.lang}
          </h1>
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Choose a topic to practice.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {TOPICS.map((topic) => {
            const count = langChallenges.filter(
              (c) => c.errorType === topic.id
            ).length;
            if (count === 0) return null;
            return (
              <div
                key={topic.id}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 28,
                  textAlign: "center",
                  border: `1px solid ${topic.color}22`,
                }}
                onClick={() => setSelTopic(topic)}
              >
                <div style={{ fontSize: 36, marginBottom: 10 }}>
                  {topic.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 20,
                    marginBottom: 6,
                  }}
                >
                  {topic.label}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  {count} challenge{count !== 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "4px 14px",
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 700,
                    background: `${topic.color}18`,
                    color: topic.color,
                  }}
                >
                  Explore →
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SCREEN 3: Difficulty selection ──
  if (!selDiff) {
    const topicChallenges = (langGroups[sel.lang] || []).filter(
      (c) => c.errorType === selTopic.id
    );
    return (
      <div
        className="page"
        style={{
          paddingTop: 90,
          padding: "90px 24px 60px",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <button
          style={{
            background: "var(--card2)",
            border: "1px solid var(--border)",
            borderRadius: 50,
            padding: "8px 16px",
            color: "var(--muted)",
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 28,
          }}
          onClick={() => setSelTopic(null)}
        >
          ← Topics
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 36 }}>{selTopic.icon}</span>
          <div>
            <div
              style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}
            >
              {sel.icon} {sel.lang}
            </div>
            <h1 style={{ fontFamily: "var(--display)", fontSize: 30 }}>
              {selTopic.label}
            </h1>
          </div>
        </div>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          Pick your difficulty level.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 16,
          }}
        >
          {DIFFICULTIES.map((diff) => {
            const count = topicChallenges.filter(
              (c) => c.difficulty === diff.id
            ).length;
            if (count === 0) return null;
            return (
              <div
                key={diff.id}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 32,
                  textAlign: "center",
                  border: `1px solid ${diff.color}33`,
                }}
                onClick={() => setSelDiff(diff)}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {diff.icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 24,
                    marginBottom: 6,
                    textTransform: "capitalize",
                  }}
                >
                  {diff.label}
                </div>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {count} challenge{count !== 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    padding: "5px 16px",
                    borderRadius: 50,
                    fontSize: 12,
                    fontWeight: 800,
                    background: `${diff.color}18`,
                    color: diff.color,
                  }}
                >
                  Start
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── SCREEN 4: Level path ──
  const pathKey = `${sel.lang}-${selTopic.id}-${selDiff.id}`;
  const challenges = (langGroups[sel.lang] || []).filter(
    (c) => c.errorType === selTopic.id && c.difficulty === selDiff.id
  );
  const done = completedLevels[pathKey] || 0;

  function handleLevelClick(index) {
    if (index > done) return;
    const c = challenges[index];
    if (!c) return;
    pickChallenge({
      ...c,
      onComplete: () => {
        setCompletedLevels((prev) => ({
          ...prev,
          [pathKey]: Math.max(prev[pathKey] || 0, index + 1),
        }));
      },
    });
    go("challenge");
  }

  return (
    <div
      className="page"
      style={{
        paddingTop: 90,
        padding: "90px 24px 60px",
        maxWidth: 480,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <button
        style={{
          background: "var(--card2)",
          border: "1px solid var(--border)",
          borderRadius: 50,
          padding: "8px 16px",
          color: "var(--muted)",
          fontWeight: 700,
          fontSize: 13,
          marginBottom: 24,
        }}
        onClick={() => setSelDiff(null)}
      >
        ← Difficulty
      </button>

      <div style={{ fontSize: 40, marginBottom: 6 }}>{selTopic.icon}</div>
      <div
        style={{
          color: "var(--muted)",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {sel.icon} {sel.lang} · {selTopic.label}
      </div>
      <h2
        style={{
          fontFamily: "var(--display)",
          fontSize: 30,
          marginBottom: 6,
          textTransform: "capitalize",
        }}
      >
        {selDiff.label} Path
      </h2>
      <p
        style={{
          color: "var(--muted)",
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        {done} / {challenges.length} levels completed 🔥
      </p>

      {/* Progress bar */}
      <div className="xp-bar" style={{ maxWidth: 300, margin: "0 auto 40px" }}>
        <div
          className="xp-fill"
          style={{
            width: `${
              challenges.length > 0 ? (done / challenges.length) * 100 : 0
            }%`,
          }}
        />
      </div>

      {/* Level nodes */}
      {challenges.map((c, i) => {
        const isDone = i < done;
        const isActive = i === done;
        const isLocked = i > done;
        const nodeClass = isDone ? "done" : isActive ? "active" : "locked";
        const emoji = levelEmojis[i % levelEmojis.length];

        return (
          <div key={c.id || i}>
            <div
              className={`level-node ${nodeClass}`}
              onClick={() => handleLevelClick(i)}
              title={
                isLocked
                  ? "Complete previous level first"
                  : isActive
                  ? "Current level — click to play!"
                  : `Completed! ${c.title}`
              }
            >
              <span style={{ fontSize: 22 }}>{emoji}</span>
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "var(--cyan)",
                    color: "#0a0a12",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "2px 6px",
                    borderRadius: 50,
                  }}
                >
                  NOW
                </span>
              )}
              {isDone && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "var(--lime)",
                    color: "#0a0a12",
                    fontSize: 10,
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </span>
              )}
              {isLocked && (
                <span style={{ position: "absolute", fontSize: 16 }}>🔒</span>
              )}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginTop: 4,
                marginBottom: 4,
                color: isDone
                  ? "var(--lime)"
                  : isActive
                  ? "var(--cyan)"
                  : "var(--muted)",
              }}
            >
              {isDone || isActive ? c.title : "???"}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--muted)",
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              {isDone || isActive ? `+${c.xp} XP` : ""}
            </div>
            {i < challenges.length - 1 && (
              <div
                className={`level-conn${isDone ? " done" : ""}`}
                style={{ margin: "4px auto" }}
              />
            )}
          </div>
        );
      })}

      {/* Completion message */}
      {done === challenges.length && challenges.length > 0 && (
        <div
          className="card"
          style={{
            marginTop: 32,
            textAlign: "center",
            border: "2px solid var(--lime)",
            background: "rgba(200,241,53,.05)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 22,
              color: "var(--lime)",
              marginBottom: 8,
            }}
          >
            {selDiff.label} {selTopic.label} Mastered!
          </div>
          <div style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>
            All {challenges.length} levels cleared. Amazing! 🎉
          </div>
        </div>
      )}
    </div>
  );
}

/* ══ LEADERBOARD ══ */

/* ══ DISCUSS ══ */

/* ══ PROFILE ══ */

/* ══ DEV DASHBOARD ══ */

/* ══ DAILY CHALLENGE ══ */

/* ══ ROOT ══ */
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState<AppUser | null>(null);
  const [challenge, setChallenge] = useState<ChallengeType | null>(null);
  const [communityUploads, setCommunityUploads] = useState<CommunityUpload[]>([]);
  const [devChallenges, setDevChallenges] = useState<ChallengeType[]>(CHALLENGES);
  const { theme, setTheme } = useTheme();
  //const location = useLocation();

  useAuth(setUser, setPage);

  // Load dev-published challenges from Firestore in real-time
 useEffect (() => {
    /*const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setDevChallenges([...CHALLENGES, ...docs]);
    });
    return () => unsub();*/
  }, []);

  // Load community uploads (user submissions) from Firestore in real-time
  useEffect(() => {
    /*const q = query(
      collection(db, "submissions"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setCommunityUploads(docs);
    });
    return () => unsub();*/
  }, []);

  const go = useNavigation(user, setPage);
useAuth(setUser, setPage);

  async function logout() {
    await signOut(auth);
    setUser(null);
    setPage("landing");
  }

  return (
    <>
      <style>{STYLES}</style>
      <Nav
        page={page}
        go={go}
        user={user}
        logout={logout}
        theme={theme}
        setTheme={setTheme}
      />
      {page === "landing" && <Landing go={go} />}
      {page === "login" && <Auth mode="login" go={go} setUser={setUser} />}
      {page === "signup" && <Auth mode="signup" go={go} setUser={setUser} />}
      {page === "devlogin" && (
        <Auth mode="devlogin" go={go} setUser={setUser} />
      )}
      {page === "dashboard" && user && (
        <Dashboard
          user={user}
          go={go}
          pickChallenge={setChallenge}
          communityUploads={communityUploads}
        />
      )}
      {page === "challenge" && user && challenge && (
        <Challenge
          challenge={challenge}
          go={go}
          setUser={setUser}
          user={user}
        />
      )}
      {page === "levels" && user && (
        <Levels
          user={user}
          go={go}
          pickChallenge={setChallenge}
          devChallenges={devChallenges}
        />
      )}
      {page === "leaderboard" && user && <Leaderboard />}
      {page === "discuss" && user && <Discuss user={user} />}
      {page === "profile" && user && (
        <Profile
          user={user}
          setUser={setUser}
          onUpload={(u) => setCommunityUploads((prev) => [...prev, u])}
        />
      )}
      {page === "devdash" && user && (
        <DevDashboard onPublish={(c) => setDevChallenges((prev) => [...prev, c])} />
      )}
    </>
  );
}