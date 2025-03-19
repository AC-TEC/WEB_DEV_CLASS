//----------- SELECT BUTTONS ------------------


const numberButtons = document.querySelectorAll(".number");     
const operatorButtons = document.querySelectorAll(".operator")
const equalsButton = document.querySelector(".equals")

//clear button (extra)
const clearButton = document.querySelector(".clear")

//history button (extra)
const historyButton = document.querySelector(".history")


//----------- DISPLAY --------------------------



//data object that keeps track of numbers entered by user
const data = {
    runningSum: "",
};


//Updates the display
function updateView(elementId) {
    //assigns runningSum value to textContent
    document.getElementById(elementId).textContent = data.runningSum;
    console.log("updating view", data.runningSum);
}

//appends value to runningSum string
//calls updatedView function to display updated sum on display
function updateRunningSum(value) {
    data.runningSum += value;
    updateView("display");
}

//clears display
function clearDisplay(){
    data.runningSum = "";
    updateView("display");
}


//creates an empty array to store past calculations
const history = [];

//displays calculator history
function viewHistory(){
    if (history.length === 0) {
        alert("History is empty.");
    } else {
        alert("History:\n" + history.join("\n"));
    }
}



//-------- EVENT LISTENERS FOR BUTTONS ----------



//Event listeners for number buttons
numberButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        updateRunningSum(e.target.textContent);
    });
});

//Event listeners for operator buttons
operatorButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        updateRunningSum(e.target.textContent);
    });
});


//Event listener for = button
equalsButton.addEventListener("click",  () => calcExpression())


//Event listener for AC (clear) button
clearButton.addEventListener("click",  () => clearDisplay())


//Event listener for History button
historyButton.addEventListener("click",  viewHistory);


//----------- CREATING EXPRESSION TREE ------------------



class Node {
    constructor(val = null, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}


//function to convert infix to postfix
function infixToPostfix(expression) {
    //store using stack 
    let output = [];
    let operators = [];

    //for operators
    let priority = { "+": 1, "-": 1, "*": 2, "/": 2 };

    //handle multi digit nums
    let multiDigit = ""; 

    //iterate through given expression
    for (let char of expression) {

        //check if char is a number, if so then add to multiDigit
        if (!isNaN(char)) {
            //add to multiDigit
            multiDigit += char;

        } else {
            //handles when char is not a number (for operators)

            //check if multiDigit has num
            if (multiDigit) {
                //push full num to stack
                output.push(multiDigit);

                //reset for next num
                multiDigit = "";
            }

            
            if (char in priority) {
                //if op has >= priority then pop it from operator stack and push to output stack
                while (operators.length && priority[operators[operators.length - 1]] >= priority[char]) {
                    output.push(operators.pop());
                }

                //push current op to operators stack
                operators.push(char);
            }
        }
    }

    //ensure all numbers pushed to ouput stack even if loop ends
    if (multiDigit) {
        output.push(multiDigit);
    }

    //ensure all operators added to output stack and in correct order
    while (operators.length) {
        output.push(operators.pop());
    }

    return output;

    /*
        run down for me:
        1+2*3

        1 = added to multiDigit
        + = 1 pushed to output[], push + to operators[] -> output[1] operators[+]
        2 = added to multiDigit
        * = 2 pushed to output[], push * to operators[]  -> output[1,2] operators[+,*]
        3 = added to multidigit, loop ends, if statement adds 3 to output[] -> output[1,2,3]

        while loop pops operators[+,*] and pushes to output[1,2,3] 

        result output[] = [1,2,3,*,+]

    */
}





//Creates the expression tree
function expressionTree(expression){
    //store using stack
    let stack = [];
    let operators = new Set(["+", "-", "*", "/"]);

    //iterate through given expression
    for (let char of expression) {
        //check if char is not an operator (meaning its a number)
        if (!operators.has(char)) {
            //push number
            stack.push(new Node(char)); 
        } else {
            //check if we have enough numbers for expression
            if (stack.length < 2) {
                console.error("Error: Not enough nums for operation:", char);
                return null;
            }

            let right = stack.pop();
            let left = stack.pop();

            //create a subtree(operator at root) and push to stack[]
            stack.push(new Node(char, left, right));
        }
    }

    //check if final expression is valid (valid should form 1 tree meaning only 1 node in stack[])
    if (stack.length !== 1) {
        console.error("Error: Invalid format");
        return null;
    }

    return stack.pop();

    /*
        run down for me:
        
        1+2*3
        
        infixToPostfix

        expression: [1,2,3,*,+]

        1 = push to stack[] -> stack[ node(1) ]
        2 = push to stack[] -> stack[ node(1), node(2) ]
        3 = push to stack[] -> stack[ node(1), node(2), node(3) ]
        * = else statement -> pop node(3) will be right & node(2) will be left -> create new node(*,2,3) -> stack[ node(1), node(*) ]
        + = else state -> pop node(*) will be right & node(1) will be left -> creat new node(+,1,*) -> stack[ node(+) ]

        Final = node(+) contains expression in correct order for final evaluation [correct: (2x3)+1 = 7] instead of [wrong: 1+2*3=9]

    */



}   



//Evalutes expression tree
function evalTree(node){
    //check if node is a number (Base case)
    if(!node.left && !node.right){
        //returns number (parseInt converts string to number)
        //Using parseFloat() instead of parseInt() to display decimal numbers if we get them as a result from performing an operation
        return parseFloat(node.val);
    }

    //Recursively go through left and right subtrees
    let left_TreeValue = evalTree(node.left);
    let right_TreeValue = evalTree(node.right);

    //Apply the operator
    switch(node.val){
        case "+":
            return left_TreeValue + right_TreeValue;
        case "-":
            return left_TreeValue - right_TreeValue;
        case "*":
            return left_TreeValue * right_TreeValue;
        case "/":
            return left_TreeValue / right_TreeValue;
    }
}



//----------- CALCULATE EXPRESSION ------------------



function calcExpression(){
    //check if runningsum is empty
    if(!data.runningSum){
        //nothing entered. we do nothing and exit
        return;
    }

    //try-catch to handle errors
    try{
        //remove spaces from expression to not mess up iteration in expression tree
        let expression = data.runningSum.replace(/\s+/g, "");

        //convert expression to postfix
        let postfixExpression = infixToPostfix(expression);

        //build tree
        let expTree = expressionTree(postfixExpression);
        

        if (!expTree) {
            throw new Error("Invalid expression tree");
        }

        //evaluate tree
        let finalAnswer = evalTree(expTree);

        // Store the history (expression and result)
        history.push(`${data.runningSum} = ${finalAnswer}`);

        //store answer and display
        data.runningSum = finalAnswer.toString();
        updateView("display");

    } catch(error){
        data.runningSum = "ERROR";
        updateView("display");
        console.error("Expression Error:", error);
    }
}

