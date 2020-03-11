//Budget Controller
var budgetController = (function(){
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;  
        this.percentage = -1;
    };
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

    //Data structure
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

        //Public method that will help us delete an item 
        deleteItem: function(type, id){
            var ids, index; 
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
        //Public method to calculate percentages
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        //now we add another get method, but this time for percentages
        getPercentages: function(){
          // cur = current value
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
        expensesPercLaber: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    //New method that will output the formatted number. 
    var formatNumber = function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2); 
        numSplit = num.split('.')

        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0,int.length -3) + ',' + int.substr(int.length-3, 3); //if input=2310, output=2,310
        }
        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + '' + int + '.' + dec;
    };
      var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
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
            //Instead of just passing the object value, we'll pass the result of formatting the number
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));          
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        //Method to remove items from the UI
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
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){

            obj.budget > 0 ? type == 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        //new method to display the percentages update
        displayPercentages: function(percentages){
            //This will return a Node list
            var fields = document.querySelectorAll(DOMstrings.expensesPercLaber)
            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = percentages[index] + '---';
                }
            });

        },
        //Method so we can display month 
        displayMonth: function() {
            var now, year, month;
                now = new Date();
                months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                month = now.getMonth();
                year = now.getFullYear();
                document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        //METHOD THAT ALLOWS US TO DO SOME STYLE MANIUPULATIONS
        changedType: function(){
            //This returns a nodelist
            var fields = document.querySelectorAll(
                DOMstrings.inputType, + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); 
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

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    //This event changes the color 
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
};


//Seprate function we created instead of adding it to ctrlAddItem
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
    var ctrlDeleteItem = function(event){
        var itemID, splitID;
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        if (itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();

        }
    };
    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
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