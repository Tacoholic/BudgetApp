
//Budget Controller
var budgetController = (function(){
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;  
    }
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;  
    }

    var calculateTotal = function(type, ){
            var sum = 0;
            data.allItems[type].forEach(function(cur) {
                    sum += cur.value;
            });
            data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
                var newItem, ID;
                //Create new ID 
                if (data.allItems[type].length > 0) {
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0;
                }
                //Create new item based on 'inc' or 'exp'
                if (type === 'exp'){
                     newItem = new Expense(ID, des, val);   
                } else if (type === 'inc'){
                    newItem  = new Income(ID, des, val);
                }
                //Push it into the new Data strutcure
                data.allItems[type].push(newItem);

                //Return it to the new element
                return newItem;
        },

        //creating a public method that calculates the budget 
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
           
            data.budget = data.totals.inc - data.totals.exp; 

            //calculate the percentage of income we spent 

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        //This is the method that returns the budget(calulate budget)
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    };

})();

//UI Controller
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list', 
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value ',
        incomeLabel: 'budget__income--value',
        expensesLabel: 'budget__expenses--value',
        percentageLabel: 'budget__expenses--percentage'
    };
    return {
        getInput: function(){
            return {
             type: document.querySelector(DOMstrings.inputType).value, //Will be either inc (income) or exp (expense)
             description: document.querySelector(DOMstrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            //create HTML string with some placeholder text
           if (type === 'inc'){
            element = DOMstrings.incomeContainer; 

            html = `<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div>
            <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> 
            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>`;
           } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
              
            html = `<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div>
                <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`;
            }
            
            //replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value); 
  
            
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //New method so we can clear the fields 
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //queryselector all returns a list, not an array, so we need to trick JS into converting the list 
            //into an arry. For that, we will use the slice method, which will return a coopy of the array. 
            //We have to use the slice method, using a call method and then passing a fields variable into it so that
            //it becomes a this variable
            var fieldsArr = Array.prototype.slice.call(fields);

            //adding a little callback function
            //The callback function is called to supply each of the alements in the array 
            //the CB function can recieve up to 3 arguments. (1. access to the current value of the array that is currently being procesed,
            // 2. index number, 3. also access to the entire array )
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        getDOMstrings: function(obj){
            return DOMstrings;
        }
    }
 
})(); 

//Global App Controller
var controller = (function(budgetCtrl, UICtrl){

var setupEventListeners = function(){
    var DOM = UICtrl.getDOMstrings();  
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event){
        if (event.keyCode === 13 || event.which === 13){
         ctrlAddItem();   
        }
    });
};


//to update and calculate the budget, we are going to create a seperate function, instead of addinf the methods to ctrlAddItem
//this also helps us avoid repeating the code, since we'll need it for deleting an item 

var updateBudget = function(){
    //1 Calculate the budget 
    budgetCtrl.calculateBudget();
    //2. Method tht will return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
}
  
var ctrlAddItem = function(){
    var input, newItem;

 //Todo list of what we want to happen as soon as someone hits the button
       //1.Get the field input data
       var input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        //2. Add Item to the button controller
         var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //3. Add Item the the UI
        UICtrl.addListItem(newItem, input.type)
         //4. Clear the fields
        UICtrl.clearFields();
        //5. Calculate and update budget 
        updateBudget();
       }
    };
    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }; 
})(budgetController, UIController);

controller.init();