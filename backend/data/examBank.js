//PranceBank
let examBank = [
  { id: "00000001", type: "Single Choice", Question: "2+2=__", A: "3", B: "4", C: "5", D: "6", E: "", correctAnswer: "B", description: "Simple addition problem.", inCorrectCount: 0 },
  { id: "00000002", type: "Single Choice", Question: "5-3=__", A: "1", B: "2", C: "3", D: "4", E: "", correctAnswer: "B", description: "Basic subtraction.", inCorrectCount: 0 },
  { id: "00000003", type: "Single Choice", Question: "10÷2=__", A: "3", B: "4", C: "5", D: "6", E: "", correctAnswer: "C", description: "Division example.", inCorrectCount: 0 },
  { id: "00000004", type: "Single Choice", Question: "6×3=__", A: "12", B: "15", C: "18", D: "20", E: "", correctAnswer: "C", description: "Multiplication task.", inCorrectCount: 0 },
  { id: "00000005", type: "Single Choice", Question: "9+1=__", A: "8", B: "9", C: "10", D: "11", E: "", correctAnswer: "C", description: "Another addition question.", inCorrectCount: 0 },
  { id: "00000006", type: "Filling Blank", Question: "3+3=__", A: "", B: "", C: "", D: "", E: "", correctAnswer: "6", description: "Simple addition to fill in.", inCorrectCount: 0 },
  { id: "00000007", type: "Filling Blank", Question: "7-2=__", A: "", B: "", C: "", D: "", E: "", correctAnswer: "5", description: "Simple subtraction, fill the answer.", inCorrectCount: 0 },
  { id: "00000008", type: "Filling Blank", Question: "4×2=__", A: "", B: "", C: "", D: "", E: "", correctAnswer: "8", description: "Fill in the multiplication result.", inCorrectCount: 0 },
  { id: "00000009", type: "Filling Blank", Question: "9÷3=__", A: "", B: "", C: "", D: "", E: "", correctAnswer: "3", description: "Division question to complete.", inCorrectCount: 0 },
  { id: "00000010", type: "Filling Blank", Question: "8+4=__", A: "", B: "", C: "", D: "", E: "", correctAnswer: "12", description: "Addition question to fill in.", inCorrectCount: 0 },
  { id: "00000011", type: "Multiple Choice", Question: "Even numbers in [2, 3, 4, 5]?", A: "2", B: "3", C: "4", D: "5", E: "", correctAnswer: "AC", description: "Select all the even numbers.", inCorrectCount: 0 },
  { id: "00000012", type: "Multiple Choice", Question: "Prime numbers in [2, 4, 5, 6]?", A: "2", B: "4", C: "5", D: "6", E: "", correctAnswer: "AC", description: "Prime numbers are those with exactly two divisors.", inCorrectCount: 0 },
  { id: "00000013", type: "Multiple Choice", Question: "Numbers greater than 2 in [1, 2, 3, 4]?", A: "1", B: "2", C: "3", D: "4", E: "", correctAnswer: "CD", description: "Find numbers greater than 2.", inCorrectCount: 0 },
  { id: "00000014", type: "Multiple Choice", Question: "Odd numbers in [1, 2, 3, 4]?", A: "1", B: "2", C: "3", D: "4", E: "", correctAnswer: "AC", description: "Identify the odd numbers.", inCorrectCount: 0 },
  { id: "00000015", type: "Multiple Choice", Question: "Factors of 6 in [1, 2, 3, 4]?", A: "1", B: "2", C: "3", D: "4", E: "", correctAnswer: "ABC", description: "Factors of a number divide it exactly.", inCorrectCount: 0 },
  { id: "00000016", type: "Judgements", Question: "5+5=10", A: "", B: "", C: "", D: "", E: "", correctAnswer: "True", description: "True or False: Basic addition check.", inCorrectCount: 0 },
  { id: "00000017", type: "Judgements", Question: "10-3=8", A: "", B: "", C: "", D: "", E: "", correctAnswer: "False", description: "Simple subtraction check.", inCorrectCount: 0 },
  { id: "00000018", type: "Judgements", Question: "2×3=6", A: "", B: "", C: "", D: "", E: "", correctAnswer: "True", description: "Simple multiplication check.", inCorrectCount: 0 },
  { id: "00000019", type: "Judgements", Question: "10÷2=4", A: "", B: "", C: "", D: "", E: "", correctAnswer: "False", description: "Check if the division result is correct.", inCorrectCount: 0 },
  { id: "00000020", type: "Judgements", Question: "8+2=10", A: "", B: "", C: "", D: "", E: "", correctAnswer: "True", description: "Check simple addition.", inCorrectCount: 0 },
  ];


  
module.exports = examBank;