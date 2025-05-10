'use strict';

var login = require('./login');
var search = require('./search');

login.init();
search.init();

function formatFractions(quantityText) {
	var words = quantityText.split(' ');
	var fractionRegex = /[1-9][0-9]*\/[1-9][0-9]*/g;
	return words.map(function (word) {
		return fractionRegex.test(word) ? word.replace('/', '&frasl;') : word;
	}).join(' ');
}

function boldIngredientsInText(text, ingredientNames) {
	var result = text;
	ingredientNames.forEach(function (ingredientName) {
		var regex = new RegExp('(' + ingredientName + ')', 'ig');
		result = text.replace(regex, `<b>$1</b>`);
	});
	return result;
}

function prepareRecipeModal(recipe, recipeName) {
	var $modalTitle = $('#recipe-modal .modal-title');
	var $modalBody = $('#recipe-modal .modal-body');
	var HTML = '',
		ingredientsHTML = '',
		stepsHTML = '';
	var step, stepImage, ingedient;

	var ingredientNames = [];
	for (var ingredientName in recipe.ingredients) {
		ingredientNames.push(ingredientName);
		ingedient = recipe.ingredients[ingredientName];
		ingredientsHTML += `<li class="${ingedient.isBasic ? 'basic' : ''} ingredient" data-value="${ingredientName}" 
								data-quantity="${ingedient.quantity}" data-addToList="${!ingedient.isBasic}">
								${formatFractions(ingedient.quantity) + ' ' + ingredientName}
							</li>`;
	}

	for (var stepIndex in recipe.steps) {
		step = recipe.steps[stepIndex];
		stepImage = step.image ? `<img class="step-image" src="${step.image}"/>` : `<div class="empty-step-image">${parseInt(stepIndex) + 1}</div>`;
		stepsHTML += `<div class="step-block">
					${stepImage}
					<h3>${parseInt(stepIndex) + 1}. ${step.title}</h3>
					<p>${boldIngredientsInText(formatFractions(step.text), ingredientNames)}</p>
				</div>`;
	}

	HTML = `<div class="recipe-wrapper">
				<div class="ingredients-block">
					<h3>Ingredients</h3>
					<ul>
						${ingredientsHTML}
					</ul>
					<button class="add-recipe-to-list" type="button">Add <span class="green"></span> to Grocery List</button>
				</div>
				<div class="step-blocks">
					${stepsHTML}
				</div>
			</div>`;

	$modalBody.html(HTML);
	$modalTitle.text(recipeName);
}

function generateListHTML(list, tags) {
	if (list) {
		$('.list-wrapper').empty();
		var HTML = '';
		var $itemName = '';
		var tagsHTML = '';
		for (var itemName in list) {
			$itemName = '<span class="item-name">' + itemName + '</span>';
			tagsHTML = '';

			for (var tagName in tags) {
				var taggedItem = tags[tagName];
				if (taggedItem[itemName]) {
					tagsHTML += `<span class="list-item-tag" data-value="${tagName}">${tagName}</span>`;
				}
			}

			HTML += `<div class="list-item" data-name="${itemName}" data-value='${JSON.stringify(list[itemName])}'>
								<div class="item-details">
									${$itemName}
								</div>
								<div class="list-item-tags">
									${tagsHTML}
								</div>
							</div>`;
		}

		$('.list-wrapper').html(HTML);
		search.filterResults();
	}
}

$('body').on('user-sign-in', function () {
	firebase.database().ref('/recipeTags').on('value', function (snapshot) {
		var tags = snapshot.val();
		search.generateTagFilterHTML(tags);

		firebase.database().ref('/recipes').on('value', function (snapshot) {
			var recipes = snapshot.val();
			generateListHTML(recipes, tags);
		});

	});
});

// Trigger recipe modal
$('body').on('click', '.list-item', function () {
	var recipeName = $(this).data('name');
	var recipeData = $(this).data('value');
	prepareRecipeModal(recipeData, recipeName);
	$('#recipe-modal').modal('show');
});

// Click event for ingredient
$('body').on('click', '.ingredient', function () {
	var $ingredient = $(this);
	var shouldAddToList = $ingredient.attr('data-addToList') === 'true';
	$ingredient.attr('data-addToList', !shouldAddToList);
});

// var testData = {
// 	"Cauliflower Tacos": {
// 		"ingredients": {
// 			"Cauliflower": {
// 				"quantity": "1"
// 			},
// 			"Chickpeas": {
// 				"quantity": "1 cup"
// 			},
// 			"Chili Powder": {
// 				"quantity": "1/4 teaspoon",
// 				"isBasic": true
// 			},
// 			"Dried Oregano": {
// 				"quantity": "1/4 teaspoon",
// 				"isBasic": true
// 			},
// 			"Ground Cumin": {
// 				"quantity": "1/4 teaspoon",
// 				"isBasic": true
// 			},
// 			"Lime": {
// 				"quantity": "1"
// 			},
// 			"Red Onion": {
// 				"quantity": "1"
// 			},
// 			"Red Wine Vinegar": {
// 				"quantity": "1/2 cup"
// 			},
// 			"Sour Cream (DF)": {
// 				"quantity": "2 tablespoons"
// 			},
// 			"Sugar": {
// 				"quantity": "1 teaspoon",
// 				"isBasic": true
// 			},
// 			"Tortillas": {
// 				"quantity": "6"
// 			}
// 		},
// 		"steps": [{
// 			"image": "",
// 			"text": "Preheat oven to 450F. Bring a medium pot of water to a boil over high heat.",
// 			"title": "Prepare ingredients"
// 		},
// 		{
// 			"image": "https://i.imgur.com/illHJ3L.jpg",
// 			"text": "Preheat oven to 450F. Bring a medium pot of water to a boil over high heat.",
// 			"title": "Prepare ingredients"
// 		},
// 		{
// 			"image": "",
// 			"text": "Preheat oven to 450F. Bring a medium pot of water to a boil over high heat.",
// 			"title": "Prepare ingredients"
// 		},
// 		{
// 			"image": "",
// 			"text": "<b>Bold</b> <u>underline</u> <i>italics</i>Preheat oven to 450F. Bring a medium pot of water to a boil over high heat.",
// 			"title": "Prepare ingredients"
// 		}]
// 	}
// };
// generateListHTML(testData);
// prepareRecipeModal(testData[Object.keys(testData)[0]], Object.keys(testData)[0]);
// $('#recipe-modal').modal('show');
