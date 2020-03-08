//Budget Controller
var budgetController = (function(){
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;  
        this.percentage = -1;
    };
    //This is the method we are adding to the constructor. Instead of adding it inside of the constructor,
    //we are gonna add it to its prototype. Because of this, all the objects that are created through this prototype,
    //wiil then inherit this method because of the prototype chain
    //calPercentage is the new method.
    //we need something in order to calculate the percentages, so we'll pass in total income 
    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
        this.percentage = ((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    };
    //This method will return the percentage.  It was created above, below it will be returned
    Expense.prototype.getPercentage = function() {
        return this.percentage;
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

        //adding another public method that will help us delete an item 
        deleteItem: function(type, id){
            var ids, index;
            //we need to create an array with all of the ID numbers and then 
            //find our what the index of our inp ut ID is. Or the index of the ID we want to remove.
            //We are going to loop through the income or expenses array 
            //map method allows us to return a new array
            //current has access to the current element and the current array  
            ids = data.allItems[type].map(function(current) {
                    return current.id;
            });
            //time to find the index
            //indexOf returns the index number of the element of the array that is inputted 
            index = ids.indexOf(id);
            //then we delete the index item from the array 
            if (index !== -1){
                data.allItems[type].splice(index, 1)
            }
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
        //Public method 
        calculatePercentages: function(){
            //we need to calculate the expense % for of the expense objects that are stored in the expenses array
            data.allItems.exp.forEach(function(cur){
                //the callback function specifies what we want to happen to each array
                //What we want to happened to each of the elements is to call the calcPercentage method
                cur.calcPercentage(data.totals.inc);  //Need to pass data.totals.inc
            });
        },

        //now we add another get method, but this time for percentages
        getPercentages: function(){
            //we need to loop over all of the expenses and thats because we want to call the getPercentage method on each of our objects
            //We will use the map method because not only do we want to loop, but we also want to return something and store it 
          // cur = current  
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
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
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLaber: '.item__percentage'
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

            html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>
            <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> 
            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>`;
           } else if (type === 'exp') {
            element = DOMstrings.expensesContainer;
              
            html = `<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div>
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
        //Method to remove items from the UI
        //the id we will be passing into selectorID will be itemID since we just dont want the type or id, we 
        //want it all
        deleteListItem: function(selectorID){
            //we have to move up in the dom in order to delete the child method.
            //in JS we cannot remove an element, we can only remove a child
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);

        },

        //New method so we can clear the fields 
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //queryselectorAll returns a list, not an array, so we need to trick JS into converting the list 
            //into an arry. For that, we will use the slice method, which will return a coopy of the array. 
            //We have to use the slice method, using a call method and then passing a fields variable into it so that
            //it becomes a this variable
            var fieldsArr = Array.prototype.slice.call(fields);

            //adding a little callback function
            //The callback function is called to supply each of the elements in the array 
            //the CB function can recieve up to 3 arguments. (1. access to the current value of the array that is currently being procesed,
            // 2. index number, 3. also access to the entire array )
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            //This clears it
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
        //new method to display the percentages update
        displayPercentages: function(percentages){
            //we need to use queryselectorall since queryselector only selects the first one
            //This will return a Node list
            var fields = document.querySelectorAll(DOMstrings.expensesPercLaber)
            //we could try and use the slice method, but it will not work 

            //we will pass in the nodelist and a call back function for nodeListForEach function
            var nodeListForEach = function(list, callback){
                    //this function will be a for loop in which each iteration is gonna callback our callback function
                    for (var i = 0; i < list.length; i++){
                        //the parameters for this callback function is current and index (line 254)
                        callback(list[i], i)
                    }
            };
            //The function is assignef to the callback argument in line 246
            nodeListForEach(fields, function(current, index){
                //Do stuff
                //first element we want the first percentage, second element, etc...
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = percentages[index] + '---';
                }
            });

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

    //Adding this and using container because it is the first element (parent) that both income and expenses
    //have in common. We did this because we want to set event delegation. The finction that will be 
    //attached to the container is ctrlDeleteItem
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
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
};

var updatePercentages = function(){
    //1. Calculate the percentages
    budgetCtrl.calculatePercentages();

    //2. Read percentages from the budget controller
       var percentages = budgetCtrl.getPercentages();
    //3. Update the UI with the new percentages, we get it from the previous variablr
    UICtrl.displayPercentages(percentages);

};
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
       //6. Calculate and update the percentages
       updatePercentages();
    };
//we'll need to pass the event object because we want access to it.
//we pass event because we want to know what the target is
    var ctrlDeleteItem = function(event){
        var itemID, splitID;
        //event.target tells us where the event(click) happened.
        //We then moved up in the DOM thanks to parentNode, until we are able to retrieve the ID and store it in itemID
        //itemID is key because it will tell us what the item type is and will also tell us what the IT is. We then isolate
        //each of these items, using the split method for the string
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if (itemID){
            //Remember strings are primitives and not objects
            //inc-1 we'll need to brek this is up. 
            splitID = itemID.split('-');
            type = splitID[0];
            //we had to add parseInt
            ID = parseInt(splitID[1]);

            //Thanks to the above, now we can delete items from DB and UI

            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            //this is why we created a separate function for updateBudget; we would be using it more than once
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();

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